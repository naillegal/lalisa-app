from django.contrib import admin
from .models import (User, Category, Service, Doctor, DoctorSchedule, DoctorPermission, LaserUsage, Treatment,
                     TreatmentStep, DiscountCode, DiscountBanner, MainBanner, Reservation, UserCashback, CashbackHistory,
                     Payment, DoctorService, Moderator, Notification)


class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'status', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone')
    ordering = ('created_at',)
    readonly_fields = ('created_at',)


admin.site.register(User, UserAdmin)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)


admin.site.register(Category, CategoryAdmin)


class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price',
                    'procedure_duration', 'created_at')
    search_fields = ('name', 'category__name')
    list_filter = ('category',)
    ordering = ('-created_at',)


admin.site.register(Service, ServiceAdmin)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name',
                    'specialty', 'rating', 'experience')
    search_fields = ('first_name', 'last_name', 'specialty')
    ordering = ('-id',)


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'day_of_week', 'is_active',
                    'start_time', 'end_time')
    list_filter = ('doctor', 'day_of_week', 'is_active')


@admin.register(DoctorPermission)
class DoctorPermissionAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'permission_type', 'start_date',
                    'end_date', 'specific_date', 'start_time', 'end_time')
    list_filter = ('permission_type',)


@admin.register(LaserUsage)
class LaserUsageAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'before_shots', 'after_shots',
                    'usage', 'areas', 'created_at')
    list_filter = ('doctor', 'created_at')
    search_fields = ('doctor__first_name', 'doctor__last_name', 'areas')


@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'service', 'created_at')
    list_filter = ('service',)
    search_fields = ('service__name',)
    ordering = ('-id',)


@admin.register(TreatmentStep)
class TreatmentStepAdmin(admin.ModelAdmin):
    list_display = ('id', 'treatment', 'title', 'time_offset', 'created_at')
    list_filter = ('treatment',)
    search_fields = ('title', 'description')
    ordering = ('-id',)


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'uses',
                    'validity', 'is_active', 'created_at')
    list_filter = ('is_active', 'validity')
    search_fields = ('code',)
    ordering = ('-created_at',)


@admin.register(DiscountBanner)
class DiscountBannerAdmin(admin.ModelAdmin):
    list_display = ('text', 'discount_percent', 'service', 'created_at')
    search_fields = ('text', 'service__name')
    ordering = ('-id',)


@admin.register(MainBanner)
class MainBannerAdmin(admin.ModelAdmin):
    list_display = ('text', 'service', 'created_at')
    search_fields = ('text', 'service__name')
    ordering = ('-id',)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'full_name', 'doctor', 'get_services',
                    'date', 'start_time', 'end_time', 'created_at')
    search_fields = ('full_name', 'phone',
                     'user__first_name', 'user__last_name')
    ordering = ('-date', '-start_time')

    def get_services(self, obj):
        return ", ".join([service.name for service in obj.services.all()])
    get_services.short_description = 'Services'


@admin.register(UserCashback)
class UserCashbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'is_active', 'created_at')
    search_fields = ('user__first_name', 'user__last_name')
    list_filter = ('is_active',)
    ordering = ('-created_at',)


@admin.register(CashbackHistory)
class CashbackHistoryAdmin(admin.ModelAdmin):
    list_display = ('user_cashback', 'change_amount', 'created_at')
    search_fields = ('user_cashback__user__first_name',
                     'user_cashback__user__last_name')
    ordering = ('-created_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('reservation', 'payment_type', 'amount', 'created_at')


@admin.register(DoctorService)
class DoctorServiceAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'service', 'commission_percentage')
    list_filter = ('doctor', 'service')
    search_fields = ('doctor__first_name',
                     'doctor__last_name', 'service__name')


@admin.register(Moderator)
class ModeratorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'status', 'created_at')
    search_fields = ('full_name', 'email')
    list_filter = ('status',)
    ordering = ('-created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'created_at')
    search_fields = ('message',)
    ordering = ('-created_at',)
