```python
"""
Core API ViewSets for MediKiosk Healthcare Platform.

Provides RESTful endpoints for Patient, Doctor, Appointment, and MedicalRecord entities
with comprehensive OpenAPI 3 schema documentation via drf-spectacular.
"""

import logging
import uuid
from functools import wraps
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
        responses={200: PatientListSerializer(many=True)},
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
                    ]
                },
                response_only=True,
            )
        ],
    ),
    create=extend_schema(
        summary="Create a new patient",
        description="Register a new patient in the system. Requires authentication.",
        request=PatientSerializer,