from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track
from musicroom.services.music import Music


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        data = Music().explore()
        return apiRespond(200, result=data)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
