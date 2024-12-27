# urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from . import views  
from rest_framework import routers
from .views import (
    EventViewSet, RegisterView, LoginView, UserListViewSet,
    ServicesCategoryViewSet, ServiceViewSet, DiscountViewSet,
    SpecialistViewSet, WorkingScheduleViewSet, BookingViewSet,
    # Yeni
    EmailVerificationView
)

router = routers.DefaultRouter()
router.register(r"events", EventViewSet)
router.register(r"users", UserListViewSet)
router.register(r"categories", ServicesCategoryViewSet)
router.register(r"services", ServiceViewSet)
router.register(r"discounts", DiscountViewSet)
router.register(r"specialists", SpecialistViewSet)
router.register(r"working-schedules", WorkingScheduleViewSet)
router.register(r"bookings", BookingViewSet)

schema_view = get_schema_view(
    openapi.Info(
        title="Project's API",
        default_version='v1',
        description="Bütün endpointlər üçün Swagger",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="info@example.com"),
        license=openapi.License(name="Test License"),
    ),
    public=True,
)

urlpatterns = [
    path("api/", include(router.urls)),

    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),

    path("api/verify-email/", EmailVerificationView.as_view(), name="verify_email"),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('swagger-json/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger-redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path("", views.login_view, name="login_view"),
    path("calendar/", views.calendar_view, name="calendar_view"),
]
