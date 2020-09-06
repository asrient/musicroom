from django.http import HttpResponse
from django.shortcuts import render, redirect


def loader(request, **args):
    res = render(request, args['page']+'.html', {'header': {
        'is_loggedin': False, 'is_empty': True}})
    return res
