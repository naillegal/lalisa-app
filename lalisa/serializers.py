from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.pagination import PageNumberPagination
from .models import (User, Category, Service, Doctor, DoctorSchedule, DoctorPermission, LaserUsage, Treatment,
                     TreatmentStep, DiscountCode, DiscountBanner, MainBanner, Reservation, UserCashback, CashbackHistory,
                     Payment, DoctorService, Moderator, Notification)
import random


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = '__all__'


class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(
            queryset=User.objects.all(), message="This email is already exist")]
    )
    phone = serializers.CharField(required=False, allow_blank=True)
    fcm_token = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email',
                  'phone', 'password', 'date_of_birth', 'gender', 'fcm_token']
        extra_kwargs = {
            'gender': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        fcm_token = validated_data.pop('fcm_token', None)
        validated_data['status'] = 'inactive'
        otp = str(random.randint(100000, 999999))
        validated_data['otp_code'] = otp
        user = User.objects.create(**validated_data)
        if fcm_token:
            user.firebase_token = fcm_token
            user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    fcm_token = serializers.CharField(required=False, allow_blank=True)


class ActivateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)


class ServiceNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'price', 'procedure_duration', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    services = ServiceNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'image', 'created_at', 'services']


class ServiceSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all())

    class Meta:
        model = Service
        fields = '__all__'


class DoctorScheduleSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.SerializerMethodField()

    class Meta:
        model = DoctorSchedule
        fields = ['id', 'day_of_week', 'day_of_week_display',
                  'is_active', 'start_time', 'end_time']

    def get_day_of_week_display(self, obj):
        return obj.get_day_of_week_display()


class DoctorPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorPermission
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    schedules = DoctorScheduleSerializer(many=True, read_only=True)
    permission = DoctorPermissionSerializer(read_only=True)
    services = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    service_ids = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'id',
            'first_name',
            'last_name',
            'image',
            'specialty',
            'rating',
            'experience',
            'about',
            'services',
            'service_ids',
            'schedules',
            'permission'
        ]

    def get_service_ids(self, obj):
        return list(obj.services.values_list('id', flat=True))

    def create(self, validated_data):
        doctor = super().create(validated_data)
        for day in range(1, 8):
            DoctorSchedule.objects.create(
                doctor=doctor, day_of_week=day, is_active=False)
        DoctorPermission.objects.create(doctor=doctor, permission_type='none')
        return doctor

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class DoctorCreateUpdateSerializer(serializers.ModelSerializer):
    services = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Doctor
        fields = [
            'first_name',
            'last_name',
            'image',
            'specialty',
            'rating',
            'experience',
            'about',
            'services',
        ]

    def create(self, validated_data):
        services_str = validated_data.pop('services', '')
        doctor = Doctor.objects.create(**validated_data)
        if services_str:
            service_names = [s.strip() for s in services_str.split(',')]
            service_qs = Service.objects.filter(name__in=service_names)
            doctor.services.set(service_qs)
        for day in range(1, 8):
            DoctorSchedule.objects.create(doctor=doctor, day_of_week=day)
        DoctorPermission.objects.create(doctor=doctor, permission_type='none')
        return doctor

    def update(self, instance, validated_data):
        services_str = validated_data.pop('services', '')
        instance = super().update(instance, validated_data)
        if services_str:
            service_names = [s.strip() for s in services_str.split(',')]
            service_qs = Service.objects.filter(name__in=service_names)
            instance.services.set(service_qs)
        return instance


class LaserUsageSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    doctor_image = serializers.SerializerMethodField()

    class Meta:
        model = LaserUsage
        fields = [
            'id',
            'doctor',
            'before_shots',
            'after_shots',
            'usage',
            'areas',
            'created_at',
            'doctor_name',
            'doctor_image',
        ]
        read_only_fields = ['id', 'usage',
                            'created_at', 'doctor_name', 'doctor_image']

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

    def get_doctor_image(self, obj):
        if obj.doctor.image:
            return obj.doctor.image.url
        return None

    def create(self, validated_data):
        validated_data['usage'] = validated_data['after_shots'] - \
            validated_data['before_shots']
        return super().create(validated_data)

    def update(self, instance, validated_data):
        after = validated_data.get('after_shots', instance.after_shots)
        before = validated_data.get('before_shots', instance.before_shots)
        validated_data['usage'] = after - before
        return super().update(instance, validated_data)


class TreatmentStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentStep
        fields = ['id', 'title', 'description', 'time_offset', 'created_at']


class TreatmentSerializer(serializers.ModelSerializer):
    steps = TreatmentStepSerializer(many=True)

    class Meta:
        model = Treatment
        fields = ['id', 'service', 'steps', 'created_at']

    def create(self, validated_data):
        steps_data = validated_data.pop('steps', [])
        treatment = Treatment.objects.create(**validated_data)
        for step_data in steps_data:
            TreatmentStep.objects.create(treatment=treatment, **step_data)
        return treatment

    def update(self, instance, validated_data):
        steps_data = validated_data.pop('steps', None)
        if steps_data is not None:
            instance.steps.all().delete()
            for step_data in steps_data:
                TreatmentStep.objects.create(treatment=instance, **step_data)

        instance.service = validated_data.get('service', instance.service)
        instance.save()
        return instance


class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = '__all__'
        read_only_fields = ('uses', 'created_at')


class DiscountBannerSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = DiscountBanner
        fields = [
            'id',
            'text',
            'discount_percent',
            'service',
            'service_name',
            'service_category',
            'image',
            'created_at',
        ]


class MainBannerSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = MainBanner
        fields = [
            'id',
            'text',
            'service',
            'service_name',
            'service_category',
            'image',
            'created_at',
        ]


class ReservationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    doctor_name = serializers.SerializerMethodField(read_only=True)
    service_names = serializers.SerializerMethodField(read_only=True)
    duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = [
            'id',
            'user',
            'full_name',
            'phone',
            'doctor',
            'services',
            'date',
            'start_time',
            'end_time',
            'created_at',
            'updated_at',
            'user_name',
            'doctor_name',
            'service_names',
            'duration_minutes',
            'status',
        ]

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

    def get_service_names(self, obj):
        return ", ".join([service.name for service in obj.services.all()])

    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                "Start time must be before end time")
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class UserCashbackSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserCashback
        fields = ['id', 'user', 'balance', 'is_active',
                  'created_at', 'user_full_name']
        read_only_fields = ['created_at', 'user']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class CashbackHistorySerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()

    class Meta:
        model = CashbackHistory
        fields = ['id', 'user_cashback', 'change_amount',
                  'created_at', 'user_full_name', 'action']
        read_only_fields = ['created_at', 'user_cashback']

    def get_user_full_name(self, obj):
        return f"{obj.user_cashback.user.first_name} {obj.user_cashback.user.last_name}"

    def get_action(self, obj):
        if obj.change_amount > 0:
            return "Hesaba əlavə olundu"
        elif obj.change_amount < 0:
            return "Hesabdan silindi"
        else:
            return "none"


class HistoriesPagination(PageNumberPagination):
    page_size = 10
    page_query_param = 'histories_page'


class UserCashbackDetailSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    histories = serializers.SerializerMethodField()

    class Meta:
        model = UserCashback
        fields = ['id', 'user', 'user_full_name', 'balance',
                  'is_active', 'created_at', 'histories']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_histories(self, obj):
        request = self.context.get('request')
        paginator = HistoriesPagination()
        queryset = obj.histories.all().order_by('-created_at')
        paginated_qs = paginator.paginate_queryset(queryset, request)
        serializer = CashbackHistorySerializer(
            paginated_qs, many=True, context=self.context)
        return {
            'count': queryset.count(),
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': serializer.data
        }


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'reservation', 'payment_type', 'amount', 'created_at']


class DoctorServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = DoctorService
        fields = ['id', 'doctor', 'service',
                  'service_name', 'commission_percentage']


class ExcelReservationSerializer(serializers.ModelSerializer):
    ad = serializers.SerializerMethodField()
    nomre = serializers.SerializerMethodField()
    hekim = serializers.SerializerMethodField()
    qiymet = serializers.SerializerMethodField()
    tarix = serializers.SerializerMethodField()
    xidmet = serializers.SerializerMethodField()
    giris = serializers.SerializerMethodField()
    cixis = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'ad', 'nomre', 'hekim', 'qiymet',
                  'tarix', 'xidmet', 'giris', 'cixis']

    def get_ad(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.full_name or ""

    def get_nomre(self, obj):
        if obj.user:
            return obj.user.phone
        return obj.phone or ""

    def get_hekim(self, obj):
        if obj.doctor:
            return f"{obj.doctor.first_name} {obj.doctor.last_name}"
        return ""

    def get_qiymet(self, obj):
        return float(obj.total_payments)

    def get_tarix(self, obj):
        if obj.last_payment_date:
            return obj.last_payment_date.strftime('%d/%m/%Y')
        return ""

    def get_xidmet(self, obj):
        return ", ".join([service.name for service in obj.services.all()])

    def get_giris(self, obj):
        if obj.accepted_at:
            return obj.accepted_at.strftime('%H:%M')
        return ""

    def get_cixis(self, obj):
        if obj.exit_time:
            return obj.exit_time.strftime('%H:%M')
        return ""


class ModeratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Moderator
        fields = '__all__'
        read_only_fields = ('created_at',)


class NotificationSerializer(serializers.ModelSerializer):
    recipients = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all()
    )

    class Meta:
        model = Notification
        fields = ['id', 'message', 'recipients', 'created_at']
        read_only_fields = ['id', 'created_at']


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)


class UpdatePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(min_length=6, write_only=True)


class ReservationTreatmentSerializer(serializers.Serializer):
    reservation_id = serializers.IntegerField(source='id')
    reservation_date = serializers.DateField(source='date')
    treatments = serializers.SerializerMethodField()

    def get_treatments(self, obj):
        treatments = Treatment.objects.filter(
            service__in=obj.services.all()).order_by("-created_at")
        serializer = TreatmentSerializer(
            treatments, many=True, context=self.context)
        return serializer.data


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)


class ReservationDetailSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    services = ServiceNestedSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    service_names = serializers.SerializerMethodField()
    duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = [
            'id',
            'user',
            'user_full_name',
            'user_phone',
            'doctor',
            'services',
            'date',
            'start_time',
            'end_time',
            'created_at',
            'updated_at',
            'user_name',
            'doctor_name',
            'service_names',
            'duration_minutes',
            'status'
        ]

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None

    def get_user_full_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.full_name

    def get_user_phone(self, obj):
        if obj.user:
            return obj.user.phone
        return obj.phone

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"{obj.doctor.first_name} {obj.doctor.last_name}"
        return None

    def get_service_names(self, obj):
        return ", ".join([service.name for service in obj.services.all()])


class ChangePasswordSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=6, write_only=True)
