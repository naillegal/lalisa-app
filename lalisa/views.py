from django.shortcuts import render
from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer
# Create your views here.

# index html 
def login_view(request):
    return render(request, 'index.html')

# calendar html 
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-start_date', '-start_time')
    serializer_class = EventSerializer

def calendar_view(request):
    return render(request, 'calendar.html')
