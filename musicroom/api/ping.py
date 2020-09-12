from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User


@require_http_methods(["GET"])
def ping(request):
    if request.user.is_authenticated:
        request.user.seen_now()
        return apiRespond(201, msg='ok')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
