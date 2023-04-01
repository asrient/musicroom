from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Room, LibraryTrack, Track
from musicroom.api.utils import login_required, room_required
from musicroom.services.ml import get_current_artist_tracks, recommendations_for_room, recommendations_for_you, recommendations_for_track


@require_http_methods(["GET"])
@login_required
def get_recommendations(request):
    result = []

    def add(obj):
        if obj != None:
            result.append(obj)

    if 'refresh' in request.GET:
        refresh: str = request.GET['refresh']
        if refresh == 'room':
            add(recommendations_for_room(request.user.room, refresh = True))
        elif refresh == 'you':
            add(recommendations_for_you(request.user, refresh = True))
        elif refresh.startswith('track'):
            t = Track.objects.get(id = refresh.split(':')[1])
            add(recommendations_for_track(t, refresh = True))
        else:
            return apiRespond(400, error = 'Invalid refresh param')
        return apiRespond(200, result = result)

    if request.user.room != None:
        room: Room = request.user.room
        if room.get_members_count() > 1:
            add(recommendations_for_room(room))
        current_track = room.current_track()
        add(recommendations_for_track(current_track))

    add(recommendations_for_you(request.user))
    add(get_current_artist_tracks(request.user))
    
    return apiRespond(200, result = result)
