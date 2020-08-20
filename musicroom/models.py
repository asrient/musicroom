from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
import datetime
from django.utils import timezone
from musicroom.settings import STORAGE_URLS


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """

    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('name', email.split('@')[0])
        user = self.model(
            email=email, last_seen=timezone.now(), **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff = True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser = True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(
        verbose_name='Email',
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=100)
    first_name = None
    last_name = None
    last_seen = models.DateTimeField()
    room_joined_on = models.DateTimeField(null=True, default=None)
    room = models.ForeignKey(
        'Room', on_delete=models.SET_NULL, related_name="members", null=True, default=None)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def seen_now(self, save=True):
        self.last_seen = timezone.now()
        if save:
            self.save()

    def get_friends(self):
        # returns both catagory 3 and 1
        friends = Friendship.objects.filter(
            Q(user1=self) | Q(user2=self, is_accepted=True))
        List = []
        for friend in friends:
            if friend.user1 == self:
                List.append(friend.user2)
            else:
                List.append(friend.user1)
        return List

    def get_friend_requests(self):
        requests = Friendship.objects.filter(user2=self, is_accepted=False)
        List = []
        for request in requests:
            List.append(request.user1)
        return List

    def make_friend(self, user):
        try:
            return Friendship.create(self, user)
        except:
            try:
                friend = Friendship.objects.get(
                    user1=user, user2=self, is_accepted=False)
            except:
                raise ValueError("Already a friend or requested")
            else:
                friend.accept(save=True)
                return friend

    def unfriend(self, user):
        code, friend = self.friendship_status(user)
        if code > 0:
            friend.remove()
            return True
        else:
            return False

    def friendship_status(self, user):
        friends = Friendship.objects.filter(
            Q(user1=self, user2=user) | Q(user2=self, user1=user))
        if len(friends):
            if friends[0].is_accepted:
                return (3, friends[0])
            else:
                if friends[0].user1 == self:
                    return (1, friends[0])
                else:
                    return (2, friends[0])
        else:
            return (0, None)

    def get_profile_min(self):
        return {'user_id': self.id, 'name': self.name}

    def get_profile(self, ref_user):
        profile = {'user_id': self.id, 'name': self.name}
        if self != ref_user:
            friend_status, friend_obj = self.friendship_status(ref_user)
            profile['friendship_status'] = friend_status
            if friend_status == 3:
                profile['friends_since'] = friend_obj.accepted_on
                profile['score'] = friend_obj.score
                profile['common_time'] = friend_obj.common_time
        else:
            profile['email'] = self.email
        return profile

    def create_room(self, tracks):
        room = Room.create(tracks)
        room.grant_access(self)
        self.join_room(room)
        return room

    def join_room(self, room):
        self.leave_room()
        if room.can_user_access(self):
            self.room = room
            self.save()
            return room
            # emit events
        else:
            raise ValueError("User does not have access")

    def leave_room(self):
        if self.room != None:
            room = self.room
            self.room = None
            self.save()
            # emit events
            if room.members.count() == 0:
                room.delete()

    def __str__(self):
        return self.email

    @classmethod
    def get_by_id(cls, pk):
        return cls.objects.get(id=pk)


class Friendship(models.Model):
    user1 = models.ForeignKey(
        User, related_name="user1_set", on_delete=models.CASCADE)
    user2 = models.ForeignKey(
        User, related_name="user2_set", on_delete=models.CASCADE)
    init_on = models.DateTimeField()
    is_accepted = models.BooleanField()
    accepted_on = models.DateTimeField(null=True, default=None)
    score = models.IntegerField()
    common_time = models.TimeField()

    def remove(self):
        self.delete()

    def accept(self, save=False):
        if not self.is_accepted:
            self.is_accepted = True
            self.accepted_on = timezone.now()
        if save:
            self.save()

    class Meta:
        unique_together = ['user1', 'user2']

    @classmethod
    def create(cls, user1, user2):
        existing = cls.objects.filter(
            Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).count()
        if existing == 0:
            obj = cls(user1=user1, user2=user2, init_on=timezone.now(),
                      is_accepted=False, score=0, common_time=datetime.time(0, 0, 0))
            obj.save()
            return obj
        else:
            raise ValueError("Friendship obj already exists for these users")

    def __str__(self):
        return self.user1.name+' & '+self.user2.name


class Room(models.Model):
    created_on = models.DateTimeField()
    access_users = models.ManyToManyField(
        User, related_name="access_to_rooms")
    is_paused = models.BooleanField(default=False)
    paused_on = models.DateTimeField(null=True, default=None)
    duration_to_complete = models.TimeField()
    play_start_time = models.DateTimeField()
    no_tracks = models.IntegerField(default=0)
    current_roomtrack = models.ForeignKey(
        "RoomTrack", on_delete=models.CASCADE, related_name="+")

    def get_state_obj(self):
        state = {
            'room_id': self.id,
            'members_count': self.members.count(),
            'is_paused': self.is_paused,
            'current_track': self.current_roomtrack.track.get_obj(),
            'play_start_time': self.play_start_time,
            'duration_to_complete': self.duration_to_complete
        }
        return state

    def get_title_obj(self, user):
        members = self.get_members()
        friends_found = []
        count = self.members.count()
        for member in members:
            if member.friendship_status(user) == 3:
                friends_found.append(member.get_profile_min())
                if len(friends_found) > 2:
                    break
        return {'room_id': self.id, 'members_count': count, 'member_friends': friends_found}

    def get_tracks(self):
        rt = self.current_roomtrack
        List = [rt.track]
        for i in range(self.no_tracks-1):
            rt = rt.next_roomtrack
            List.append(rt.track)
        return List

    def get_members(self):
        members = self.members.all()
        return members

    def get_access_users(self):
        ausers = self.access_users.all()
        return ausers

    def can_user_access(self, user):
        try:
            self.access_users.get(id=user.id)
        except:
            return False
        else:
            return True

    def grant_access(self, user, save=True):
        self.access_users.add(user)
        if save:
            self.save()

    def revoke_access(self, user, save=True):
        self.access_users.remove(user)
        if save:
            self.save()

    def play(self):
        self.skip_to(0, self.duration_to_complete)

    def pause(self):
        self.is_paused = True
        self.paused_on = timezone.now()
        self.save()

    def skip_to(self, index=0, duration=None):
        rt = self.get_roomtrack_by_index(index)
        self.current_roomtrack = rt
        self.is_paused = False
        self.paused_on = None
        self.play_start_time = timezone.now()
        if duration != None:
            self.duration_to_complete = duration
        else:
            self.duration_to_complete = rt.track.duration
        self.save()
        # schedule next skip_to
        # emit event

    def add_track(self, track, index=None):
        # index of curr
        # insert track between curr_last and curr
        # INDEX 0 ie will be added at the last of the queue
        curr = self.current_roomtrack
        if index != None:
            curr = self.get_roomtrack_by_index(index)
        curr_last = curr.previous_roomtrack
        curr_last.next_roomtrack = None
        curr_last.save()
        rt = RoomTrack.create(track, next_track=curr, room=self)
        curr_last.next_roomtrack = rt
        curr_last.save()
        self.no_tracks = self.no_tracks+1
        self.save()
        # emit event

    def remove_track(self, index):
        # removes a track or index starting from current track
        if self.no_tracks > 1:
            rt = self.get_roomtrack_by_index(index)
            if index > 0:
                prev = rt.previous_roomtrack
                nxt = rt.next_roomtrack
                rt.next_roomtrack = None
                prev.next_roomtrack = nxt
                self.no_tracks = self.no_tracks-1
                rt.delete()
                prev.save()
                self.save()
                # emit event

    def get_roomtrack_by_index(self, index):
        rt = self.current_roomtrack
        for i in range(index):
            rt = rt.next_roomtrack
        return rt

    @classmethod
    def get_by_id(cls, pk):
        return cls.objects.get(id=pk)

    @classmethod
    def create(cls, tracks=[]):
        room = cls(created_on=timezone.now(), play_start_time=timezone.now(),
                   is_paused=False, paused_on=None, no_tracks=0)
        room.current_roomtrack = RoomTrack.create(tracks[0])
        room.no_tracks = 1
        room.play_start_time = timezone.now()
        room.duration_to_complete = room.current_roomtrack.track.duration
        room.save()
        room.current_roomtrack.room = room
        room.current_roomtrack.save()
        tracks.pop(0)
        for track in tracks:
            room.add_track(track)
        return room


class RoomTrack(models.Model):
    added_on = models.DateTimeField()
    next_roomtrack = models.OneToOneField(
        "self", on_delete=models.SET_NULL, default=None, null=True, related_name="previous_roomtrack")
    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, null=True, default=None, related_name="roomtracks")
    track = models.ForeignKey(
        'Track', on_delete=models.PROTECT, related_name="+")

    @classmethod
    def create(cls, track, next_track=None, room=None):
        rt = cls(track=track, added_on=timezone.now(),
                 next_roomtrack=next_track, room=room)
        rt.save()
        if rt.next_roomtrack == None:
            rt.next_roomtrack = rt
            rt.save()
        return rt


class Track(models.Model):
    added_on = models.DateTimeField()
    title = models.CharField(max_length=255)
    artists = models.CharField(max_length=255)
    duration = models.TimeField()
    no_plays = models.IntegerField()
    filename = models.CharField(max_length=255)
    storage_bucket = models.CharField(max_length=255)
    playback_path = models.CharField(max_length=255)

    def get_obj(self):
        playback_url = STORAGE_URLS[self.storage_bucket]+self.playback_path
        obj = {'track_id': self.id, 'title': self.title, 'duration': self.duration,
               'artists': self.artists, 'playback_url': playback_url}
        return obj

    @classmethod
    def get_by_id(cls, pk):
        return cls.objects.get(id=pk)

    @classmethod
    def create(cls,**values):
        track = cls(added_on=timezone.now(),**values)
        track.no_plays=0
        track.save()
        return track


class Artist(models.Model):
    title = models.CharField(max_length=255)
