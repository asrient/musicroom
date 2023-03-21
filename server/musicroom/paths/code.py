from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from musicroom.models import Room


@login_required
def main(request, code):
    if not request.user.is_authenticated:
        return redirect(to="/login?next="+request.path)
    try:
        room = Room.get_by_code(code)
    except:
        return HttpResponse("Invalid code")
    else:
        try:
            room: Room = request.user.join_room(room)
        except:
            return HttpResponse('Failed to join room')
        else:
            return redirect(to="/room")
