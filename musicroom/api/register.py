from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email, ValidationError
from django.contrib.auth import login

from musicroom.common import apiRespond
from musicroom.models import User


@require_http_methods(["POST"])
def main(request):
    if not request.user.is_authenticated:
        if "email" in request.POST and "password" in request.POST:
            try:
                validate_email(request.POST["email"])
                email = request.POST["email"].lower().strip()
                request.session["prefer_email"] = email
                try:
                    me = User.objects.get(email=email)
                    return apiRespond(400, msg='Email already registered')
                except User.DoesNotExist:
                    try:
                        validate_password(request.POST["password"])
                        pwd = request.POST["password"]
                        user = User.objects.create_user(email, password=pwd)
                        user.save()
                        login(request, user)
                        return apiRespond(200, msg='Account created')
                    except ValidationError:
                        return apiRespond(400, msg='Invalid password format')
            except ValidationError:
                return apiRespond(400, msg='Invalid email')
        else:
            return apiRespond(400, msg='Incomplete data')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='Already logged in')
