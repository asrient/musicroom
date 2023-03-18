import datetime
from django.utils import timezone
from musicroom.common import to_json, dump_datetime, makecode
from musicroom.models import Track
from musicroom.settings import JIOMUSIC_STREAM_BASEURL
from .musicUtils import get_duration_from_m3u8
import json
import urllib.request


IMG_BASEURL = "https://jioimages.cdn.jio.com/hdindiamusic/images/"
bitrate = 320


def get_play_url(song_id):
    ids = song_id.split('_')
    return JIOMUSIC_STREAM_BASEURL+ids[0]+'/'+ids[1]+'/'+song_id+'_'+str(bitrate)+'.mp4/playlist.m3u8'


def get_duration_from_id(song_id):
    ids = song_id.split('_')
    url = JIOMUSIC_STREAM_BASEURL + \
        ids[0]+'/'+ids[1]+'/'+song_id+'_'+str(bitrate)+'.mp4/chunklist.m3u8'
    return get_duration_from_m3u8(url)


def make_track(obj):
    jio_id = obj['id']
    ref_id = 'jio:'+jio_id
    duration = get_duration_from_id(jio_id)
    if duration is not None:
        mins, secs = divmod(duration, 60)
        pb_path = get_play_url(jio_id)
        img_url = IMG_BASEURL+obj['image']
        track = Track.create(title=obj['title'], artists=obj['artist'], duration=datetime.time(
            0, mins, secs), ref_id=ref_id, storage_bucket='jio', playback_path=pb_path, image_path=img_url)
        return track
    else:
        return None


def get_track(obj):
    jio_id = obj['id']
    ref_id = 'jio:'+jio_id
    try:
        track = Track.get_by_ref_id(ref_id)
    except:
        return make_track(obj)
    else:
        return track


def search(word, limit=10, lang=None):
    url = "http://beatsapi.media.jio.com/v2_1/beats-api/jio/src/response/search2/"+word+"/"
    if lang != None:
        url += lang
    try:
        content = urllib.request.urlopen(url).read()
    except:
        return None
    else:
        data = json.loads(content)
        if 'result' in data:
            jio_ids = []
            tracks = []
            songs = data['result']['data']['Best Match']
            songs += data['result']['data']['Songs']
            for song in songs:
                if song['type'] == 'songs' and song['id'] not in jio_ids:
                    track = get_track(song)
                    if track is not None:
                        tracks.append(track)
                        jio_ids.append(song['id'])
                        limit -= 1
                        if limit<=0:
                            break
            return tracks
        else:
            return None


def get_stream_url(track: Track):
    return track.playback_path