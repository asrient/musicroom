from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, LibraryTrack
from musicroom.services.music import Music


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if 'track_id' in request.POST:
            track_id = request.POST['track_id']
            track = None
            try:
                track = Music.get_by_id(track_id)
            except:
                return apiRespond(400, msg='track_id invalid')
            else:
                done = LibraryTrack.add_to_library(user = request.user, track = track)
                if done:
                    return apiRespond(201, track = track.get_obj(user = request.user))
                else:
                    return apiRespond(400, msg='track_id is already in library')
        else:
            return apiRespond(400, msg='track_id missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
