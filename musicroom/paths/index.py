from django.http import HttpResponse
from django.shortcuts import render,redirect

import musicroom.paths.hang


def main(request):
    if not request.user.is_authenticated:
        prefer_email=''
        if "prefer_email" in request.session:
            prefer_email=request.session["prefer_email"]
        res = render(request, 'index.html',{'header':{'is_loggedin':False,'is_empty':False},"prefer_email":prefer_email})
        return res
    else:
        return redirect("/rooms")