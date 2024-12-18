from django.db import models

# Create your models here.

from django.db import models

class Event(models.Model):
    THEME_CHOICES = [
        ('green', 'Personal'),
        ('blue', 'Business'),
        ('orange', 'Family'),
        ('purple', 'Important'),
        ('red', 'Holiday'),
    ]

    participants = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    theme = models.CharField(max_length=10, choices=THEME_CHOICES)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.participants} - {self.start_date} {self.start_time}"
