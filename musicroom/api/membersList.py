from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room = request.user.room
            members = room.get_members()
            List = []
            for member in members:
                List.append(member.get_profile_min())
            return apiRespond(400, members=List)
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
