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
            access_users = room.get_access_users()
            List = []
            for access_user in access_users:
                List.append(access_user.get_profile_min())
            return apiRespond(200, access_users=List)
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
