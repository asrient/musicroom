from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, Room


@require_http_methods(["GET", "POST"])
def main(request):
    if request.user.is_authenticated:
        room = None
        if 'room_id' in request.POST:
            try:
                room = Room.get_by_id(request.POST['room_id'])
            except:
                return apiRespond(400, msg='invalid room_id')
        if room == None:
            room = request.user.room
        if room != None:
            members = room.get_members()
            friends = []
            others = []
            for member in members:
                friend_status, friend_obj = member.friendship_status(
                    request.user)
                if friend_status == 3:
                    friends.append(member.get_profile_min())
                else:
                    others.append(member.get_profile_min())
            return apiRespond(200, friends=friends, others=others)
        else:
            return apiRespond(400, msg='Not a member of any room and no room_id provided')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
