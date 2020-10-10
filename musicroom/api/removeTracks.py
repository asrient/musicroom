from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, RoomTrack


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room = request.user.room
            if 'roomtrack_ids[]' in request.POST:
                roomtrack_ids = request.POST.getlist('roomtrack_ids[]')
                affected_tracks = []
                for roomtrack_id in roomtrack_ids:
                    roomtrack_id = int(roomtrack_id)
                    try:
                        roomtrack = RoomTrack.get_by_id(roomtrack_id)
                    except:
                        pass
                    else:
                        done = room.remove_roomtrack(roomtrack, request.user)
                        if done:
                            affected_tracks.append(roomtrack_id)
                return apiRespond(201, roomtrack_ids=affected_tracks)
            else:
                return apiRespond(400, msg='roomtrack_ids missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
