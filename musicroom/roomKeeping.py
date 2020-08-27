import json
from channels.consumer import SyncConsumer
from asgiref.sync import async_to_sync
from musicroom.common import to_json


class RoomKeeper(SyncConsumer):
   def schedule(self,event):
       print('scheduling room..',event)
       