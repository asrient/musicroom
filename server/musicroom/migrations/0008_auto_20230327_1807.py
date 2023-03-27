# Generated by Django 3.0.8 on 2023-03-27 18:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('musicroom', '0007_librarytrack'),
    ]

    operations = [
        migrations.AlterField(
            model_name='librarytrack',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='library', to=settings.AUTH_USER_MODEL),
        ),
    ]
