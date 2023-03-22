import datetime
from django.utils import timezone
from musicroom.common import to_json, dump_datetime, makecode
from musicroom.models import Track
from musicroom.settings import GAANA1_BASEURL
import json
from .musicUtils import http_get

"""
    Gaana API
    https://gaana.boundary.ml/docs/
    https://github.com/ZingyTomato/GaanaPy
"""

class Gaana1Track:
    def __init__(self, obj):
        self.seo_key = obj['seokey']
        self.ref_id = 'gaana1:'+self.seo_key
        self.duration = int(obj['duration'])
        self.title = obj['title']
        self.artists = obj['artists']
        if 'stream_urls' in obj and 'urls' in obj['stream_urls'] and len(obj['stream_urls']['urls']) > 0:
            urls = obj['stream_urls']['urls']
            self.stream_url = None
            if 'medium_quality' in urls:
                self.stream_url = urls['medium_quality']
            elif 'high_quality' in urls:
                self.stream_url = urls['high_quality']
            elif 'low_quality' in urls:
                self.stream_url = urls['low_quality']
        self.img_url = None
        try:
            self.img_url = obj['images']['urls']['small_artwork']
            self.img_url = obj['images']['urls']['medium_artwork']
        except:
            pass

    def make_track(self):
        mins, secs = divmod(self.duration, 60)
        return Track.create(title=self.title, artists=self.artists, duration=datetime.time(
            0, mins, secs), ref_id=self.ref_id, storage_bucket='gaana1', playback_path='', image_path=self.img_url)

    def get_track(self):
        try:
            track = Track.get_by_ref_id(self.ref_id)
        except:
            return self.make_track()
        else:
            return track
    
    def is_saved(self):
        try:
            Track.get_by_ref_id(self.ref_id)
        except:
            return False
        else:
            return True


def search(word, limit=10, lang=None):
    url = GAANA1_BASEURL + "songs/search?query="+word+"&limit="+str(limit)
    print('searching with gaana1', url)

    content = http_get(url)
    if content is None:
        return None
    
    data = json.loads(content)
    if type(data) == list:
        tracks = []
        for song in data:
            try:
                gaana1Track = Gaana1Track(song)
            except:
                print('error extracting song', song)
            else:
                track = gaana1Track.get_track()
                if track is not None:
                    tracks.append(track)
        return tracks


def get_stream_url(track: Track):
    seo_key = track.ref_id.split(':')[1]
    url = GAANA1_BASEURL + "songs/info/?seokey="+seo_key

    content = http_get(url)
    if content is None:
        return None

    data = json.loads(content)
    if len(data)>0:
        try:
            song = Gaana1Track(data[0])
            return song.stream_url
        except:
            print('error extracting song', song)
    return None