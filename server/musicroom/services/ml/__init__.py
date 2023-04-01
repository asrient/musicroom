from musicroom.models import User, PlaybackHistory, Artist, Room, Track, UserTrackRecommendation, TrackTrackRecommendation, LibraryTrack
from musicroom.services.music.spotify import Spotify

'''
Derived recommendations ideas:
    content based, based on current tracks in the room: Tracks similar to the ones in the room
    content based, based on recent tracks: Tracks similar to your recent history
    collaborative filtering, based on current users in the room: Tracks everyone in the room will like
'''

REFRESH_URL = 'recommendations'

def consolidate(tracks: list[dict]):
    mem = {}
    for track in tracks:
        if track['track_id'] not in mem:
            mem[track['track_id']] = track
            if 'score' not in track:
                track['score'] = 1
        else:
            mem[track['track_id']]['score'] += track['score'] if 'score' in track else 1
    tracks = sorted(mem.values(), key=lambda x: x['score'], reverse=True)
    return tracks

def extend(l: list, items: list):
    if items is not None:
        l.extend(items)

def __return_result(title, tracks: list[Track], refresh_params = None):
    if len(tracks) == 0:
        return None
    tracks = consolidate([track.get_obj() for track in tracks])
    return {
        'title': title,
        'tracks': tracks,
        'refresh_url': REFRESH_URL + '?refresh=' + refresh_params if refresh_params is not None else None
    }

###
def get_recent_tracks(user: User):
    added = set()
    tracks = [track for track in PlaybackHistory.get_recent_user_tracks(user) if track.id not in added and not added.add(track.id)]
    return __return_result('Recently Played', tracks=tracks)

###
def get_current_artist_tracks(user: User):
    if user.room is None:
        return None
    room: Room = user.room
    artist: Artist = room.current_roomtrack.track.get_artists()[0]
    return __return_result(f'More from {artist.name}', artist.get_top_tracks(8))


def fetch_similar_tracks(tracks: list[Track]) -> list[Track]:
    if tracks is None or len(tracks) == 0:
        return None
    spotify = Spotify()
    spotify_ids = []
    for track in tracks:
        spotify_id = spotify.get_spotify_id(track)
        if spotify_id is not None:
            spotify_ids.append(spotify_id)
    if len(spotify_ids) <= 0:
        print('No spotify ids found for tracks', tracks)
        return None
    return spotify.get_similar_tracks_from_spotify_ids(spotify_ids, 10)


def get_recommendations_for_users(users: list[User], limit = 15):
    track_groups = []
    for user in users:
        recc = UserTrackRecommendation.get_recommendations(user, limit = limit)
        if recc is not None and len(recc) > 0:
            extend(track_groups, recc)
    return track_groups


def get_recommendations_for_tracks(tracks: list[Track], limit = 15):
    track_groups = []
    for track in tracks:
        recc = TrackTrackRecommendation.get_recommendations(track, limit = limit)
        if recc is not None and len(recc) > 0:
            extend(track_groups, recc)
    return track_groups

###
def recommendations_for_room(room: Room, refresh = False):
    tracks = []
    if not refresh:
        extend(tracks, get_recommendations_for_users(room.get_members()[:5], 3))
        extend(tracks, get_recommendations_for_tracks(room.get_tracks()[:5], 3))
    if len(tracks) < 3:
        extend(tracks, fetch_similar_tracks(room.get_tracks()[:5]))
    return __return_result('For everyone in room', tracks, 'room')

###
def recommendations_for_you(user: User, refresh = False):
    tracks = []
    if not refresh:
        extend(tracks, get_recommendations_for_users([user]))
        extend(tracks, get_recommendations_for_tracks(LibraryTrack.get_library_tracks(user, 5)))
    if refresh or len(tracks) < 3:
        extend(tracks, fetch_similar_tracks(PlaybackHistory.get_recent_user_tracks(user, 5)))
        for track in tracks:
            UserTrackRecommendation.add(user, track)
    if len(tracks) < 3:
        extend(tracks, fetch_similar_tracks(LibraryTrack.get_library_tracks(user, 5)))
        for track in tracks:
            UserTrackRecommendation.add(user, track)
    return __return_result('Suggestions for you', tracks, 'you')

###
def recommendations_for_track(track: Track, refresh = False):
    print('recommendations_for_track', track.title)
    tracks = []
    if not refresh:
        extend(tracks, get_recommendations_for_tracks([track]))
    if len(tracks) < 3:
        extend(tracks, fetch_similar_tracks([track]))
        for t in tracks:
            TrackTrackRecommendation.add(track, t)
    return __return_result(f'Similar to {track.title}', tracks, 'track:{}'.format(track.id))

