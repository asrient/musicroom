from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from musicroom.settings import BASEURL, SNAPKIT_CLIENT_ID


@login_required
def main(request):
    redirect_url = BASEURL+'/setAvatar'
    setName = 'true'
    if 'src' in request.GET and request.GET['src'] == 'account':
        setName = 'false'
    res = render(request, 'setAvatar.html', {'header': {
        'is_loggedin': True, 'is_empty': False}, 'set_name': setName, 'redirect_url': redirect_url, 'client_id': SNAPKIT_CLIENT_ID})
    return res
