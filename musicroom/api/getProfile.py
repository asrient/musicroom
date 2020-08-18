from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User

@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if "id" in request.POST:
            try: 
                target_user=User.get_by_id(request.POST["id"])
            except:
                return apiRespond(400, msg="User does not exists")
            else:
                profile=target_user.get_profile(request.user)
                return apiRespond(200, **profile)
        else:
            return apiRespond(400, msg='id missing')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
