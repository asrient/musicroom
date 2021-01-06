from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login
from django.core.validators import validate_email, ValidationError

from musicroom.common import apiRespond


@require_http_methods(["POST"])
def main(request):
    if not request.user.is_authenticated:
        try:
            validate_email(request.POST["email"])
            request.session["prefer_email"] = request.POST["email"].lower().strip()
        except ValidationError:
            pass
        if "email" in request.POST and "password" in request.POST:
            user = authenticate(
                email=request.POST['email'], password=request.POST['password'])
            if user is not None:
                login(request, user)
                return apiRespond(200)
                # A backend authenticated the credentials
            else:
                return apiRespond(400, msg='Invalid email or password')
                # No backend authenticated the credentials
        else:
            return apiRespond(400, msg='Incomplete data')
    else:
        # user is already logged in, redirect to root
        return apiRespond(300, msg='Already logged in')
