import datetime
from django.utils import timezone
from musicroom.common import to_json, dump_datetime, makecode
from musicroom.models import Track
from musicroom.settings import GAANA1_BASEURL
import tempfile
import time
import json
from .musicUtils import http_get, sterilize_artists, sterilize_name, is_name_match

"""
    Gaana API
    https://gaana.boundary.ml/docs/
    https://github.com/ZingyTomato/GaanaPy
"""


class Gaana1Track:
    def __init__(self, obj):
        self.seo_key = obj['seokey']
        self.ref_id = 'gaana1:'+self.seo_key
        self.duration = int(obj['duration']) if 'duration' in obj else None
        self.title = obj['title']
        self.artists = obj['artists']
        self.artist_ids = [str(id).strip() for id in obj['artist_seokeys'].split(',')] if 'artist_seokeys' in obj else []
        self.language = obj['language']
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
            self.img_url = obj['images']['urls']['medium_artwork']
        except:
            pass
        if self.img_url is None:
            try:
                self.img_url = obj['images']['urls']['small_artwork']
            except:
                pass
        
    def make_track(self):
        if self.duration is None:
            raise Exception('Track data is not complete, cannot create track')
        
        mins, secs = divmod(self.duration, 60)

        track = Track.create(title=self.title, artists=self.artists, duration=datetime.time(
            0, mins, secs), ref_id=self.ref_id, storage_bucket='gaana1', playback_path='', 
            image_path=self.img_url, language=self.language,)
        
        artist_names = [name.strip() for name in self.artists.split(',')]
        for ind, artist_id in enumerate(self.artist_ids):
            if artist_id != '' and len(artist_names[ind])>0:
                track.add_create_artist(name=artist_names[ind],ref_id='gaana1:'+artist_id)

        return track

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
    
    def get_obj(self):
        return {'track_id': 'unsaved:gaana1:'+self.seo_key, 
                'title': self.title, 
                'duration': 123,
                'artists': self.artists, 
                'playback_url': '', 
                'image_url': self.img_url,
                'gaana_id': self.seo_key,
               }


def search(word, limit=10, lang=None, fast=False):
    url = GAANA1_BASEURL + "songs/search?query="+word+"&limit="+str(limit)+"&fast="+str(fast).lower()
    print('searching with gaana1', url)
    return extract_from_url(url, make_track = not fast)


def find_track(name: str, artists: str, make_track=True):
    artists = sterilize_artists(artists)
    name = sterilize_name(name)

    q = (name+' '+artists[0]).replace(" ", "+")
    tracks = search(q, limit=12, fast=True)
    if tracks is None:
        return None

    for track in tracks:
        #print('track from gaana1', track)
        track_artists = sterilize_artists(track['artists'])
        track_name = sterilize_name(track['title'])
        if is_name_match(track_name, name) and (artists[0] in track_artists):
            if make_track:
                return save_track(track['gaana_id'])
            return track
    return None


def get_stream_url(track: Track):
    seo_key = track.ref_id.split(':')[1]
    url = GAANA1_BASEURL + "songs/info/?seokey="+seo_key

    content = http_get(url)
    if content is None:
        return None

    data = json.loads(content)
    if len(data) > 0:
        try:
            song = Gaana1Track(data[0])
            return song.stream_url
        except:
            print('error extracting song', song)
    return None


explore_urls = [{'url': "trending?language=English&limit=10", 'name': 'Trending in English'}, 
                {'url': "trending?language=Hindi&limit=10", 'name': 'Trending in Hindi'}, 
                {'url': "playlists/info/?seokey=gaana-dj-gaana-international-top-50", 'name': 'International Top 50'}, 
                {'url': "playlists/info/?seokey=gaana-dj-edm-top-30-1", 'name': 'EDM - Top 30'}, 
                {'url': "playlists/info/?seokey=gaana-dj-hip-hop-top-30", 'name': 'Hip Hop - Top 30'}
                ]


def extract_from_url(url, make_track=True):
    content = http_get(url)
    if content is None:
        return None

    data = json.loads(content)
    if type(data) == list:
        tracks: list[Track] = []
        for song in data:
            try:
                gaana1Track = Gaana1Track(song)
            except Exception as e:
                print('error extracting song', song, e)
            else:
                if make_track:
                    track = gaana1Track.get_track()
                    if track is not None:
                        tracks.append(track.get_obj())
                else:
                    tracks.append(gaana1Track.get_obj())
        return tracks


def get_file_content(path):
    print('accessing file:', path, '...')
    try:
        with open(path) as f:
            return f.read()
    except:
        return None
    

def set_file_content(path, content):
    print('writing file:', path, '...')
    with open(path, 'w') as f:
        f.write(content)


def get_cache(key):
    folder = tempfile.gettempdir()
    path = folder + '/mr_' + key + '.json'
    time_mod = get_file_content(path + '.time')
    if time_mod is not None:
        time_mod = int(time_mod)
        if time.time() - time_mod < 60*60*12:
            return get_file_content(path)
    return None


def set_cache(key, content):
    folder = tempfile.gettempdir()
    path = folder + '/mr_' + key + '.json'
    set_file_content(path, content)
    set_file_content(path + '.time', str(int(time.time())))


def explore():
    cache_key = 'gaana1_explore'
    f = get_cache(cache_key)
    if f is not None:
        return json.loads(f)
    result = []
    for playlist in explore_urls:
        url = GAANA1_BASEURL + playlist['url']
        print('searching with gaana1', url)
        tracks = extract_from_url(url)
        if tracks is not None:
            result.append({'title': playlist['name'], 'tracks': tracks})
    set_cache(cache_key, json.dumps(result))
    return result


def save_track(seo_key):
    try:
        track = Track.get_by_ref_id('gaana1:'+seo_key)
    except:
        pass
    else:
        return track
    url = GAANA1_BASEURL + "songs/info/?seokey="+seo_key
    tracks = extract_from_url(url, make_track=True)
    if tracks is not None and len(tracks) > 0:
        return Track.get_by_id(tracks[0]['track_id'])
    return None
