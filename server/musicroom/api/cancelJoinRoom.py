from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, Room


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "room_id" in request.POST:
            try:
                room = Room.get_by_id(request.POST['room_id'])
            except:
                return apiRespond(400, msg='invalid room_id')
            else:
                success = False
                try:
                    success = request.user.remove_room_request(was_approved=False, notify_self=False)
                except:
                    pass
                if success:
                    return apiRespond(201, room = room.get_title_obj(request.user))
                else:
                    return apiRespond(400, msg='Access denied')
        else:
            return apiRespond(400, msg='room_id missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
