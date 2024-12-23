from django.contrib import admin
from .models import (
    Event, CustomUser, ServicesCategory, Service, Discount,
    Specialist, WorkingSchedule, Booking
)
from django.contrib.auth.admin import UserAdmin

# login & register


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'first_name',
                    'last_name', 'phone_number', 'birth_date')
    search_fields = ('username', 'email', 'phone_number',
                     'first_name', 'last_name')
    list_filter = ('username', 'phone_number')
    readonly_fields = ("created_at", "id")
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('phone_number', 'birth_date')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('phone_number', 'birth_date')}),
    )

# calendar


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('participants', 'start_date', 'end_date',
                    'start_time', 'end_time', 'theme')
    search_fields = ('participants', 'description')
    list_filter = ('theme', 'start_date', 'end_date')


# services
@admin.register(ServicesCategory)
class ServicesCategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon')
    search_fields = ('title',)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category')
    search_fields = ('title', 'category__title')
    list_filter = ('category',)


@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ('title', 'discount_percentage',
                    'end_date', 'active', 'service', 'image')
    search_fields = ('title', 'service__title')
    list_filter = ('active', 'end_date')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.active = True
        super().save_model(request, obj, form, change)

# Həkim rezervasiya
class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    readonly_fields = ('date_time', 'created_at')
    can_delete = False
    show_change_link = True

@admin.register(Specialist)
class SpecialistAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'rating')
    search_fields = ('first_name', 'last_name', 'services__title')
    list_filter = ('rating',)
    filter_horizontal = ('services',)
    # inlines = [BookingInline] 


@admin.register(WorkingSchedule)
class WorkingScheduleAdmin(admin.ModelAdmin):
    list_display = ('specialist', 'days_of_week', 'start_time', 'end_time')
    search_fields = ('specialist__first_name', 'specialist__last_name', 'days_of_week')
    list_filter = ('days_of_week',)



@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('specialist', 'date_time', 'created_at')
    search_fields = ('specialist__first_name',
                     'specialist__last_name', 'date_time')
    list_filter = ('specialist', 'date_time')
