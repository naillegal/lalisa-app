from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('participants', 'start_date', 'end_date', 'start_time', 'end_time', 'theme')
    search_fields = ('participants', 'description')
    list_filter = ('theme', 'start_date', 'end_date')
