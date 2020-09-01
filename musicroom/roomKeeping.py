import json
from channels.consumer import AsyncConsumer
from asgiref.sync import async_to_sync, sync_to_async
import asyncio
from musicroom.common import to_json
from musicroom.models import Room
import datetime
from django.utils import timezone


@sync_to_async
def execute_skipto(room_id):
    print('time to skipto', room_id)
    try:
        room = Room.get_by_id(room_id)
    except:
        pass
    else:
        curr_time = timezone.now()
        if not room.is_paused:
            dur = room.duration_to_complete
            if curr_time >= (room.play_start_time+datetime.timedelta(seconds=dur.second,  minutes=dur.minute)-datetime.timedelta(seconds=5,  minutes=0)):
                print('valid time to skipto')
                room.skip_to_next()
            else:
                print('NOT valid time to skipto',curr_time-(room.play_start_time+datetime.timedelta(seconds=dur.second,  minutes=dur.minute)))
        else:
            print('skipto canceled, playback is paused')


class RoomKeeper(AsyncConsumer):
    async def schedule_skipto(self, event):
        if 'room_id' in event and 'timeout' in event:
            room_id = event['room_id']
            timeout = event['timeout']
            print('scheduling skipto', room_id, timeout)
            await asyncio.sleep(timeout)
            async_wrapper = sync_to_async(execute_skipto)
            await async_wrapper(room_id)
