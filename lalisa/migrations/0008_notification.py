# Generated by Django 5.1.5 on 2025-02-09 08:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lalisa', '0007_remove_moderator_is_active_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipients', models.ManyToManyField(related_name='notifications', to='lalisa.user')),
            ],
        ),
    ]
