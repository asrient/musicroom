from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path, path
from musicroom.live import Live
from musicroom.roomKeeping import RoomKeeper

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('live', Live)
        ])
    ),
    "channel": ChannelNameRouter({
        "roomkeeping": RoomKeeper,
    }),
})
