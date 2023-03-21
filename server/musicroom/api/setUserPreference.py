from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "key" in request.POST and "value" in request.POST:
            key = request.POST["key"]
            value = request.POST["value"]
            if value == "true":
                value = True
            elif value == "false":
                value = False
            done = False
            try:
                done = request.user.set_preferences({key: value})
            except Exception as e:
                print("Invalid key/value", e)
                pass
            if done:
                return apiRespond(201, user_preferences=request.user.get_preferences())
            else:
                return apiRespond(400, msg='Invalid key/value')
        else:
            return apiRespond(400, msg='key/value missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
