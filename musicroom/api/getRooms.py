from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        rooms = request.user.get_rooms()
        List = []
        for room in rooms:
            List.append(room.get_title_obj(request.user))
        return apiRespond(200, rooms=List)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
