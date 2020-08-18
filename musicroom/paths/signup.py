from django.http import HttpResponse
from django.shortcuts import render, redirect


def main(request):
    if not request.user.is_authenticated:
        prefer_email = ''
        if "prefer_email" in request.session:
            prefer_email = request.session["prefer_email"].lower().strip()
        res = render(request, 'signup.html', {'header': {
                     'is_loggedin': False, 'is_empty': True}, "prefer_email": prefer_email})
        return res
    else:
        # user is already logged in, redirect to root
        return redirect("/rooms")
