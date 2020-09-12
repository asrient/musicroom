from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
import datetime
from django.utils import timezone
from musicroom.common import apiRespond, to_json
from musicroom.settings import LIVE_ACCESS_KEY
from musicroom.models import User, Room


@require_http_methods(["POST"])
def p_skipto(request):
    if "access_key" in request.POST and request.POST["access_key"] == LIVE_ACCESS_KEY:
        if "room_id" in request.POST:
            try:
                room = Room.get_by_id(request.POST['room_id'])
            except:
                return apiRespond(400, msg='room_id invalid')
            else:
                curr_time = timezone.now()
                if not room.is_paused:
                    dur = room.duration_to_complete
                    if curr_time >= (room.play_start_time+datetime.timedelta(seconds=dur.second,  minutes=dur.minute)-datetime.timedelta(seconds=5,  minutes=0)):
                        print('valid time to skipto')
                        room.skip_to_next()
                        return apiRespond(201, msg='skipped to next')
                    else:
                        print('NOT valid time to skipto', curr_time-(room.play_start_time +
                                                                     datetime.timedelta(seconds=dur.second,  minutes=dur.minute)))
                        return apiRespond(400, msg='NOT valid time to skipto')
                else:
                    print('skipto canceled, playback is paused')
                    return apiRespond(400, msg='playback is paused')
        else:
            return apiRespond(400, msg='room_id missing')
    else:
        print(request.GET, request.POST)
        return apiRespond(400, msg='access_key invalid')
