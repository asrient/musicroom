"""musicroom URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from musicroom.paths.joinRoom import main as joinRoom
from musicroom.paths.code import main as code
from musicroom.paths.loader import loader
from musicroom.paths.setAvatar import main as setAvatar
from musicroom.paths.setName import main as setName
from musicroom.paths.signup import main as signup
from musicroom.paths.app import app, app_login_required
from musicroom.paths.login import main as login
from musicroom.paths.emailPref import main as emailPref
from musicroom.paths.index import main as index
from musicroom.startup import init
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import RedirectView

favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)

urlpatterns = [
    path('', index, name='index'),
    path('emailpref', emailPref, name='email_pref'),
    path('login', login, name='login'),
    path('signup', signup, name='signup'),
    path('setName', setName, name='set_name'),
    path('setAvatar', setAvatar, name='set_avatar'),
    path('joinRoom', joinRoom, name='join_room'),
    path('code/<str:code>', code, name='room_code'),
    path('api/', include('musicroom.api.urls')),
    path('admin/', admin.site.urls),
    path('privacyPolicy', loader, {'page':'privacyPolicy'}),
    re_path(r'^favicon\.ico$', favicon_view),
    re_path(r'^.*', app_login_required, name='app'),
]

handler404 = 'musicroom.paths.errors.page404'

init()
