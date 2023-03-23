from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required


@login_required
def main(request):
    name=request.user.name
    res = render(request, 'setName.html', {'header': {
                     'is_loggedin': True, 'is_empty': False},'previousName':name})
    return res
