from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track
from musicroom.services.music import Music


@require_http_methods(["GET"])
def stream_url_api(request, track_id):
    if request.user.is_authenticated:
        track = Track.get_by_id(track_id)
        if track is not None:
            music = Music()
            stream_url = music.get_stream_url(track)
            if stream_url is not None:
                return apiRespond(200, stream_url=stream_url)
            else:
                return apiRespond(400, msg='Error getting stream url')
        else:
            return apiRespond(404, msg='Track not found')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
