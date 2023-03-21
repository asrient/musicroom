from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import User, Room


@require_http_methods(["POST"])
def main(request):
    if request.user.is_authenticated:
        if request.user.room != None:
            room: Room = request.user.room
            if 'user_id' in request.POST and 'approve' in request.POST and request.POST['approve'] in ['true', 'false']:
                user_id = request.POST['user_id']
                approve = request.POST['approve'] == 'true'
                try:
                    user: User = User.get_by_id(user_id)
                except:
                    return apiRespond(400, msg='user not found')
                else:
                    success = False
                    if approve:
                        success = room.approve_join(user)
                    else:
                        success = room.reject_join(user)
                    if success:
                        return apiRespond(201, user_id=user_id) 
                    return apiRespond(400, msg='Could not approve/reject user')
            else:
                return apiRespond(400, msg='user_id or approve missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(401, msg='User not logged in')
