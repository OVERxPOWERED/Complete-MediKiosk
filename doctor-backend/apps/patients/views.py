from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse,
)
from drf_spectacular.types import OpenApiTypes

from .models import Patient, Visit, MedicalRecord
from .serializers import (
    PatientSerializer,
    PatientListSerializer,
    PatientDetailSerializer,
    VisitSerializer,
    VisitListSerializer,
    VisitDetailSerializer,
    VisitCheckInSerializer,
    VisitCompleteSerializer,
    MedicalRecordSerializer,
    MedicalRecordListSerializer,
    MedicalRecordDetailSerializer,
)
from .permissions import PatientAccessPermission, VisitAccessPermission, MedicalRecordAccessPermission
from .pagination import StandardResultsSetPagination


@extend_schema_view(
    list=extend_schema(
        summary="List all patients",
        description="Retrieve a paginated list of patients with optional filtering and search.",
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search patients by name, email, phone, or patient_id",
            ),
            OpenApiParameter(
                name="gender",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by gender (M, F, O)",
                enum=["M", "F", "O"],
            ),
            OpenApiParameter(
                name="blood_type",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by blood type",
                enum=["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
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
                description="Order by field (prefix with - for descending)",
                enum=["created_at", "-created_at", "last_name", "-last_name", "patient_id", "-patient_id"],
            ),
        ],
        responses={
            200: PatientListSerializer(many=True),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
        },
        examples=[
            OpenApiExample(
                "Success Response",
                value={
                    "count": 1,
                    "next": None,
                    "previous": None,
                    "results": [
                        {
                            "id": "uuid",
                            "patient_id": "PAT-000001",
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": "john.doe@example.com",
                            "phone": "+1234567890",
                            "date_of_birth": "1990-01-01",
                            "gender": "M",
                            "blood_type": "O+",
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
        description="Register a new patient in the system.",
        request=PatientSerializer,
        responses={
            201: PatientDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
        },
        examples=[
            OpenApiExample(
                "Create Request",
                value={
                    "first_name": "Jane",
                    "last_name": "Smith",
                    "email": "jane.smith@example.com",
                    "phone": "+1987654321",
                    "date_of_birth": "1985-05-15",
                    "gender": "F",
                    "blood_type": "A+",
                    "address": "123 Main St, City, State 12345",
                    "emergency_contact_name": "John Smith",
                    "emergency_contact_phone": "+1555123456",
                    "insurance_provider": "HealthCare Inc",
                    "insurance_policy_number": "POL-123456",
                    "allergies": "Penicillin",
                    "medical_conditions": "Hypertension",
                },
                request_only=True,
            ),
        ],
        tags=["Patients"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a patient",
        description="Get detailed information about a specific patient.",
        responses={
            200: PatientDetailSerializer,
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to access this patient"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    update=extend_schema(
        summary="Update a patient",
        description="Fully update a patient's information.",
        request=PatientSerializer,
        responses={
            200: PatientDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to update this patient"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    partial_update=extend_schema(
        summary="Partially update a patient",
        description="Partially update a patient's information.",
        request=PatientSerializer,
        responses={
            200: PatientDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to update this patient"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
    destroy=extend_schema(
        summary="Delete a patient",
        description="Soft delete a patient (marks as inactive).",
        responses={
            204: OpenApiResponse(description="Patient deleted successfully"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to delete this patient"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    ),
)
class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patients.
    
    Provides CRUD operations for patients with proper authentication,
    object-level permissions, filtering, search, and pagination.
    """
    queryset = Patient.objects.select_related("created_by").prefetch_related("visits", "medical_records")
    permission_classes = [IsAuthenticated, PatientAccessPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["gender", "blood_type", "is_active"]
    search_fields = ["patient_id", "first_name", "last_name", "email", "phone"]
    ordering_fields = ["created_at", "last_name", "patient_id"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return PatientListSerializer
        if self.action in ["retrieve", "create", "update", "partial_update"]:
            return PatientDetailSerializer
        return PatientSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_staff or user.is_superuser:
            return queryset
        
        if hasattr(user, "doctor_profile"):
            return queryset.filter(visits__doctor=user.doctor_profile).distinct()
        
        return queryset.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @extend_schema(
        summary="Get patient visits",
        description="Retrieve all visits for a specific patient.",
        responses={
            200: VisitListSerializer(many=True),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to access this patient"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    )
    @action(detail=True, methods=["get"], url_path="visits", url_name="patient-visits")
    def patient_visits(self, request, pk=None):
        patient = self.get_object()
        visits = patient.visits.select_related("doctor__user").prefetch_related("medical_records").all()
        
        page = self.paginate_queryset(visits)
        if page is not None:
            serializer = VisitListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = VisitListSerializer(visits, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get patient medical records",
        description="Retrieve all medical records for a specific patient.",
        responses={
            200: MedicalRecordListSerializer(many=True),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to access this patient"),
            404: OpenApiResponse(description="Patient not found"),
        },
        tags=["Patients"],
    )
    @action(detail=True, methods=["get"], url_path="medical-records", url_name="patient-medical-records")
    def patient_medical_records(self, request, pk=None):
        patient = self.get_object()
        records = patient.medical_records.select_related("visit", "created_by").all()
        
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = MedicalRecordListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MedicalRecordListSerializer(records, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        summary="List all visits",
        description="Retrieve a paginated list of visits with optional filtering.",
        parameters=[
            OpenApiParameter(
                name="patient",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description="Filter by patient ID",
            ),
            OpenApiParameter(
                name="doctor",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description="Filter by doctor ID",
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by visit status",
                enum=["scheduled", "checked_in", "in_progress", "completed", "cancelled", "no_show"],
            ),
            OpenApiParameter(
                name="visit_type",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by visit type",
                enum=["consultation", "follow_up", "emergency", "routine_checkup", "procedure", "telemedicine"],
            ),
            OpenApiParameter(
                name="date_from",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Filter visits from date (YYYY-MM-DD)",
            ),
            OpenApiParameter(
                name="date_to",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Filter visits to date (YYYY-MM-DD)",
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order by field",
                enum=["scheduled_at", "-scheduled_at", "created_at", "-created_at", "status"],
            ),
        ],
        responses={
            200: VisitListSerializer(many=True),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
        },
        tags=["Visits"],
    ),
    create=extend_schema(
        summary="Create a new visit",
        description="Schedule a new visit for a patient.",
        request=VisitSerializer,
        responses={
            201: VisitDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to create visits for this patient"),
        },
        tags=["Visits"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a visit",
        description="Get detailed information about a specific visit.",
        responses={
            200: VisitDetailSerializer,
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to access this visit"),
            404: OpenApiResponse(description="Visit not found"),
        },
        tags=["Visits"],
    ),
    update=extend_schema(
        summary="Update a visit",
        description="Fully update a visit's information.",
        request=VisitSerializer,
        responses={
            200: VisitDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to update this visit"),
            404: OpenApiResponse(description="Visit not found"),
        },
        tags=["Visits"],
    ),
    partial_update=extend_schema(
        summary="Partially update a visit",
        description="Partially update a visit's information.",
        request=VisitSerializer,
        responses={
            200: VisitDetailSerializer,
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to update this visit"),
            404: OpenApiResponse(description="Visit not found"),
        },
        tags=["Visits"],
    ),
    destroy=extend_schema(
        summary="Cancel a visit",
        description="Cancel a visit (marks as cancelled).",
        responses={
            204: OpenApiResponse(description="Visit cancelled successfully"),
            401: OpenApiResponse(description="Authentication credentials were not provided"),
            403: OpenApiResponse(description="You do not have permission to cancel this visit"),
            404: OpenApiResponse(description="Visit not found"),
        },
        tags=["Visits"],
    ),
)
class VisitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patient visits.
    
    Provides CRUD operations for visits with custom actions for
    check-in and completion workflows.
    """
    queryset = Visit.objects.select_related("patient", "doctor__user", "created_by").prefetch_related("medical_records")
    permission_classes = [IsAuthenticated, VisitAccessPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "visit_type", "patient", "doctor"]
    ordering_fields = ["scheduled_at", "created_at", "status"]
    ordering = ["-scheduled_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return VisitListSerializer
        if self.action == "retrieve":
            return VisitDetailSerializer
        if self.action == "check_in":
            return VisitCheckInSerializer
        if self.action == "complete":
            return VisitCompleteSerializer
        return VisitSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_staff or user.is_superuser:
            return queryset
        
        if hasattr(user, "doctor_profile"):
            return queryset.filter(doctor=user.doctor_profile)
        
        return queryset.filter(patient__created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.status = "cancelled"
        instance.save(update_fields=["status", "updated_at"])

    @extend_schema(
        summary="Check in a patient for a visit",
        description="Mark a patient as checked in for their scheduled visit. Changes status from 'scheduled' to 'checked_in'.",
        request=VisitCheckInSerializer,
        responses={
            200: VisitDetailSerializer,
            400: OpenApiResponse(description="Invalid status transition or validation error"),
            401: OpenApiResponse(description