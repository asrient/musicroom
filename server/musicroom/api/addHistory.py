from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User
from musicroom.api.utils import room_required, login_required


@require_http_methods(["GET"])
@login_required
@room_required
def addHistory(request):
    try:
        user: User = request.user
        user.add_history()
    except Exception as e:
        print(e)
        return apiRespond(400, msg='Failed to add history: '+str(e))
    else:
        return apiRespond(201, msg='Recorded.')
        
