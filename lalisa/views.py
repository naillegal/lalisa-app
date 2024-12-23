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
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "phone_number": user.phone_number,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "birth_date": user.birth_date,
                    },
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "phone_number": user.phone_number,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "birth_date": user.birth_date,
                    },
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAdminUser]

# index


def login_view(request):
    return render(request, "index.html")


# calendar
def calendar_view(request):
    return render(request, "calendar.html")


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("-start_date", "-start_time")
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


# services
class ServicesCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServicesCategory.objects.all()
    serializer_class = ServicesCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticated]


# Həkim rezervasiya
class SpecialistViewSet(viewsets.ModelViewSet):
    queryset = Specialist.objects.all()
    serializer_class = SpecialistSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkingScheduleViewSet(viewsets.ModelViewSet):
    queryset = WorkingSchedule.objects.all()
    serializer_class = WorkingScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()
