from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from musicroom.common import to_json


def app(request, **args):
    state = {'is_loggedin': False, 'me': None, 'room': None}
    res = render(request, 'app.html', {
                 'no_header': True, 'state': to_json(state)})
    return res


@login_required
def app_login_required(request, **args):
    state = {'is_loggedin': True}
    state['me'] = request.user.get_profile(request.user)
    state['room'] = None
    if request.user.room != None:
        state['room'] = request.user.room.get_state_obj()
    res = render(request, 'app.html', {
                 'no_header': True,  'state': to_json(state)})
    return res
