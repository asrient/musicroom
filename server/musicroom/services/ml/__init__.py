from musicroom.models import User, PlaybackHistory, Artist, Room, Track
from musicroom.services.music.spotify import Spotify

'''
Derived recommendations ideas:
    content based, based on current tracks in the room: Tracks similar to the ones in the room
    content based, based on recent tracks: Tracks similar to your recent history
    collaborative filtering, based on current users in the room: Tracks everyone in the room will like
'''

def __return_result(title, tracks):
    if len(tracks) == 0:
        return None
    return {
        'title': title,
        'tracks': tracks
    }

def get_recent_tracks(user: User):
    added = set()
    tracks = [track.get_obj() for track in PlaybackHistory.get_recent_user_tracks(user) if track.id not in added and not added.add(track.id)]
    return __return_result('Recently Played', tracks=tracks)


def get_current_artist_tracks(user: User):
    if user.room is None:
        return None
    room: Room = user.room
    artist: Artist = room.current_roomtrack.track.get_artists()[0]
    tracks = [track.get_obj() for track in  artist.get_top_tracks(6)]
    return __return_result(f'More from {artist.name}', tracks)


def get_similar_tracks(tracks: list[Track], title: str = None):
    spotify = Spotify()
    spotify_ids = [spotify.get_spotify_id(track) for track in tracks if track is not None]
    if len(spotify_ids) < 0:
        print('No spotify ids found for tracks', tracks)
        return None
    tracks = spotify.get_similar_tracks_from_spotify_ids(spotify_ids, 12)
    if title is None:
        title = 'Similar tracks'
    return __return_result(title, tracks)
