from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
import datetime
from django.utils import timezone
from musicroom.common import apiRespond, to_json
from musicroom.settings import LIVE_ACCESS_KEY
from musicroom.models import User, Room


@require_http_methods(["POST"])
def p_room_check(request):
    if "access_key" in request.POST and request.POST["access_key"] == LIVE_ACCESS_KEY:
        curr_time = timezone.now()
        rooms = Room.objects.filter(last_check_on__lte=(
            curr_time-datetime.timedelta(seconds=0,  minutes=5))).order_by('last_check_on')[:15]
        for room in rooms:
            room.check_state()
        return apiRespond(201, msg='done')
    else:
        return apiRespond(400, msg='access_key invalid')
