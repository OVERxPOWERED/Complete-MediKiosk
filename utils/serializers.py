```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal

from .models import (
    Patient, Doctor, Specialization, Availability,
    Appointment, MedicalRecord, Prescription, LabResult
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with basic profile information."""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'gender', 'address', 'profile_picture',
            'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_active']


class SpecializationSerializer(serializers.ModelSerializer):
    """Serializer for medical specializations."""
    
    doctor_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'description', 'icon', 'doctor_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'doctor_count']


class AvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for doctor availability slots."""
    
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Availability
        fields = [
            'id', 'doctor', 'day_of_week', 'day_of_week_display',
            'start_time', 'end_time', 'is_active', 'is_available',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'doctor']
    
    def get_is_available(self, obj):
        """Check if this availability slot is currently bookable."""
        now = timezone.now()
        current_day = now.weekday()  # Monday = 0
        current_time = now.time()
        
        if obj.day_of_week != current_day or not obj.is_active:
            return False
        
        return obj.start_time <= current_time <= obj.end_time
    
    def validate(self, attrs):
        """Validate that start_time is before end_time."""
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })
        
        return attrs


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model with nested relationships."""
    
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='doctor'),
        source='user',
        write_only=True,
        required=False
    )
    specializations = SpecializationSerializer(many=True, read_only=True)
    specialization_ids = serializers.PrimaryKeyRelatedField(
        queryset=Specialization.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='specializations'
    )
    availabilities = AvailabilitySerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    average_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )
    total_appointments = serializers.IntegerField(read_only=True)
    upcoming_appointments_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'user_id', 'license_number', 'specializations',
            'specialization_ids', 'availabilities', 'bio', 'education',
            'certifications', 'languages', 'consultation_fee',
            'follow_up_fee', 'clinic_address', 'clinic_phone',
            'accepts_insurance', 'insurance_providers', 'is_accepting_patients',
            'max_patients_per_day', 'average_rating', 'total_appointments',
            'upcoming_appointments_count', 'full_name', 'years_of_experience',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'license_number', 'average_rating', 'total_appointments',
            'upcoming_appointments_count', 'full_name', 'years_of_experience',
            'created_at', 'updated_at'
        ]
    
    def get_full_name(self, obj):
        return f"Dr. {obj.user.first_name} {obj.user.last_name}"
    
    def get_years_of_experience(self, obj):
        if obj.user.date_of_birth:
            # Approximate based on graduation year or use a field
            # For now, calculate from date_joined or assume
            return (timezone.now().date() - obj.user.date_joined.date()).days // 365
        return 0
    
    def validate_consultation_fee(self, value):
        """Ensure consultation fee is positive."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Consultation fee cannot be negative.")
        return value
    
    def validate_follow_up_fee(self, value):
        """Ensure follow-up fee is positive."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Follow-up fee cannot be negative.")
        return value
    
    def validate_max_patients_per_day(self, value):
        """Ensure max patients per day is reasonable."""
        if value is not None and (value < 1 or value > 100):
            raise serializers.ValidationError(
                "Max patients per day must be between 1 and 100."
            )
        return value
    
    def create(self, validated_data):
        specializations = validated_data.pop('specializations', [])
        doctor = Doctor.objects.create(**validated_data)
        doctor.specializations.set(specializations)
        return doctor
    
    def update(self, instance, validated_data):
        specializations = validated_data.pop('specializations', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if specializations is not None:
            instance.specializations.set(specializations)
        
        return instance


class PatientSerializer(serializers.ModelSerializer):
    """Serializer for Patient model with nested user data and computed fields."""
    
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='patient'),
        source='user',
        write_only=True,
        required=False
    )
    age = serializers.SerializerMethodField()
    primary_doctor = DoctorSerializer(read_only=True)
    primary_doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source='primary_doctor',
        write_only=True,
        required=False,
        allow_null=True
    )
    total_appointments = serializers.IntegerField(read_only=True)
    upcoming_appointments = serializers.IntegerField(read_only=True)
    last_visit = serializers.DateTimeField(read_only=True)
    emergency_contact_name = serializers.CharField(required=False, allow_blank=True