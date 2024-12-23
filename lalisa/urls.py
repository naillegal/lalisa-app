from django.urls import path, include
from . import views
from rest_framework import routers
from .views import (
    EventViewSet, RegisterView, LoginView, UserListViewSet,
    ServicesCategoryViewSet, ServiceViewSet, DiscountViewSet,
    SpecialistViewSet, WorkingScheduleViewSet, BookingViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
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


urlpatterns = [
    path("api/", include(router.urls)),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", views.login_view, name="login_view"),
    path("calendar/", views.calendar_view, name="calendar_view"),
]
