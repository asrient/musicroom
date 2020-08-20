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
            if 'track_indexes' in request.POST:
                indexes=request.POST.getlist('track_indexes')
                affected_tracks = []
                for track_index in indexes:
                    track_index = int(track_index)
                    affected_tracks.append(track_index)
                    room.remove_track(track_index)
                return apiRespond(201, affected_track_indexes=affected_tracks)
            else:
                return apiRespond(400, msg='track_indexes missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
