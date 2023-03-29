from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User
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
        add(get_similar_tracks(request.user.room.current_track()))

    add(get_current_artist_tracks(request.user))
    
    return apiRespond(200, result = result)
