from rest_framework import serializers
from .models import (
    Event, CustomUser, Service, ServicesCategory, Discount,
    Specialist, WorkingSchedule, Booking
)
from django.contrib.auth import authenticate
from django.utils import timezone


# login & register


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={
                                     'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={
                                      'input_type': 'password'}, label="Confirm Password")

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'birth_date',
                  'phone_number', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Şifrələr uyğun gəlmir."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True, help_text="İstifadəçi adı, e-poçt və ya telefon nömrəsi")
    password = serializers.CharField(write_only=True, required=True, style={
                                     'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user = None

        if CustomUser.objects.filter(username=username).exists():
            user = authenticate(username=username, password=password)
        elif CustomUser.objects.filter(email=username).exists():
            user_obj = CustomUser.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        elif CustomUser.objects.filter(phone_number=username).exists():
            user_obj = CustomUser.objects.get(phone_number=username)
            user = authenticate(username=user_obj.username, password=password)

        if not user:
            raise serializers.ValidationError(
                "Yanlış istifadəçi adı, e-poçt, telefon nömrəsi və ya şifrə.")

        attrs['user'] = user
        return attrs


class UserListSerializer(serializers.ModelSerializer):
    password = serializers.CharField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'password', 'email', 'phone_number',
                  'first_name', 'last_name', 'birth_date', 'created_at')


# calendar
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


# services Serializer
class ServicesCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicesCategory
        fields = ('id', 'title', 'icon')


class ServiceSerializer(serializers.ModelSerializer):
    category = ServicesCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServicesCategory.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Service
        fields = ('id', 'title', 'image', 'category', 'category_id', 'price')


class DiscountSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        source='service',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Discount
        fields = ('id', 'title', 'image', 'discount_percentage',
                  'end_date', 'active', 'service', 'service_id')


# Həkim rezervasiya
class SpecialistSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialist
        fields = ('id', 'first_name', 'last_name', 'rating')

class BookingSerializer(serializers.ModelSerializer):
    specialist = SpecialistSimpleSerializer(read_only=True)  # Dairəvi asılılığa səbəb olmayacaq
    specialist_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialist.objects.all(),
        source='specialist',
        write_only=True
    )

    class Meta:
        model = Booking
        fields = ('id', 'specialist', 'specialist_id',
                  'date_time', 'created_at')
        read_only_fields = ('created_at',)

    def validate_date_time(self, value):
        if value < timezone.now():
            raise serializers.ValidationError(
                "Booking date and time cannot be in the past.")
        return value

    def create(self, validated_data):
        return Booking.objects.create(**validated_data)

class WorkingScheduleSerializer(serializers.ModelSerializer):
    days_of_week_display = serializers.SerializerMethodField()

    class Meta:
        model = WorkingSchedule
        fields = ('id', 'days_of_week_display',
                  'start_time', 'end_time')

    def get_days_of_week_display(self, obj):
        day_dict = dict(obj.DAYS_OF_WEEK)  
        return [day_dict[day] for day in obj.days_of_week if day in day_dict]


class SpecialistSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    service_ids = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        source='services',
        write_only=True,
        many=True
    )
    working_schedules = WorkingScheduleSerializer(many=True, read_only=True)
    bookings = BookingSerializer(many=True, read_only=True)

    class Meta:
        model = Specialist
        fields = (
            'id',
            'first_name',
            'last_name',
            'rating',
            'services',
            'service_ids',
            'working_schedules',
            'bookings'
        )

    def create(self, validated_data):
        services = validated_data.pop('services', [])
        specialist = Specialist.objects.create(**validated_data)
        specialist.services.set(services)
        return specialist

    def update(self, instance, validated_data):
        services = validated_data.pop('services', [])
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.rating = validated_data.get('rating', instance.rating)
        instance.save()
        if services:
            instance.services.set(services)
        return instance