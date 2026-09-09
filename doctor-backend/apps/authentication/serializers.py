from rest_framework import serializers
from .models import DoctorProfile, Workspace

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = '__all__'

class HprLoginSerializer(serializers.Serializer):
    hpr_id = serializers.CharField(max_length=50, default='HPR123456')

class OtpVerifySerializer(serializers.Serializer):
    hpr_id = serializers.CharField(max_length=50, default='HPR123456')
    otp = serializers.CharField(max_length=10, default='4219')
