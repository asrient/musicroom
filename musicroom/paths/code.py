from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from musicroom.models import Room


@login_required
def main(request, code):
    try:
        room = Room.get_by_code(code)
    except:
        return HttpResponse("Invalid code")
    else:
        room.grant_access(request.user)
        return redirect(to="/roomPreview/"+str(room.id))
