from django.http import HttpResponse
import json
from json import JSONEncoder
import datetime
from django.utils.crypto import get_random_string
import django.core.serializers
import redis
from musicroom.settings import REDIS_URL


tunnel = redis.from_url(REDIS_URL)


class DateTimeEncoder(JSONEncoder):
    # Override the default method
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        elif isinstance(obj, datetime.time):
            return (obj.hour * 60 + obj.minute) * 60 + obj.second


def apiRespond(code, **data):
    res = HttpResponse(json.dumps(data, cls=DateTimeEncoder),
                       content_type="text/json")
    res.status_code = code
    return res


def makecode(length=20):
    return get_random_string(length=length)


def to_json(data):
    return json.dumps(data, cls=DateTimeEncoder)


def dump_datetime(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    elif isinstance(obj, datetime.time):
        return (obj.hour * 60 + obj.minute) * 60 + obj.second
    else:
        return obj


def push_to_tunnel(channel_name, **data):
    tunnel.publish(channel_name, to_json(data))


def live_event(group, msg_type, **data):
    push_to_tunnel('live:relay.event', group=group, type=msg_type, data=data)


def usertask(task, user_id, **data):
    push_to_tunnel('live:task.user', user_id=user_id, task=task, data=data)


def roomtask(task, room_id, **data):
    push_to_tunnel('live:task.user', room_id=room_id, task=task, data=data)
