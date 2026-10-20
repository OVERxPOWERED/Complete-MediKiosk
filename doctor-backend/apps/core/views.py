```python
"""
Core API ViewSets for MediKiosk Healthcare Platform.

Provides RESTful endpoints for Patient, Doctor, Appointment, and MedicalRecord entities
with comprehensive OpenAPI 3 schema documentation via drf-spectacular.
"""

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
                description="Search patients by name, email, phone, or MRN",
            ),
            OpenApiParameter(
                name="date_of_birth_after",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Filter patients born after this date (YYYY-MM-DD)",
            ),
            OpenApiParameter(
                name="date_of_birth_before",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Filter patients born before this date (YYYY-MM-DD)",
            ),
            OpenApiParameter(
                name="gender",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by gender (M, F, O, U)",
                enum=["M", "F", "O", "U"],
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
                description="Order by field. Prefix with '-' for descending. Options: created_at, updated_at, last_name, first_name, date_of_birth",
                enum=["created_at", "-created_at", "updated_at", "-updated_at", "last_name", "-last_name", "first_name", "-first_name", "date_of_birth", "-date_of_birth"],
            ),
        ],
        responses={
            200: PatientListSerializer(many=True),
            401: OpenApiResponse(description="Authentication required"),
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
                            "mrn": "MRN-2024-001234",
                            "first_name": "John",
                            "last_name": "Doe",
                            "date_of_birth": "1985-06-15",
                            "gender": "M",
                            "email": "john.doe@example.com",
                            "phone": "+1-555-0123",
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
        description="Register a new patient in the system. Requires appropriate permissions.",
        request=PatientSerializer,
        responses={
            201: PatientDetailSerializer,
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
                    "date_of_birth": "1990-03-22",
                    "gender": "F",
                    "email": "jane.smith@example.com",
                    "phone": "+1-555-0456",
                    "address": "123 Main St, Anytown, ST 12345",
                    "emergency_contact_name": "John Smith",
                    "emergency_contact_phone": "+1-555-0789",
                    "insurance_provider": "HealthCare Plus",
                    "insurance_policy_number": "HCP-789456",
                    "allergies": "Penicillin, Latex",
                    "medical_conditions": "Asthma",
                },
                request_only=True,
            ),
        ],
        tags=["Patients"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a patient by ID",
        description="Get detailed information for a specific patient including related appointments and medical records summary.",
        responses={
            200: PatientDetailSerializer,
            401: OpenApiResponse(description="Authentication required"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    update=extend_schema(
        summary="Update a patient (full update)",
        description="Replace all fields of a patient record. Requires ownership or admin permissions.",
        request=PatientSerializer,
        responses={
            200: PatientDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Permission denied"),