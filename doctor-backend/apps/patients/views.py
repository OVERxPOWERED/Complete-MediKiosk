```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.db.models import Q
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Patient,
    Vitals,
    ClinicalSummary,
    RedFlag,
    ScannedDocument,
    DocumentAnnotation,
    QueueItem,
    Appointment,
    MedicalRecord,
    Prescription,
)
from apps.consultations.models import AuditLog
from .serializers import (
    PatientSummarySerializer,
    ScannedDocumentSerializer,
    DocumentAnnotationSerializer,
    AppointmentSerializer,
    AppointmentCreateSerializer,
    MedicalRecordSerializer,
    MedicalRecordCreateSerializer,
    PrescriptionSerializer,
    PrescriptionCreateSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class BurstRateThrottle(UserRateThrottle):
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    scope = 'sustained'


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class QueueListView(APIView):
    throttle_classes = [BurstRateThrottle]

    def get(self, request):
        query = request.query_params.get('q', '').strip().lower()
        status_filter = request.query_params.get('status', 'all')
        sort_by = request.query_params.get('sort_by', 'queue')

        patients = Patient.objects.all().select_related('vitals', 'clinical_summary', 'queue_item').prefetch_related('red_flags', 'documents')

        if query:
            patients = patients.filter(
                Q(name__icontains=query) |
                Q(queue_token__icontains=query) |
                Q(uhid__icontains=query) |
                Q(clinical_summary__chief_complaint__icontains=query)
            )

        if status_filter in ['New', 'Reviewed']:
            patients = patients.filter(queue_item__status=status_filter)

        if sort_by == 'wait':
            patients = patients.order_by('queue_item__queue_number')
        elif sort_by == 'priority':
            patients = patients.order_by('-red_flags__is_active', 'queue_item__queue_number').distinct()
        else:
            patients = patients.order_by('queue_item__queue_number')

        serializer = PatientSummarySerializer(patients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ScanPatientView(APIView):
    throttle_classes = [BurstRateThrottle]

    def post(self, request):
        token_input = (request.data.get('token') or request.data.get('queue_token') or '').strip()
        if not token_input:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        clean_token = token_input
        if '/' in token_input:
            clean_token = token_input.split('/')[-1]

        patient = Patient.objects.filter(
            Q(queue_token__iexact=clean_token) | Q(uhid__iexact=clean_token)
        ).first()

        if not patient:
            return Response({
                "success": False,
                "error": f"Patient with identifier '{token_input}' not found in current clinic registry.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientSummarySerializer(patient)
        return Response({
            "success": True,
            "patient": serializer.data,
            "message": f"Wristband {patient.queue_token} Scanned Successfully. {patient.name} added to Just Scanned.",
        }, status=status.HTTP_200_OK)


class PatientSummaryDetailView(APIView):
    throttle_classes = [BurstRateThrottle]

    def get(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientSummarySerializer(patient)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        patient_data = data.get('patient', {})
        vitals_data = data.get('vitals', {})

        if 'name' in patient_data:
            patient.name = patient_data['name']
        if 'age' in patient_data:
            patient.age = patient_data['age']
        if 'gender' in patient_data:
            patient.gender = patient_data['gender']
        if 'phone' in patient_data:
            patient.phone = patient_data['phone']
        if 'address' in patient_data:
            patient.address = patient_data['address']
        patient.save()

        vitals, _ = Vitals.objects.get_or_create(patient=patient)
        for field in ['bp_systolic', 'bp_diastolic', 'heart_rate', 'temperature', 'spo2', 'weight', 'height', 'bmi']:
            if field in vitals_data:
                setattr(vitals, field, vitals_data[field])
        vitals.save()

        serializer = PatientSummarySerializer(patient)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient', 'doctor').all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    throttle_classes = [BurstRateThrottle, SustainedRateThrottle]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['patient__name', 'patient__uhid', 'doctor__name', 'reason']
    ordering_fields = ['scheduled_at', 'status', 'created_at']
    ordering = ['-scheduled_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        patient_id = self.request.query_params.get('patient')
        doctor_id = self.request.query_params.get('doctor')
        appointment_status = self.request.query_params.get('status')
        date_from = self.request.query_params.get