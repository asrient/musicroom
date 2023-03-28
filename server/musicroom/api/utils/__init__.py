from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login
from musicroom.settings import LIVE_ACCESS_KEY
from musicroom.common import apiRespond


def login_required(func):
    def inner(request):
        if not request.user.is_authenticated:
            return apiRespond(401, msg='User not logged in')
        return func(request)
    return inner


def private_api(func):
    def inner(request):
        if "access_key" in request.POST and request.POST["access_key"] == LIVE_ACCESS_KEY:
            return func(request)
        else:
            return apiRespond(400, msg='access_key invalid')
    return inner


def room_required(func):
    def inner(request):
        if request.user.room == None:
            return apiRespond(400, msg='Not a member of any room')
        return func(request)
    return inner
