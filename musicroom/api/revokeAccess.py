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
            if 'user_ids' in request.POST:
                user_ids=request.POST.getlist('user_ids')
                if len(user_ids):
                    affected_users=[]
                    for user_id in user_ids:
                        try:
                            user=User.get_by_id(user_id)
                        except:
                            pass
                        else:
                            affected_users.append(user_id)
                            room.revoke_access(user,save=False)
                    room.save()
                    return apiRespond(201, affected_users=affected_users)
                else:
                     return apiRespond(400, msg='user_ids format invalid')
            else:
                return apiRespond(400, msg='user_ids missing')
        else:
            return apiRespond(400, msg='Not a member of any room')
    else:
        # user is already logged in, redirect to root
        return apiRespond(400, msg='User not logged in')
