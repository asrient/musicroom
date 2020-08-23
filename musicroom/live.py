import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from musicroom.common import to_json


class Live(WebsocketConsumer):
    my_room_id = None
    user = None

    def connect(self):
        if 'user' in self.scope and self.scope['user'] != None:
            self.user = self.scope["user"]
            self.accept()
            async_to_sync(self.channel_layer.group_add)(
                'user-'+str(self.user.id), self.channel_name)
            if self.user.room != None:
                self.room_connect({'room_id': self.user.room.id})
                self.room_send('update.members.connected',member=self.user)

    def disconnect(self, close_code):
        if self.user.room != None:
            self.room_send('update.members.disconnected',member=self.user)
            self.room_disconnect({'room_id':self.user.room.id})
        async_to_sync(self.channel_layer.group_discard)(
            'user-'+str(self.user.id), self.channel_name)

    def room_send(self, msg_type, **data):
        async_to_sync(self.channel_layer.group_send)(
            'room-'+str(self.my_room_id), {"type": msg_type, **data})

    def room_connect(self, event):
        # access by room.connect
        self.my_room_id = event['room_id']
        async_to_sync(self.channel_layer.group_add)(
            'room-'+str(event['room_id']), self.channel_name)
        self.room_send('update.members.connected',member=self.user)

    def room_disconnect(self, event):
        self.my_room_id = None
        async_to_sync(self.channel_layer.group_discard)(
            'room-'+str(event['room_id']), self.channel_name)

    def update_members_connected(self, event):
        pass

    def update_members_disconnected(self, event):
        pass

    def update_members_add(self, event):
        pass

    def update_members_remove(self, event):
        pass

    def update_tracks_add(self, event):
        pass

    def update_tracks_remove(self, event):
        pass

    def update_playback_skipto(self, event):
        pass

    def update_playback_pause(self, event):
        pass

    def dispatch_msg(self, msg):
        self.send(text_data=to_json(msg))

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
