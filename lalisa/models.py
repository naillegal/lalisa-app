from django.db import models
from django.db.models import Sum

class User(models.Model):
    GENDER_CHOICES = (
        ('male', 'Kişi'),
        ('female', 'Qadın'),
    )
    STATUS_CHOICES = (
        ('active', 'Aktiv'),
        ('inactive', 'Deaktiv'),
    )

    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES, blank=True, null=True)
    phone = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    status = models.CharField(
        max_length=8, choices=STATUS_CHOICES, default='inactive')
    image = models.ImageField(upload_to='user_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    firebase_token = models.CharField(max_length=255, blank=True, null=True)
    otp_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return self.first_name


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    image = models.ImageField(
        upload_to='category_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Service(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='services')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    procedure_duration = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Doctor(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    image = models.ImageField(
        upload_to='doctor_images/', blank=True, null=True)
    specialty = models.CharField(max_length=255, blank=True, null=True)
    rating = models.DecimalField(
        max_digits=3, decimal_places=1, blank=True, null=True)
    experience = models.CharField(max_length=255, blank=True, null=True)
    about = models.TextField(blank=True, null=True)

    services = models.ManyToManyField(
        'Service',
        through='DoctorService',
        blank=True
    )

    constant_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    
    total_doctor_earning = models.DecimalField(max_digits=10, decimal_places=2, default=0)  


    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class DoctorSchedule(models.Model):
    DAY_CHOICES = (
        (1, 'Bazar ertəsi'),
        (2, 'Çərşənbə axşamı'),
        (3, 'Çərşənbə'),
        (4, 'Cümə axşamı'),
        (5, 'Cümə'),
        (6, 'Şənbə'),
        (7, 'Bazar'),
    )
    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    is_active = models.BooleanField(default=False)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.doctor} - {self.get_day_of_week_display()}"


class DoctorPermission(models.Model):
    PERMISSION_TYPE = (
        ('none', 'No Permission'),
        ('date_range', 'Date Range'),
        ('time_range', 'Time Range'),
    )
    doctor = models.OneToOneField(
        Doctor, on_delete=models.CASCADE, related_name='permission')
    permission_type = models.CharField(
        max_length=20, choices=PERMISSION_TYPE, default='none')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    specific_date = models.DateField(blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.doctor} icazə: {self.permission_type}"


class LaserUsage(models.Model):
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='laser_usages'
    )
    before_shots = models.IntegerField()
    after_shots = models.IntegerField()
    usage = models.IntegerField()
    areas = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Laser usage of {self.doctor} - {self.created_at}"


class Treatment(models.Model):
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='treatments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service.name} - Treatment ID {self.id}"


class TreatmentStep(models.Model):
    treatment = models.ForeignKey(
        Treatment, on_delete=models.CASCADE, related_name='steps'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    time_offset = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Step: {self.title} (Treatment ID {self.treatment_id})"


class DiscountCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    uses = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    validity = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class DiscountBanner(models.Model):
    text = models.CharField(max_length=255)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='banner_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"DiscountBanner: {self.text}"


class MainBanner(models.Model):
    text = models.CharField(max_length=255)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='banner_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"MainBanner: {self.text}"


class Reservation(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservations'
    )
    full_name = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    services = models.ManyToManyField(Service, related_name='reservations')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(blank=True, null=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('customer_accepted', 'Customer Accepted'),
        ('completed', 'Completed'),
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Reservation #{self.id} - {self.date} - {self.doctor}"

    @property
    def duration_minutes(self):
        from datetime import datetime
        if self.end_time is None:
            return None
        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)
        diff = end_dt - start_dt
        return int(diff.total_seconds() // 60)

    @property
    def total_payments(self):
        total = self.payments.aggregate(total=Sum('amount'))['total']
        return total if total is not None else 0

    @property
    def last_payment_date(self):
        last_payment = self.payments.order_by('-created_at').first()
        return last_payment.created_at if last_payment else None

    @property
    def exit_time(self):
        last_payment = self.payments.order_by('-created_at').first()
        return last_payment.created_at if last_payment else None


class Payment(models.Model):
    PAYMENT_TYPE_CHOICES = (
        ('cash', 'Nağd'),
        ('card', 'Kart'),
        ('cashback', 'Cashback'),
    )
    reservation = models.ForeignKey(
        Reservation, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(
        max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_payment_type_display()} payment for Reservation {self.reservation.id}: {self.amount}₼"


class UserCashback(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='cashback')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - Cashback Balance: {self.balance}₼"


class CashbackHistory(models.Model):
    user_cashback = models.ForeignKey(
        UserCashback, on_delete=models.CASCADE, related_name='histories')
    change_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sign = '+' if self.change_amount >= 0 else '-'
        return f"History for {self.user_cashback.user.first_name} {self.user_cashback.user.last_name} {sign}{abs(self.change_amount)}₼ on {self.created_at.strftime('%d.%m.%Y %H:%M')}"


class DoctorService(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    service = models.ForeignKey('Service', on_delete=models.CASCADE)
    commission_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0)

    class Meta:
        unique_together = ('doctor', 'service')

    def __str__(self):
        return f"{self.doctor} - {self.service} (%{self.commission_percentage})"


class Moderator(models.Model):
    STATUS_CHOICES = (
        ('active', 'Aktiv'),
        ('inactive', 'Deaktiv'),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    image = models.ImageField(upload_to='moderator_images/', blank=True, null=True)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='active')

    can_view_statistics = models.BooleanField(default=False)
    can_view_calendar = models.BooleanField(default=False)
    can_view_users = models.BooleanField(default=False)
    can_view_services = models.BooleanField(default=False)
    can_view_notification = models.BooleanField(default=False)
    can_view_treatment = models.BooleanField(default=False)
    can_view_cashback = models.BooleanField(default=False)
    can_view_pages = models.BooleanField(default=False)
    can_view_discount_code = models.BooleanField(default=False)
    can_view_doctors = models.BooleanField(default=False)
    can_view_history = models.BooleanField(default=False)
    can_view_moderator = models.BooleanField(default=False)
    can_view_laser = models.BooleanField(default=False)
    can_view_payment_acceptance = models.BooleanField(default=False)
    can_view_doctor_payment = models.BooleanField(default=False)
    can_view_excel = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
class Notification(models.Model):
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    recipients = models.ManyToManyField(User, related_name='notifications')

    def __str__(self):
        return f"Notification #{self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class HistoryLog(models.Model):
    ACTION_CHOICES = (
        ('user_created', 'İstifadəçi əlavə etdi'),
        ('reservation_completed', 'Ödəniş qəbul etdi'),
        ('laser_changed', 'Lazer atış istifadəsi bölməsində dəyişikliklər etdi'),
        ('reservation_created', 'Müştərini rezervasiya etdi'),
    )
    moderator = models.ForeignKey(
        'Moderator',
        on_delete=models.CASCADE,
        related_name='history_logs'
    )
    action_type = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.moderator.full_name} - {self.get_action_type_display()} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"