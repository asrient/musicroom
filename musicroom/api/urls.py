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
]