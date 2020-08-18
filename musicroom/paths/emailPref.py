from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.core.validators import validate_email, ValidationError
from musicroom.models import User
# @require_http_methods(["POST"])


def main(request):
    if request.method == 'POST':
        if "email" in request.POST:
            if request.user.is_authenticated:
                return redirect("/")
            else:
                try:
                    validate_email(request.POST["email"])
                    request.session["prefer_email"] = request.POST["email"].lower().strip()
                    prefer_email = request.POST["email"].lower().strip()
                    try:
                        me = User.objects.get(email=prefer_email)
                        return redirect("/login")
                    except User.DoesNotExist:
                        return redirect("/signup")

                except ValidationError:
                    txt = "Invalid email: "+request.POST["email"]
        else:
            txt = "No email provided"
    elif request.method == 'GET':
        return redirect("/")

    res = HttpResponse(txt)
    return res
