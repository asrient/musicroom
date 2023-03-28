from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
import datetime
from django.utils import timezone
from musicroom.common import apiRespond, to_json
from musicroom.models import User, Room, Track
from ..utils import private_api
import simplejson

## FOR DEMO, NOT IN USE

@require_http_methods(["POST"])
@private_api
def p_process_user_action(request):
    actions = simplejson.loads(request.POST['actions'])
    print('processing actions..', actions)
    affected = 0
    errors = []
    for action_obj in actions:
        if action_obj['action'] == 'playbackComplete':
            date = timezone.datetime.fromisoformat(action_obj['date'])
            #print('date: ' + str(date))
            track_ids = action_obj['track_ids']
            users: list[User] = []
            for user_id in action_obj['user_ids']:
                try:
                    user = User.get_by_id(user_id)
                except Exception as e:
                    errors.append('user_id invalid: ' + str(e))
                else:
                    users.append(user)
            
            for track_id in track_ids:
                try:
                    track = Track.get_by_id(track_id)
                except Exception as e:
                    errors.append('track_id invalid: ' + str(e))
                else:
                    for user in users:
                        try:
                            user.add_track_to_history(track, date)
                            affected += 1
                        except Exception as e:
                            errors.append('failed to add track to history: ' + str(e))
    return apiRespond(201, affected=affected, errors=errors)
