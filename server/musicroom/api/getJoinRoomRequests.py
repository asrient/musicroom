from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Room


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        room: Room = request.user.room
        if room == None:
            return apiRespond(400, msg='not in a room')
        users = room.get_join_requests()
        List = []
        for user in users:
            List.append(user.get_profile_min())
        return apiRespond(200, users=List)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
