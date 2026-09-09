from rest_framework import serializers
from .models import ConsultationOutcome, Prescription, AuditLog

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'name', 'dosage', 'duration']

class ConsultationOutcomeSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, required=False)

    class Meta:
        model = ConsultationOutcome
        fields = [
            'id',
            'outcome_type',
            'clinical_notes',
            'follow_up_date',
            'remind_sms',
            'referred_specialist',
            'additional_instructions',
            'advice',
            'recorded_at',
            'doctor_name',
            'pushed_to_his',
            'prescriptions',
        ]

class AuditLogSerializer(serializers.ModelSerializer):
    badgeColor = serializers.CharField(source='badge_color')

    class Meta:
        model = AuditLog
        fields = ['id', 'time', 'title', 'actor', 'details', 'badgeColor']
