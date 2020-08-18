from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User


@require_http_methods(["GET"])
def main(request):
    if request.user.is_authenticated:
        friends = request.user.get_friend_requests()
        List = []
        for friend in friends:
            List.append(friend.get_profile_min())
        return apiRespond(200, requests=List)
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
