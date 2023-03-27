from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, LibraryTrack


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 20))
        tracks = LibraryTrack.get_library_tracks(request.user, offset = offset, limit = limit)
        List = []
        for track in tracks:
            track_obj = track.get_obj()
            track_obj['liked'] = True
            List.append(track_obj)
        return apiRespond(200, tracks=List)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
