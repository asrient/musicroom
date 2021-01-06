from django.http import HttpResponse
from django.shortcuts import render, redirect


def main(request):
    res = render(request, 'joinRoom.html', {'header': {
                     'is_loggedin': True, 'is_empty': True}})
    return res
