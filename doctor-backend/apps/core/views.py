"""
Core API ViewSets for MediKiosk Healthcare Platform.

Provides RESTful endpoints for Patient, Doctor, Appointment, and MedicalRecord entities
with comprehensive OpenAPI 3 schema documentation via drf-spectacular.
"""

import logging
import uuid
from functools import wraps
from datetime import date, timedelta
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse,
    inline_serializer,
)
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination

from apps.core.models import Patient, Doctor, Appointment, MedicalRecord
from apps.core.serializers import (
    PatientSerializer,
    PatientListSerializer,
    PatientDetailSerializer,
    DoctorSerializer,
    DoctorListSerializer,
    DoctorDetailSerializer,
    AppointmentSerializer,
    AppointmentListSerializer,
    AppointmentDetailSerializer,
    AppointmentCreateSerializer,
    MedicalRecordSerializer,
    MedicalRecordListSerializer,
    MedicalRecordDetailSerializer,
    MedicalRecordCreateSerializer,
)
from apps.core.filters import (
    PatientFilter,
    DoctorFilter,
    AppointmentFilter,
    MedicalRecordFilter,
)
from apps.core.permissions import (
    IsPatientOwnerOrReadOnly,
    IsDoctorOrReadOnly,
    IsAppointmentParticipant,
    IsMedicalRecordAuthorized,
)
from apps.cache.utils import cache_response, invalidate_cache_pattern

logger = logging.getLogger(__name__)


def log_request(view_func):
    """Decorator to log requests with correlation IDs for tracing."""
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))
        request.correlation_id = correlation_id
        
        logger.info(
            "API request started",
            extra={
                'correlation_id': correlation_id,
                'method': request.method,
                'path': request.path,
                'user_id': getattr(request.user, 'id', None) if request.user.is_authenticated else None,
            }
        )
        
        try:
            response = view_func(self, request, *args, **kwargs)
            logger.info(
                "API request completed",
                extra={
                    'correlation_id': correlation_id,
                    'status_code': response.status_code,
                }
            )
            response['X-Correlation-ID'] = correlation_id
            return response
        except Exception as e:
            logger.error(
                "API request failed",
                extra={
                    'correlation_id': correlation_id,
                    'error': str(e),
                },
                exc_info=True
            )
            raise
    return wrapper


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for API list endpoints."""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class LargeResultsSetPagination(PageNumberPagination):
    """Extended pagination for large dataset endpoints."""
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


@extend_schema_view(
    list=extend_schema(
        summary="List all patients",
        description="Retrieve a paginated list of patients with filtering, search, and ordering capabilities.",
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search patients by name, email, or phone number",
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order by: created_at, updated_at, first_name, last_name, date_of_birth. Prefix with '-' for descending.",
            ),
            OpenApiParameter(
                name="gender",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by gender (M, F, O)",
                enum=["M", "F", "O"],
            ),
            OpenApiParameter(
                name="is_active",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Filter by active status",
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=PatientListSerializer(many=True),
                description="Paginated list of patients",
            ),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),
        },
        examples=[
            OpenApiExample(
                "Patient List Response",
                value={
                    "count": 150,
                    "next": "http://api.example.org/patients/?page=2",
                    "previous": None,
                    "results": [
                        {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": "john.doe@example.com",
                            "phone": "+15551234567",
                            "date_of_birth": "1990-01-15",
                            "gender": "M",
                            "is_active": True,
                            "created_at": "2024-01-15T10:30:00Z",
                        }
                    ],
                },
                response_only=True,
            ),
        ],
        tags=["Patients"],
    ),
    create=extend_schema(
        summary="Create a new patient",
        description="Register a new patient in the system. Requires authenticated user with appropriate permissions.",
        request=PatientSerializer,
        responses={
            201: OpenApiResponse(
                response=PatientDetailSerializer,
                description="Patient created successfully",
            ),
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),
        },
        examples=[
            OpenApiExample(
                "Create Patient Request",
                value={
                    "first_name": "Jane",
                    "last_name": "Smith",
                    "email": "jane.smith@example.com",
                    "phone": "+15559876543",
                    "date_of_birth": "1985-06-20",
                    "gender": "F",
                    "address": "123 Main St, City, State 12345",
                    "emergency_contact_name": "John Smith",
                    "emergency_contact_phone": "+15551112222",
                    "insurance_provider": "HealthCare Plus",
                    "insurance_policy_number": "HCP-123456789",
                },
                request_only=True,
            ),
        ],
        tags=["Patients"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a patient by ID",
        description="Get detailed information about a specific patient.",
        responses={
            200: OpenApiResponse(
                response=PatientDetailSerializer,
                description="Patient details retrieved successfully",
            ),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    update=extend_schema(
        summary="Update a patient (full update)",
        description="Update all fields of a patient record. Requires ownership or admin permissions.",
        request=PatientSerializer,
        responses={
            200: OpenApiResponse(
                response=PatientDetailSerializer,
                description="Patient updated successfully",
            ),
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    partial_update=extend_schema(
        summary="Partially update a patient",
        description="Update specific fields of a patient record. Requires ownership or admin permissions.",
        request=PatientSerializer,
        responses={
            200: OpenApiResponse(
                response=PatientDetailSerializer,
                description="Patient updated successfully",
            ),
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    destroy=extend_schema(
        summary="Delete a patient",
        description="Soft delete a patient record (marks as inactive). Requires admin permissions.",
        responses={
            204: OpenApiResponse(description="Patient deleted successfully"),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
)
class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Patient records.
    
    Provides CRUD operations for patients with:
    - Filtering by gender, active status
    - Search by name, email, phone
    - Ordering by various fields
    - Pagination
    - Object-level permissions
    """
    queryset = Patient.objects.select_related('user').prefetch_related(
        'appointments__doctor',
        'medical_records__doctor'
    ).all()
    permission_classes = [IsAuthenticated, IsPatientOwnerOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PatientFilter
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['created_at', 'updated_at', 'first_name', 'last_name', 'date_of_birth']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return PatientListSerializer
        elif self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return PatientDetailSerializer if self.action == 'retrieve' else PatientSerializer
        return PatientSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_staff or user.is_superuser:
            return queryset
        
        # Patients can only see their own record
        if hasattr(user, 'patient_profile'):
            return queryset.filter(user=user)
        
        # Doctors can see their patients
        if hasattr(user, 'doctor_profile'):
            return queryset.filter(
                appointments__doctor=user.doctor_profile
            ).distinct()
        
        return queryset.none()

    @log_request
    def list(self, request, *args, **kwargs):
        """List patients with caching."""
        return super().list(request, *args, **kwargs)

    @log_request
    def create(self, request, *args, **kwargs):
        """Create a new patient."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        
        # Invalidate cache
        invalidate_cache_pattern('patients:*')
        
        response_serializer = PatientDetailSerializer(patient)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @log_request
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a patient with related data."""
        return super().retrieve(request, *args, **kwargs)

    @log_request
    def update(self, request, *args, **kwargs):
        """Update a patient."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        
        # Invalidate cache
        invalidate_cache_pattern('patients:*')
        
        response_serializer = PatientDetailSerializer(patient)
        return Response(response_serializer.data)

    @log_request
    def destroy(self, request, *args, **kwargs):
        """Soft delete a patient (mark as inactive)."""
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=['is_active', 'updated_at'])
        
        # Invalidate cache
        invalidate_cache_pattern('patients:*')
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Get patient appointments",
        description="Retrieve all appointments for a specific patient.",
        responses={
            200: OpenApiResponse(
                response=AppointmentListSerializer(many=True),
                description="List of patient appointments",
            ),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    )
    @action(detail=True, methods=['get'], url_path='appointments')
    def patient_appointments(self, request, pk=None):
        """Get all appointments for a patient."""
        patient = self.get_object()
        appointments = patient.appointments.select_related('doctor__user').all()
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            appointments = appointments.filter(scheduled_at__date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            appointments = appointments.filter(scheduled_at__date__lte=date_to)
        
        page = self.paginate_queryset(appointments)
        if page is not None:
            serializer = AppointmentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = AppointmentListSerializer(appointments, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get patient medical records",
        description="Retrieve all medical records for a specific patient.",
        responses={
            200: OpenApiResponse(
                response=MedicalRecordListSerializer(many=True),
                description="List of patient medical records",
            ),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    )
    @action(detail=True, methods=['get'], url_path='medical-records')
    def patient_medical_records(self, request, pk=None):
        """Get all medical records for a patient."""
        patient = self.get_object()
        records = patient.medical_records.select_related('doctor__user').all()
        
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = MedicalRecordListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MedicalRecordListSerializer(records, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        summary="List all doctors",
        description="Retrieve a paginated list of doctors with filtering, search, and ordering capabilities.",
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search doctors by name, email, or specialization",
            ),
            OpenApiParameter(
                name="specialization",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by specialization",
            ),
            OpenApiParameter(
                name="is_active",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Filter by active status",
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order by: created_at, updated_at, first_name, last_name, specialization, years_of_experience",
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=DoctorListSerializer(many=True),
                description="Paginated list of doctors",
            ),
            401: OpenApiResponse(description="Authentication required"),
        },
        tags=["Doctors"],
    ),
    create=extend_schema(
        summary="Create a new doctor",
        description="Register a new doctor in the system. Requires admin permissions.",
        request=DoctorSerializer,
        responses={
            201: OpenApiResponse(
                response=DoctorDetailSerializer,
                description="Doctor created successfully",
            ),
            400: OpenApiResponse(description="Validation