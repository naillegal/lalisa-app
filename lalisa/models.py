from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from multiselectfield import MultiSelectField

# login & register


class CustomUser(AbstractUser):
    birth_date = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

# calendar


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


# services
class ServicesCategory(models.Model):
    title = models.CharField(max_length=100, unique=True)
    icon = models.ImageField(upload_to='category_icons/')

    def __str__(self):
        return self.title


class Service(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='service_images/')
    category = models.ForeignKey(
        ServicesCategory, related_name='services', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title


class Discount(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='discount_images/')
    discount_percentage = models.PositiveIntegerField()
    end_date = models.DateField()
    active = models.BooleanField(default=True)
    service = models.ForeignKey(
        'Service', related_name='discounts', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.discount_percentage}%"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.active = True
        super().save(*args, **kwargs)

# Həkim rezervasiya


class Specialist(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        help_text="Rating between 1.0 and 5.0"
    )
    services = models.ManyToManyField(Service, related_name='specialists')

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class WorkingSchedule(models.Model):
    DAYS_OF_WEEK = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]
    specialist = models.ForeignKey(
        Specialist, related_name='working_schedules', on_delete=models.CASCADE
    )
    days_of_week = MultiSelectField(choices=DAYS_OF_WEEK, max_length=50)

    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.specialist} - {self.days_of_week} ({self.start_time} - {self.end_time})"


class Booking(models.Model):
    specialist = models.ForeignKey(
        Specialist, related_name='bookings', on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('specialist', 'date_time')

    def __str__(self):
        return f"{self.specialist} - {self.date_time}"
