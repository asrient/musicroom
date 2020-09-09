from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, RoomTrack


@require_http_methods(["POST"])
def skipto(request):
    if request.user.is_authenticated:
        data = request.POST
        if request.user.room != None:
            room = request.user.room
            if 'roomtrack_id' in data:
                rt_id = data['roomtrack_id']
                duration = None
                if 'duration' in data and data['duration'] != '':
                    duration = data['duration']
                try:
                    rt = RoomTrack.get_by_id(rt_id)
                except:
                    return apiRespond(400, msg='roomtrack_id invalid')
                else:
                    room.skip_to(
                        roomtrack=rt, duration=duration, action_user=request.user)
                    return apiRespond(201, msg='skipped')
            else:
                return apiRespond(400, msg='roomtrack_id missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
