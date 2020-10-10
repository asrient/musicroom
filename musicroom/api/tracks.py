from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        tracks = Track.browse()
        List = []
        for track in tracks:
            List.append(track.get_obj())
        return apiRespond(200, tracks=List)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
