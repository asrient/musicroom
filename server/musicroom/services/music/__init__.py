from musicroom.settings import MUSIC_SERVICE
from .jioMusic import search as jioSearch, get_stream_url as jioGetStreamUrl
from .gaana1 import search as gaana1Search, get_stream_url as gaana1GetStreamUrl, explore as gaana1Explore, find_track as gaana1FindTrack, save_track as gaana1SaveTrack
from musicroom.models import Track


class Music:
    def search(self, word, limit=10, lang=None, fast=False):
        if MUSIC_SERVICE == 'jio':
            return jioSearch(word, limit, lang)
        elif MUSIC_SERVICE == 'gaana1':
            return gaana1Search(word, limit, lang, fast)
    
    def get_stream_url(self, track: Track):
        service = track.ref_id.split(':')[0]
        if service == 'jio':
            return jioGetStreamUrl(track)
        elif service == 'gaana1':
            return gaana1GetStreamUrl(track)

    def explore(self):
        if MUSIC_SERVICE == 'gaana1':
            return gaana1Explore()
    
    def find_track(self, name: str, artists: str, make_track = True):
        if MUSIC_SERVICE == 'gaana1':
            return gaana1FindTrack(name, artists, make_track)
    
    @classmethod
    def get_by_id(cls, id: str):
        id = str(id)
        if id.startswith('unsaved:'):
            service = id.split(':')[1]
            if service == 'gaana1':
                track = gaana1SaveTrack(id.split(':')[-1])
                if track is None:
                    raise Exception('Unsaved track could not be saved')
                return track
        else:
            return Track.get_by_id(id)