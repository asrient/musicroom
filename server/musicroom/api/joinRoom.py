from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, Room


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "code" in request.POST:
            try:
                room=Room.get_by_code(request.POST['code'])
            except:
                return apiRespond(400, msg='invalid code')
            else:
                try:
                    room: Room = request.user.join_room(room)
                except:
                    return apiRespond(400, msg='Access denied')
                else:
                    return apiRespond(201, room = room.get_state_obj())
        else:
            return apiRespond(400, msg='code missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
