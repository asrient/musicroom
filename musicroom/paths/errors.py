from django.shortcuts import render
from django.http import HttpResponse

def page404(request, exception=None):
    response = render(request, '404.html')
    response.status_code = 404
    return response
