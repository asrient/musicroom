from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        room_obj = None
        requested_room_obj = None
        if request.user.room != None:
            room_obj = request.user.room.get_state_obj()
        if request.user.requested_room != None:
            requested_room_obj = request.user.requested_room.get_title_obj(request.user)
        return apiRespond(200, room=room_obj, requested_room = requested_room_obj)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
