from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, LibraryTrack
from musicroom.services.music import Music


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        if 'track_id' in request.GET:
            track_id = request.GET['track_id']
            track = None
            try:
                track = Music.get_by_id(track_id)
            except:
                return apiRespond(400, msg='track_id invalid')
            else:
                return apiRespond(200, track = track.get_obj(more_info = True, user = request.user))
        else:
            return apiRespond(400, msg='track_id missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
