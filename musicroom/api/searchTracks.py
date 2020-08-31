from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login

from musicroom.common import apiRespond
from musicroom.models import Track
from musicroom.jioMusic import search


@require_http_methods(["GET"])
def main(request, word):
    txt = word.split(':')[0]
    more = False
    if len(word.split(':')) > 1 and word.split(':')[1] == 'all':
        more = True
    tracks = search(txt, more)
    List = []
    if tracks is not None:
        for track in tracks:
            List.append(track.get_obj())
        return apiRespond(200, tracks=List)
    else:
        return apiRespond(400, msg='error')
