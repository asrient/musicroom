from musicroom.models import Track
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from musicroom.settings import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
from .musicUtils import sterilize_artists, sterilize_name, is_name_match
from . import Music

'''
Find similar track:
- check if it has a spotify_id attached.
- if not, get the id from spotify using get_spotify_id and attach it to the track for future
- once we have the spotify_id, get similar tracks using spotify's api (--)
- For each track, check if it exists in our db using spotify_id
- If not, then generate the track by using music.find_track
- Attach the similar tracks to the track on db for future use (with a date)
'''


class Spotify:
    def __init__(self):
        self.auth_manager = SpotifyClientCredentials(client_id=SPOTIFY_CLIENT_ID, client_secret=SPOTIFY_CLIENT_SECRET)
        self.sp = spotipy.Spotify(auth_manager=self.auth_manager)
        self.musicService = Music()

    def find_track_on_spotify(self, name: str, artists: str):
        print('find_track_on_spotify', name, artists)
        result = self.sp.search(q='artist:' + artists + ' track:' + name, type='track')
        artists = sterilize_artists(artists)
        for track in result['tracks']['items']:
            track_artists = [sterilize_name(track['name']) for track in track['artists']]
            # print('track_artists', track_artists)
            # print('track_name', sterilize_name(track['name']), 'name', sterilize_name(name))
            # print('artists[0]', artists[0], 'in track_artists', track_artists)
            # print('spotify_id', track['id'])
            if is_name_match(sterilize_name(track['name']), sterilize_name(name)) and (artists[0] in track_artists):
                return track
        return None

    def get_spotify_id(self, track: Track):
        # first look in db, if not found, search spotify using find_track_on_spotify
        if track.spotify_id != None:
            return track.spotify_id
        spotify_track = self.find_track_on_spotify(track.title, track.artists)
        if spotify_track != None:
            track.spotify_id = spotify_track['id']
            track.save()
            return track.spotify_id
        return None

    def get_similar_tracks_from_spotify_ids(self, spotify_ids: list[str], limit: int = 20) -> list[dict]:
        print('get_similar_tracks_from_spotify_ids', spotify_ids)
        result = self.sp.recommendations(seed_tracks=spotify_ids, limit=limit)
        tracks = []
        print('recommendations from spotify for', spotify_ids, [ t['name'] + ' - ' + t['artists'][0]['name'] for t in result['tracks']])
        for sp_track in result['tracks']:
            #print(sp_track['name'], sp_track['artists'][0]['name'])
            #print('spotify_id', sp_track['id'])
            track: Track = None
            try:
                track = Track.get_by_spotify_id(sp_track['id'])
            except:
                track = self.musicService.find_track(sp_track['name'], sp_track['artists'][0]['name'], make_track=True)
                if track is not None:
                    track.spotify_id = sp_track['id']
                    track.save()
            #print('music service track', track)
            if track is not None:
                tracks.append(track)
        return tracks
