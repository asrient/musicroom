# Generated by Django 3.0.8 on 2023-03-18 14:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('musicroom', '0003_room_last_check_on'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='artwork_colors',
            field=models.CharField(default=None, max_length=255, null=True),
        ),
    ]
