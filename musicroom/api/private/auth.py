from django.contrib.sessions.models import Session
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

from musicroom.common import apiRespond
from musicroom.settings import LIVE_ACCESS_KEY
from musicroom.models import User


@require_http_methods(["POST"])
def p_auth(request):
    if "access_key" in request.POST and request.POST["access_key"] == LIVE_ACCESS_KEY:
        if "mrsid" in request.POST:
            try:
                s = Session.objects.get(pk=request.POST['mrsid'])
            except:
                return apiRespond(400, msg='mrsid invalid')
            else:
                session_data = s.get_decoded()
                user_id = session_data.get('_auth_user_id')
                if user_id != None:
                    try:
                        user = User.get_by_id(user_id)
                    except:
                        return apiRespond(400, msg='user not logged in')
                    else:
                        room_id = None
                        if user.room != None:
                            room_id = user.room.id
                        return apiRespond(200, user_id=user.id, room_id=room_id)
                else:
                    return apiRespond(400, msg='user not logged in')
        else:
            return apiRespond(400, msg='mrsid missing')
    else:
        return apiRespond(400, msg='access_key invalid')
