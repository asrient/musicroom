import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from musicroom.common import to_json
from musicroom.models import User, RoomTrack, Room


class Live(WebsocketConsumer):
    my_room_id = None
    user = None

    def connect(self):
        if 'user' in self.scope and self.scope['user'] != None and self.scope['user'].id != None:
            self.user = self.scope["user"]
            self.accept()
            async_to_sync(self.channel_layer.group_add)(
                'user-'+str(self.user.id), self.channel_name)
            if 'room' in self.user and self.user.room != None:
                self.room_connect({'room_id': self.user.room.get_value('id')})
                self.room_send('update.members.connected',
                               action_user=self.user.get_profile_min())
            else:
                print("connected user has no room")
        else:
            print("Anonymous user connected to /live")

    def disconnect(self, close_code):
        if self.user != None and self.user.room != None:
            self.room_send('update.members.disconnected',
                           action_user=self.user.get_profile_min())
            self.room_disconnect({'room_id': self.user.room.id})
        async_to_sync(self.channel_layer.group_discard)(
            'user-'+str(self.user.id), self.channel_name)

    def room_send(self, msg_type, **data):
        async_to_sync(self.channel_layer.group_send)(
            'room-'+str(self.my_room_id), {"type": msg_type, **data})

    def room_connect(self, event):
        # access by room.connect
        self.my_room_id = event['room_id']
        async_to_sync(self.channel_layer.group_add)(
            'room-'+str(event['room_id']), self.channel_name)
        self.room_send('update.members.connected',
                       action_user=self.user.get_profile_min())

    def room_disconnect(self, event):
        self.my_room_id = None
        async_to_sync(self.channel_layer.group_discard)(
            'room-'+str(event['room_id']), self.channel_name)

    def update_members_connected(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.connected', event['action_user'])

    def update_members_disconnected(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.disconnected',
                              event['action_user'])

    def update_members_add(self, event):
        if 'action_user' in event:
            user_id = event['action_user']['user_id']
            try:
                user = User.get_by_id(user_id)
            except:
                pass
            else:
                status = self.user.friendship_status(user)[0]
                is_friend = status == 3
                self.dispatch_msg(
                    'update.members.add', action_user=event['action_user'], is_friend=is_friend)

    def update_members_remove(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.remove', event['action_user'])

    def update_tracks_add(self, event):
        if 'roomtrack' in event and 'action_user' in event:
            self.dispatch_msg('update.tracks.add',
                              event['action_user'], roomtrack=event['roomtrack'])

    def update_tracks_remove(self, event):
        if 'roomtrack' in event and 'action_user' in event:
            self.dispatch_msg('update.tracks.remove',
                              event['action_user'], roomtrack=event['roomtrack'])

    def update_playback_skipto(self, event):
        if 'room' in event:
            user = None
            if 'action_user' in event:
                user = event['action_user']
            self.dispatch_msg('update.playback.skipto',
                              action_user=user, room=event['room'])

    def update_playback_pause(self, event):
        if 'room' in event and 'action_user' in event:
            self.dispatch_msg('update.playback.pause',
                              event['action_user'], room=event['room'])

    def send_chat(self, event):
        if 'text' in event and 'date' in event and 'action_user' in event:
            self.dispatch_msg('chat.text',
                              event['action_user'], date=event['date'], text=event['text'])

    def chat_typing(self, event):
        if 'isTyping' in event and 'date' in event and 'user_id' in event:
            self.dispatch_msg('chat.typing',
                              None, date=event['date'], isTyping=event['isTyping'], user_id=event['user_id'])

    def dispatch_msg(self, msg_type, action_user=None, **msg):
        data = {'type': msg_type, 'action_user': action_user, **msg}
        self.send(text_data=to_json(data))

    def receive(self, text_data):
        data = json.loads(text_data)
        if 'type' in data:
            msg_type = data['type']
            if self.my_room_id != None:
                # cuz the model instance does not update automatically
                if msg_type == 'chat.text':
                    if 'date' in data and 'text' in data:
                        self.room_send(
                            'send.chat', date=data['date'], text=data['text'], action_user=self.user.get_profile_min())
                if msg_type == 'chat.typing':
                    if 'date' in data and 'isTyping' in data:
                        self.room_send(
                            'chat.typing', date=data['date'], isTyping=data['isTyping'], user_id=self.user.get_value('id'))
                else:
                    room = Room.get_by_id(self.my_room_id)
                    if msg_type == 'set.playback.pause':
                        room.pause(action_user=self.user)
                    elif msg_type == 'set.playback.play':
                        room.play(action_user=self.user)
                    elif msg_type == 'set.playback.skipto':
                        if 'roomtrack_id' in data:
                            rt_id = data['roomtrack_id']
                            duration = None
                            if 'duration' in data:
                                duration = data['duration']
                            try:
                                rt = RoomTrack.get_by_id(rt_id)
                            except:
                                pass
                            else:
                                room.skip_to(
                                    roomtrack=rt, duration=duration, action_user=self.user)
