from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Track


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room = request.user.room
            if 'track_ids' in request.POST:
                track_ids=request.POST.getlist('track_ids')
                if len(track_ids):
                    affected_tracks=[]
                    for track_id in track_ids:
                        try:
                            track=Track.get_by_id(track_id)
                        except:
                            pass
                        else:
                            affected_tracks.append(track_id)
                            room.add_track(track)
                    return apiRespond(201, affected_track_ids=affected_tracks)
                else:
                     return apiRespond(400, msg='track_ids format invalid')
            else:
                return apiRespond(400, msg='track_ids missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
