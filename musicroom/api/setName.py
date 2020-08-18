from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "name" in request.POST:
            name=request.POST["name"].strip()
            request.user.name=name
            request.user.save()
            return apiRespond(200, name=name)
        else:
            return apiRespond(400, msg='Give a name')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
