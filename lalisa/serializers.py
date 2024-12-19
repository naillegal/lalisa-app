from rest_framework import serializers
from .models import Event, CustomUser, Service, ServicesCategory, Discount
from django.contrib.auth import authenticate

# login & register 
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label="Confirm Password")

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'birth_date', 'phone_number', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Şifrələr uyğun gəlmir."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text="İstifadəçi adı, e-poçt və ya telefon nömrəsi")
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

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
            raise serializers.ValidationError("Yanlış istifadəçi adı, e-poçt, telefon nömrəsi və ya şifrə.")

        attrs['user'] = user
        return attrs
    
class UserListSerializer(serializers.ModelSerializer):
    password = serializers.CharField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'password', 'email', 'phone_number', 'first_name', 'last_name', 'birth_date', 'created_at')


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
        fields = ('id', 'title', 'image', 'discount_percentage', 'end_date', 'active', 'service', 'service_id')