# Generated by Django 5.1.5 on 2025-02-09 17:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lalisa', '0010_historylog'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='otp_code',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='gender',
            field=models.CharField(blank=True, choices=[('male', 'Kişi'), ('female', 'Qadın')], max_length=6, null=True),
        ),
    ]
