from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room = request.user.room
            tracks = room.get_roomtracks()
            List = []
            for track in tracks:
                List.append(track.get_obj())
            return apiRespond(200, roomtracks=List)
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
