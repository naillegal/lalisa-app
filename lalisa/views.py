from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    Event, CustomUser, ServicesCategory, Service, Discount,
    Specialist, WorkingSchedule, Booking
)
from .serializers import (
    EventSerializer, RegisterSerializer, LoginSerializer,
    UserListSerializer, ServicesCategorySerializer, ServiceSerializer,
    DiscountSerializer, SpecialistSerializer, WorkingScheduleSerializer,
    BookingSerializer
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class RegisterView(APIView):

    @swagger_auto_schema(
        operation_description="Qeydiyyat (Register) üçün endpoint",
        request_body=RegisterSerializer,
        responses={
            201: openapi.Response(
                description="Uğurlu qeydiyyat",
                examples={
                    "application/json": {
                        "user": {
                            "id": 1,
                            "username": "testuser",
                            "email": "test@example.com",
                            "phone_number": "+994505555555",
                            "first_name": "Test",
                            "last_name": "User",
                            "birth_date": "2000-01-01",
                            "created_at": "2024-01-01T12:00:00Z"
                        }
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_data = UserListSerializer(user).data
            return Response({"user": user_data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):

    @swagger_auto_schema(
        operation_description="Daxil olma (Login) üçün endpoint",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, default='test'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, default='12345678t'),
            }
        ),
        responses={
            200: openapi.Response(
                description="Uğurlu daxilolma",
                examples={
                    "application/json": {
                        "user": {
                            "id": 1,
                            "username": "testuser",
                            "email": "test@example.com",
                            "phone_number": "+994505555555",
                            "first_name": "Test",
                            "last_name": "User",
                            "birth_date": "2000-01-01",
                            "created_at": "2024-01-01T12:00:00Z"
                        }
                    }
                },
            ),
            400: "Məlumat yanlışdır"
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            user_data = UserListSerializer(user).data
            return Response({"user": user_data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserListSerializer
    # permission_classes = [permissions.IsAdminUser] 


# Səhifə görünüşləri
def login_view(request):
    return render(request, "index.html")


def calendar_view(request):
    return render(request, "calendar.html")


# Calendar
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("-start_date", "-start_time")
    serializer_class = EventSerializer

    @swagger_auto_schema(
        operation_description="Yeni tədbir əlavə edin",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'participants': openapi.Schema(type=openapi.TYPE_STRING, default='John Doe'),
                'start_date': openapi.Schema(type=openapi.TYPE_STRING, default='2024-12-26'),
                'end_date': openapi.Schema(type=openapi.TYPE_STRING, default='2024-12-27'),
                'start_time': openapi.Schema(type=openapi.TYPE_STRING, default='10:00:00'),
                'end_time': openapi.Schema(type=openapi.TYPE_STRING, default='12:00:00'),
                'theme': openapi.Schema(type=openapi.TYPE_STRING, default='green'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, default='Şəxsi tədbir'),
            }
        ),
        responses={
            201: openapi.Response(
                description="Tədbir yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "participants": "John Doe",
                        "start_date": "2024-12-26",
                        "end_date": "2024-12-27",
                        "start_time": "10:00:00",
                        "end_time": "12:00:00",
                        "theme": "green",
                        "description": "Şəxsi tədbir"
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


# Services
class ServicesCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServicesCategory.objects.all()
    serializer_class = ServicesCategorySerializer

    @swagger_auto_schema(
        operation_description="Yeni xidmət kategoriyası əlavə edin",
        request_body=ServicesCategorySerializer,
        responses={
            201: openapi.Response(
                description="Xidmət kategoriyası yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "title": "Spa",
                        "icon": "http://127.0.0.1:8000/media/category_icons/spa.png"
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    @swagger_auto_schema(
        operation_description="Yeni xidmət əlavə edin",
        request_body=ServiceSerializer,
        responses={
            201: openapi.Response(
                description="Xidmət yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "title": "Massaj",
                        "image": "http://127.0.0.1:8000/media/service_images/massaj.png",
                        "category": {
                            "id": 1,
                            "title": "Spa",
                            "icon": "http://127.0.0.1:8000/media/category_icons/spa.png"
                        },
                        "price": "50.00"
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer

    @swagger_auto_schema(
        operation_description="Yeni endirim əlavə edin",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'title': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                'discount_percentage': openapi.Schema(type=openapi.TYPE_INTEGER, default=10),
                'end_date': openapi.Schema(type=openapi.TYPE_STRING, default='2024-12-26'),
                'active': openapi.Schema(type=openapi.TYPE_BOOLEAN, default=True),
                'service': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'title': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                        'category': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'title': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                            }
                        ),
                        'category_id': openapi.Schema(type=openapi.TYPE_INTEGER, default=1),
                        'price': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                    },
                    default={'title': 'string', 'category': {'title': 'string'}, 'category_id': 1, 'price': 'string'}
                ),
                'service_id': openapi.Schema(type=openapi.TYPE_INTEGER, default=1),
            }
        ),
        responses={
            201: openapi.Response(
                description="Endirim yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "title": "Yeni il endirimi",
                        "image": "http://127.0.0.1:8000/media/discount_images/newyear.png",
                        "discount_percentage": 10,
                        "end_date": "2024-12-31",
                        "active": True,
                        "service": {
                            "id": 1,
                            "title": "Massaj",
                            "image": "http://127.0.0.1:8000/media/service_images/massaj.png",
                            "category": {
                                "id": 1,
                                "title": "Spa",
                                "icon": "http://127.0.0.1:8000/media/category_icons/spa.png"
                            },
                            "price": "50.00"
                        },
                        "service_id": 1
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


# Specialist
class SpecialistViewSet(viewsets.ModelViewSet):
    queryset = Specialist.objects.all()
    serializer_class = SpecialistSerializer

    @swagger_auto_schema(
        operation_description="Yeni mütəxəssis əlavə edin",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'first_name': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                'rating': openapi.Schema(type=openapi.TYPE_STRING, default='5.0'),
                'service_ids': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER),
                    default=[1]
                ),
            }
        ),
        responses={
            201: openapi.Response(
                description="Mütəxəssis yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "first_name": "Jane",
                        "last_name": "Doe",
                        "rating": 4.5,
                        "services": [
                            {
                                "id": 1,
                                "title": "Massaj",
                                "image": "http://127.0.0.1:8000/media/service_images/massaj.png",
                                "category": {
                                    "id": 1,
                                    "title": "Spa",
                                    "icon": "http://127.0.0.1:8000/media/category_icons/spa.png"
                                },
                                "price": "50.00"
                            }
                        ],
                        "service_ids": [1],
                        "working_schedules": [
                            {
                                "id": 1,
                                "days_of_week_display": ["Monday", "Wednesday"],
                                "start_time": "09:00:00",
                                "end_time": "17:00:00"
                            }
                        ],
                        "bookings": []
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class WorkingScheduleViewSet(viewsets.ModelViewSet):
    queryset = WorkingSchedule.objects.all()
    serializer_class = WorkingScheduleSerializer

    @swagger_auto_schema(
        operation_description="Yeni iş saatları əlavə edin",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'days_of_week': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_STRING),
                    default=["MON", "WED"]
                ),
                'start_time': openapi.Schema(type=openapi.TYPE_STRING, default='10:00:00'),
                'end_time': openapi.Schema(type=openapi.TYPE_STRING, default='10:00:00'),
                'specialist': openapi.Schema(type=openapi.TYPE_INTEGER, description='Specialist ID'),
            }
        ),
        responses={
            201: openapi.Response(
                description="İş saatları yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "days_of_week_display": ["Monday", "Wednesday"],
                        "start_time": "10:00:00",
                        "end_time": "10:00:00"
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    @swagger_auto_schema(
        operation_description="Yeni rezerv yaradın",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'specialist': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'first_name': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                        'last_name': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                        'rating': openapi.Schema(type=openapi.TYPE_STRING, default='string'),
                    },
                    default={'first_name': 'string', 'last_name': 'string', 'rating': 'string'}
                ),
                'specialist_id': openapi.Schema(type=openapi.TYPE_INTEGER, default=4),
                'date_time': openapi.Schema(type=openapi.FORMAT_DATETIME, default='2025-12-26T16:04:44.853Z'),
            }
        ),
        responses={
            201: openapi.Response(
                description="Rezerv yaradıldı",
                examples={
                    "application/json": {
                        "id": 1,
                        "specialist": {
                            "id": 4,
                            "first_name": "string",
                            "last_name": "string",
                            "rating": "string"
                        },
                        "specialist_id": 4,
                        "date_time": "2025-12-26T16:04:44.853Z",
                        "created_at": "2024-01-01T12:00:00Z"
                    }
                },
            ),
            400: "Xəta baş verdi"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
