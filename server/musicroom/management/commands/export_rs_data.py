from django.core.management.base import BaseCommand
from musicroom.models import PlaybackHistory, Count, User
import csv
from django.utils import timezone


class Command(BaseCommand):
    help = 'Exports user data for recommendation system in csv format, loc: musicroom/mlKit/data/input/'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, required=False, default=10000)
    
    def export_file(self, file_name, data, header):
        csv_file = open(f'../mlKit/data/input/{file_name}.csv', 'w')
        writer = csv.writer(csv_file)
        writer.writerow(header)
        for row in data:
            writer.writerow(row.values())
        csv_file.close()

    def handle(self, *args, **options):
        limit = options['limit']
        q2 = PlaybackHistory.objects.values('user','track').annotate(frequency=Count('user'))#.filter(frequency__gte=2)
        q = q2[:limit]
        self.export_file('listening_history', data=q, header=['user_id', 'track_id', 'frequency'])
        count = q.count()
        self.stdout.write(self.style.SUCCESS(f'Exported {count} rows to listening_history.csv'))
        users = User.objects.filter(last_seen__gte = (timezone.now() - timezone.timedelta(days=15)))\
            .order_by('-last_seen').values('id')[:1000]
        self.export_file('target_users', data=users, header=['user_id'])
        self.stdout.write(self.style.SUCCESS(f'Exported {users.count()} rows to target_users.csv'))
