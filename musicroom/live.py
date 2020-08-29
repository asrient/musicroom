import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from musicroom.common import to_json
from musicroom.models import User


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
                self.room_connect({'room_id': self.user.room.get_value('id')})
                self.room_send('update.members.connected',
                               action_user=self.user.get_profile_min())

    def disconnect(self, close_code):
        if self.user.room != None:
            self.room_send('update.members.disconnected',
                           action_user=self.user.get_profile_min())
            self.room_disconnect({'room_id': self.user.room.id})
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
        self.room_send('update.members.connected',
                       action_user=self.user.get_profile_min())

    def room_disconnect(self, event):
        self.my_room_id = None
        async_to_sync(self.channel_layer.group_discard)(
            'room-'+str(event['room_id']), self.channel_name)

    def update_members_connected(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.connected', event['action_user'])

    def update_members_disconnected(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.disconnected', event['action_user'])

    def update_members_add(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.add', event['action_user'])

    def update_members_remove(self, event):
        if 'action_user' in event:
            self.dispatch_msg('update.members.remove', event['action_user'])

    def update_tracks_add(self, event):
        if 'roomtrack' in event and 'action_user' in event:
            self.dispatch_msg('update.tracks.add',
                              event['action_user'], roomtrack=event['roomtrack'])

    def update_tracks_remove(self, event):
        if 'roomtrack' in event and 'action_user' in event:
            self.dispatch_msg('update.tracks.remove',
                              event['action_user'], roomtrack=event['roomtrack'])

    def update_playback_skipto(self, event):
        if 'room' in event and 'action_user' in event:
            self.dispatch_msg('update.playback.skipto',
                              event['action_user'], room=event['room'])

    def update_playback_pause(self, event):
        if 'room' in event and 'action_user' in event:
            self.dispatch_msg('update.playback.pause',
                              event['action_user'], room=event['room'])

    def update_playback_play(self, event):
        if 'room' in event and 'action_user' in event:
            self.dispatch_msg('update.playback.play',
                            event['action_user'], room=event['room'])

    def dispatch_msg(self, msg_type, action_user=None, **msg):
        data = {'type': msg_type, 'action_user': action_user, **msg}
        self.send(text_data=to_json(data))

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
