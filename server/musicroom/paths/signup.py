from django.http import HttpResponse
from django.shortcuts import render, redirect


def main(request):
    if not request.user.is_authenticated:
        prefer_email = ''
        next_link = "/setAvatar"
        if 'next' in request.GET and request.GET['next'] != '/':
            next_link = request.GET['next']
        if "prefer_email" in request.session:
            prefer_email = request.session["prefer_email"].lower().strip()
        res = render(request, 'signup.html', {'header': {
                     'is_loggedin': False, 'is_empty': True}, "prefer_email": prefer_email, 'next': next_link})
        return res
    else:
        # user is already logged in, redirect to root
        return redirect("/browse")
