from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import logout

from musicroom.common import apiRespond


def main(request):
    prefer_email = None
    if "prefer_email" in request.session:
        prefer_email = request.session["prefer_email"]
    logout(request)
    if prefer_email is not None:
        request.session["prefer_email"] = prefer_email
    return apiRespond(200, msg='logged out')
