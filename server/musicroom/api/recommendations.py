from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Room, LibraryTrack
from musicroom.api.utils import login_required, room_required
from musicroom.services.ml import get_current_artist_tracks, get_similar_tracks


@require_http_methods(["GET"])
@login_required
def get_recommendations(request):
    result = []

    def add(obj):
        if obj != None:
            result.append(obj)

    if request.user.room != None:
        room: Room = request.user.room

        if room.get_members_count() > 1:
            tracks_in_queue = room.get_tracks()[:5]
            add(get_similar_tracks(tracks_in_queue, title = f'For everyone in room'))

        my_tracks = LibraryTrack.get_library_tracks(request.user, 5)
        add(get_similar_tracks(my_tracks, title = f'Suggestions for you'))

        current_track = room.current_track()
        add(get_similar_tracks([current_track], title = f'Similar to {current_track.title}'))

        

    add(get_current_artist_tracks(request.user))
    
    return apiRespond(200, result = result)
