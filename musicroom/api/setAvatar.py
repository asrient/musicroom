from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "avatar_url" in request.POST:
            url=request.POST["avatar_url"].strip()
            request.user.avatar_url=url
            request.user.save()
            return apiRespond(200, avatar_url=url)
        else:
            return apiRespond(400, msg='avatar_url missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
