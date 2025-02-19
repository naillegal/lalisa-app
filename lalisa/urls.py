from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = DefaultRouter()

router.register(r'doctor-service', views.DoctorServiceViewSet,
                basename='doctor-service')

schema_view = get_schema_view(
    openapi.Info(
        title="Lalisa API Documentation",
        default_version='v1',
        description="API-lər üçün Swagger dokumentasiyası",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    re_path(r'^api/swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^api/swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^api/redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path("api/", include(router.urls)),
    path("login/submit/", views.login_submit, name="login_submit"),
    path("logout/", views.logout_view, name="logout_view"),
    path("", views.login_view, name="login_view"),
    path("users/", views.users_view, name="users_view"),
    path("api/users/", views.UserListCreateAPIView.as_view(),
         name="user_list_create"),
    path("api/users/<int:pk>/", views.UserRetrieveUpdateDestroyAPIView.as_view(),
         name="user_retrieve_update_destroy"),
    path("api/register/", views.UserRegisterAPIView.as_view(), name="user_register"),
    path("api/login/", views.UserLoginAPIView.as_view(), name="user_login"),
    path("api/logout/", views.UserLogoutAPIView.as_view(), name="user_logout"),
    path("api/activate/", views.ActivateUserAPIView.as_view(), name="user_activate"),
    path("services/", views.services_view, name="services_view"),
    path("api/categories/", views.CategoryListCreateAPIView.as_view(),
         name="category_list_create"),
    path("api/categories/<int:pk>/", views.CategoryRetrieveUpdateDestroyAPIView.as_view(),
         name="category_retrieve_update_destroy"),
    path("api/services/", views.ServiceListCreateAPIView.as_view(),
         name="service_list_create"),
    path("api/services/<int:pk>/", views.ServiceRetrieveUpdateDestroyAPIView.as_view(),
         name="service_retrieve_update_destroy"),
    path('api/services/filter/',
         views.ServiceFilterAPIView.as_view(), name='service_filter'),
    path("doctors/", views.doctors_view, name="doctors_view"),
    path("api/doctors/", views.DoctorListCreateAPIView.as_view(),
         name="doctor_list_create"),
    path("api/doctors/<int:pk>/", views.DoctorRetrieveUpdateDestroyAPIView.as_view(),
         name="doctor_retrieve_update_destroy"),
    path("api/doctors/<int:doctor_id>/permission/",
         views.DoctorPermissionAPIView.as_view(), name="doctor_permission_api"),
    path("api/doctors/<int:doctor_id>/schedules/",
         views.DoctorScheduleListCreateAPIView.as_view(), name="doctor_schedule_list_create"),
    path("api/doctors/<int:doctor_id>/schedules/<int:pk>/",
         views.DoctorScheduleDetailAPIView.as_view(), name="doctor_schedule_detail"),
    path("api/doctors/<int:doctor_id>/schedules/day/<int:day_of_week>/",
         views.DoctorScheduleByDayAPIView.as_view(), name="doctor_schedule_by_day"),
    path("laser/", views.laser_view, name="laser_view"),
    path("api/laser_usage/", views.LaserUsageListCreateAPIView.as_view(),
         name="laser_usage_list_create"),
    path("api/laser_usage/<int:pk>/",
         views.LaserUsageRetrieveUpdateDestroyAPIView.as_view(), name="laser_usage_detail"),
    path("treatments/", views.treatment_view, name="treatment_view"),
    path("api/treatments/", views.TreatmentListCreateAPIView.as_view(),
         name="treatment_list_create"),
    path("api/treatments/<int:pk>/", views.TreatmentRetrieveUpdateDestroyAPIView.as_view(),
         name="treatment_retrieve_update_destroy"),
    path("discount-codes/", views.discount_code_view, name="discount_code_view"),
    path("api/discount-codes/", views.DiscountCodeListCreateAPIView.as_view(),
         name="discount_code_list_create"),
    path("api/discount-codes/<int:pk>/", views.DiscountCodeRetrieveUpdateDestroyAPIView.as_view(),
         name="discount_code_retrieve_update_destroy"),
    path("pages/", views.pages_view, name="pages_view"),
    path("api/discount-banners/", views.DiscountBannerListCreateAPIView.as_view(),
         name="discount_banner_list_create"),
    path("api/discount-banners/<int:pk>/", views.DiscountBannerRetrieveUpdateDestroyAPIView.as_view(),
         name="discount_banner_retrieve_update_destroy"),
    path("api/main-banners/", views.MainBannerListCreateAPIView.as_view(),
         name="main_banner_list_create"),
    path("api/main-banners/<int:pk>/", views.MainBannerRetrieveUpdateDestroyAPIView.as_view(),
         name="main_banner_retrieve_update_destroy"),
    path("reservations/", views.reservations_view, name="reservations_view"),
    path("api/reservations/", views.ReservationListCreateAPIView.as_view(),
         name="reservation_list_create"),
    path("api/reservations/<int:pk>/", views.ReservationRetrieveUpdateDestroyAPIView.as_view(),
         name="reservation_retrieve_update_destroy"),
    path("cashback/", views.cashback_view, name="cashback_view"),
    path('api/cashbacks/', views.UserCashbackListAPIView.as_view(),
         name='cashback_list'),
    path('api/cashbacks/<int:user_id>/',
         views.UserCashbackDetailAPIView.as_view(), name='cashback_detail'),
    path('api/cashback-history/', views.CashbackHistoryListAPIView.as_view(),
         name='cashback_history_list'),
    path("api/cashback/<int:user_id>/toggle/",
         views.toggle_cashback_status, name="toggle_cashback_status"),
    path("api/cashback/<int:user_id>/update_balance/",
         views.update_cashback_balance, name="update_cashback_balance"),
    path("payment-acceptance/", views.payment_acceptance_view,
         name="payment_acceptance_view"),
    path("api/reservations/<int:reservation_id>/accept_customer/",
         views.AcceptCustomerReservationAPIView.as_view(), name="accept_customer_reservation"),
    path("api/reservations/<int:reservation_id>/details/",
         views.ReservationDetailAPIView.as_view(), name="reservation_detail"),
    path("api/payments/", views.PaymentCreateAPIView.as_view(),
         name="payment_create"),
    path("doctor-payment/", views.doctor_payment_view, name="doctor_payment_view"),
    path("doctor-payment/<int:doctor_id>/",
         views.doctor_payment_view, name="doctor_payment_view"),
    path("api/doctor-payment/<int:doctor_id>/calculate/",
         views.doctor_payment_calculate_view, name="doctor_payment_calculate"),
    path("api/doctor-payment/<int:doctor_id>/constant_cost/",
         views.doctor_constant_cost_view, name="doctor_constant_cost"),
    path("api/doctor-payment/<int:doctor_id>/update_total_earning/",
         views.update_doctor_total_earning,
         name="update_doctor_total_earning"),
    path("api/doctor-payment/search/",
         views.doctor_search_view, name="doctor_search_doctor"),
    path("excel/", views.excel_view, name="excel_view"),
    path("api/excel/", views.ExcelReservationListAPIView.as_view(), name="excel_data"),
    path("api/excel/export/", views.export_excel_view, name="excel_export"),
    path("statistics/", views.statistics_view, name="statistics_view"),
    path("api/statistics/", views.StatisticsAPIView.as_view(), name="api_statistics"),
    path("api/statistics/graphs/", views.StatisticsGraphsAPIView.as_view(),
         name="api_statistics_graphs"),
    path("api/statistics/doctor-earnings/",
         views.DoctorEarningsAPIView.as_view(), name="api_doctor_earnings"),
    path("api/doctor-search/", views.doctor_search_view, name="doctor_search"),
    path("moderator/", views.moderator_view, name="moderator_view"),
    path("api/moderators/", views.ModeratorListCreateAPIView.as_view(),
         name="moderator_list_create"),
    path("api/moderators/<int:pk>/",
         views.ModeratorRetrieveUpdateDestroyAPIView.as_view(), name="moderator_detail"),
    path("history/", views.history_view, name="history_view"),
    path("notification/", views.notification_view, name="notification_view"),
    path("api/notifications/", views.NotificationListCreateAPIView.as_view(),
         name="notification_list_create"),
    path("api/update_firebase_token/", views.update_firebase_token,
         name="update_firebase_token"),
    path("api/forgot_password/", views.ForgotPasswordAPIView.as_view(),
         name="forgot_password"),
    path("api/reset_password/", views.ResetPasswordAPIView.as_view(),
         name="reset_password"),
    path("api/available-doctors/", views.AvailableDoctorsAPIView.as_view(),
         name="available-doctors"),
]
