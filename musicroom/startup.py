from musicroom.models import User, Room, Track
import datetime


def init():
    tracks_count = Track.objects.count()
    if tracks_count == 0:
        print("No tracks saved in DB")
        print("Creating first track..")
        track = Track.create(title='House tune', artists='xHouse', duration=datetime.time(
            0, 2, 30), filename='sample.mp3', storage_bucket='home', playback_path='/sample.mp3')
        track.save()