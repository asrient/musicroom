from musicroom.settings import MUSIC_SERVICE
from .jioMusic import search as jioSearch, get_stream_url as jioGetStreamUrl
from .gaana1 import search as gaana1Search, get_stream_url as gaana1GetStreamUrl
from musicroom.models import Track


class Music:
    def search(self, word, limit=10, lang=None):
        if MUSIC_SERVICE == 'jio':
            return jioSearch(word, limit, lang)
        elif MUSIC_SERVICE == 'gaana1':
            return gaana1Search(word, limit, lang)
    
    def get_stream_url(self, track: Track):
        service = track.ref_id.split(':')[0]
        if service == 'jio':
            return jioGetStreamUrl(track)
        elif service == 'gaana1':
            return gaana1GetStreamUrl(track)
