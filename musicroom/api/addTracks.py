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
            if 'track_ids[]' in request.POST:
                track_ids=request.POST.getlist('track_ids[]')
                if len(track_ids):
                    roomtracks=[]
                    for track_id in track_ids:
                        try:
                            track=Track.get_by_id(track_id)
                        except:
                            pass
                        else:
                            roomtrack=room.add_track(track)
                            roomtracks.append(roomtrack.get_obj())
                    return apiRespond(201, roomtracks=roomtracks)
                else:
                     return apiRespond(400, msg='track_ids format invalid')
            else:
                return apiRespond(400, msg='track_ids missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
