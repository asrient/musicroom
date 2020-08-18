from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from musicroom.models import User
from django.contrib.auth.models import Group

class UserAdmin(BaseUserAdmin):
    #add_form = CustomUserRegistrationForm
    #form = CustomUserChangeForm
    model = User
    ordering = ('email',)
    

admin.site.register(User, UserAdmin)
admin.site.unregister(Group)