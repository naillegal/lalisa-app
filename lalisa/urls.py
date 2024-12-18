from django.urls import path, include
from . import views
from rest_framework import routers
from .views import EventViewSet

router = routers.DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('', views.login_view, name='login_view'),
    path('calendar/', views.calendar_view, name='calendar_view'),
]
