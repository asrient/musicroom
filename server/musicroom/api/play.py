from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User


@require_http_methods(["GET"])
def play(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room = request.user.room
            room.play(action_user=request.user)
            return apiRespond(201, msg='playing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
