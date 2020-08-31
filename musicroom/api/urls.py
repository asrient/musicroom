from django.urls import path, include

from musicroom.api.auth import main as auth
from musicroom.api.register import main as register
from musicroom.api.logout import main as logout
from musicroom.api.setName import main as setName
from musicroom.api.getProfile import main as getProfile
from musicroom.api.getMyProfile import main as getMyProfile
from musicroom.api.friendsList import main as friendsList
from musicroom.api.friendRequests import main as friendRequests
from musicroom.api.addFriend import main as addFriend
from musicroom.api.removeFriend import main as removeFriend
from musicroom.api.getMyRoom import main as getMyRoom
from musicroom.api.createRoom import main as createRoom
from musicroom.api.joinRoom import main as joinRoom
from musicroom.api.leaveRoom import main as leaveRoom
from musicroom.api.membersList import main as membersList
from musicroom.api.getAccessUsers import main as getAccessUsers
from musicroom.api.getRoomTracks import main as getRoomTracks
from musicroom.api.grantAccess import main as grantAccess
from musicroom.api.revokeAccess import main as revokeAccess
from musicroom.api.addTracks import main as addTracks
from musicroom.api.removeTracks import main as removeTracks
from musicroom.api.getRoomCode import main as getRoomCode
from musicroom.api.getRooms import main as getRooms
from musicroom.api.tracks import main as tracks
from musicroom.api.searchTracks import main as search_tracks


urlpatterns = [
    path('auth', auth, name='api.auth'),
    path('register', register, name='api.register'),
    path('logout', logout, name='logout'),
    path('set/name', setName, name='api.set_name'),
    path('profile', getProfile, name='api.get_profile'),
    path('profile/me', getMyProfile, name='api.get_my_profile'),
    path('friends', friendsList, name='api.friends_list'),
    path('friends/requests', friendRequests, name='api.friend_requests'),
    path('friends/add', addFriend, name='api.add_friend'),
    path('friends/remove', removeFriend, name='api.remove_friend'),
    path('room', getMyRoom, name='api.getMyRoom'),
    path('room/create', createRoom, name='api.createRoom'),
    path('room/join', joinRoom),
    path('room/leave', leaveRoom),
    path('room/members', membersList),
    path('room/access/users', getAccessUsers),
    path('room/tracks', getRoomTracks),
    path('room/access/grant', grantAccess),
    path('room/access/revoke', revokeAccess),
    path('room/tracks/add', addTracks),
    path('room/tracks/remove', removeTracks),
    path('room/access/code', getRoomCode),
    path('rooms', getRooms),
    path('tracks', tracks),
    path('tracks/search/<str:word>', search_tracks),
]