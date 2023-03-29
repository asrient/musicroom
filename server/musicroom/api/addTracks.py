from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track, Room, RoomTrack
from musicroom.services.music import Music


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room: Room = request.user.room
            if 'track_ids[]' in request.POST:
                track_ids = request.POST.getlist('track_ids[]')
                play: bool = 'play' in request.POST and request.POST['play'] == 'true'
                if len(track_ids):
                    roomtracks: list[RoomTrack] = []
                    for track_id in track_ids:
                        try:
                            track = Music.get_by_id(track_id)
                        except:
                            pass
                        else:
                            roomtrack = room.add_track(track, request.user)
                            roomtracks.append(roomtrack)
                        if play:
                                room.skip_to(roomtrack=roomtracks[0], duration=None, action_user=request.user)
                    return apiRespond(201, roomtracks=[rt.get_obj() for rt in roomtracks])
                else:
                    return apiRespond(400, msg='track_ids format invalid')
            else:
                return apiRespond(400, msg='track_ids missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
