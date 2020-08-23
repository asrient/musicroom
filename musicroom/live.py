import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from musicroom.common import to_json


class Live(WebsocketConsumer):
    my_room_id = None

    def connect(self):
        self.accept()
        #async_to_sync(self.channel_layer.group_add)("chat", self.channel_name)

    def disconnect(self, close_code):
        #async_to_sync(self.channel_layer.group_discard)("chat", self.channel_name)
        pass

    def send_to_my_room(self, msg_type, **data):
        async_to_sync(self.channel_layer.group_send)(
            'room-'+str(self.my_room_id), {"type": msg_type, **data})

    def connect_to_room(self, event):
        # access by connect.to.room
        self.my_room_id = event['room_id']
        async_to_sync(self.channel_layer.group_add)(
            'room-'+str(event['room_id']), self.channel_name)

    def disconnect_from_room(self, event):
        self.my_room_id = None
        async_to_sync(self.channel_layer.group_discard)(
            'room-'+str(event['room_id']), self.channel_name)

    def dispatch_msg(self, msg):
        self.send(text_data=to_json(msg))

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
