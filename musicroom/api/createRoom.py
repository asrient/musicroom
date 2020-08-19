from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "track_ids" in request.POST:
            tracks=[]
            for track_id in request.POST["track_ids"]:
                try:
                    track=Track.get_by_id(track_id)
                except:
                    pass
                else:
                    tracks.append(track)
            if len(track):
                room=request.user.create_room(tracks)
                return apiRespond(201, **room.get_state_obj())
            else:
                return apiRespond(400, msg='all track_ids invalid')
        else:
            return apiRespond(400, msg='track_ids missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
