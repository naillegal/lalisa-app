# Generated by Django 5.1.5 on 2025-02-07 18:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lalisa', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='accepted_at',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
    ]
