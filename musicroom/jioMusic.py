import datetime
from django.utils import timezone
from musicroom.common import to_json, dump_datetime, makecode
from musicroom.models import Track
from musicroom.settings import JIOMUSIC_STREAM_BASEURL
import m3u8
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
    try:
        plist = m3u8.load(url)
    except Exception as e:
        print('error', e, song_id, url)
        return None
    else:
        segments_count = len(plist.segments)
        segment_duration = plist.target_duration
        duration = (segments_count-1)*segment_duration
        last_segment = plist.segments[-1]
        duration += last_segment.duration
        duration = int(duration)
        return duration


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


def search(word, more=False, lang=None):
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
                        if not more and len(jio_ids) > 1:
                            break
            return tracks
        else:
            return None
