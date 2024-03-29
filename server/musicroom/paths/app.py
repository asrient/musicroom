from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from musicroom.common import to_json
from musicroom.settings import LIVE_URL


def app(request, **args):
    state = {'is_loggedin': False, 'me': None, 'room': None}
    res = render(request, 'app.html', {
                 'no_header': True, 'state': to_json(state)})
    return res


@login_required
def app_login_required(request, **args):
    state = {
        'is_loggedin': True,
        'live_url': LIVE_URL
        }
    state['me'] = request.user.get_profile(request.user)
    state['user_preferences'] = request.user.get_preferences()
    state['room'] = None
    if request.user.room != None:
        state['room'] = request.user.room.get_state_obj()
    state['requested_room'] = None
    if request.user.requested_room != None:
        state['requested_room'] = request.user.requested_room.get_title_obj(request.user)
    res = render(request, 'app.html', {
                 'no_header': True,  'state': to_json(state)})
    return res
