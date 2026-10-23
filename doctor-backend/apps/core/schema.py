```python
"""
OpenAPI 3 Schema Configuration for Doctor Backend API.

This module provides comprehensive drf-spectacular annotations for all ViewSets
and serializers, custom error response components, and SPECTACULAR_SETTINGS
configuration for generating OpenAPI 3 specifications.
"""

from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from drf_spectacular.openapi import AutoSchema
from rest_framework import status


# =============================================================================
# SPECTACULAR SETTINGS
# =============================================================================

SPECTACULAR_SETTINGS = {
    "TITLE": "Doctor Backend API",
    "DESCRIPTION": (
        "Comprehensive REST API for the Doctor Backend platform. "
        "Provides endpoints for user management, authentication, appointments, "
        "medical records, prescriptions, and healthcare provider interactions."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1",
    "SCHEMA_PATH_PREFIX_TRIM": True,
    "SERVERS": [
        {"url": "https://api.doctor-backend.com", "description": "Production server"},
        {"url": "https://staging-api.doctor-backend.com", "description": "Staging server"},
        {"url": "http://localhost:8000", "description": "Local development server"},
    ],
    "CONTACT": {
        "name": "Doctor Backend API Team",
        "url": "https://doctor-backend.com/support",
        "email": "api-support@doctor-backend.com",
    },
    "LICENSE": {
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    "TAGS": [
        {"name": "Authentication", "description": "User authentication and authorization"},
        {"name": "Users", "description": "User profile and account management"},
        {"name": "Appointments", "description": "Appointment scheduling and management"},
        {"name": "Medical Records", "description": "Patient medical records and history"},
        {"name": "Prescriptions", "description": "Prescription management and refills"},
        {"name": "Providers", "description": "Healthcare provider directory and availability"},
        {"name": "Notifications", "description": "Push notifications and messaging"},
        {"name": "Analytics", "description": "Reporting and analytics endpoints"},
    ],
    "EXTERNAL_DOCS": {
        "description": "Full API Documentation",
        "url": "https://docs.doctor-backend.com",
    },
    "COMPONENT_SPLIT_REQUEST": True,
    "COMPONENT_NO_READ_ONLY_REQUIRED": True,
    "SORT_OPERATIONS": True,
    "SORT_OPERATION_PARAMETERS": True,
    "ENUM_NAME_OVERRIDES": {
        "AppointmentStatusEnum": "apps.appointments.models.AppointmentStatus",
        "UserRoleEnum": "apps.users.models.UserRole",
        "PrescriptionStatusEnum": "apps.prescriptions.models.PrescriptionStatus",
    },
    "PREPROCESSING_HOOKS": [
        "apps.core.schema.preprocessing_hooks.filter_schema_by_version",
    ],
    "POSTPROCESSING_HOOKS": [
        "apps.core.schema.postprocessing_hooks.add_security_requirements",
    ],
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
        "displayOperationId": True,
        "filter": True,
        "showExtensions": True,
        "showCommonExtensions": True,
    },
    "REDOC_SETTINGS": {
        "hideDownloadButton": False,
        "expandResponses": "all",
        "pathInMiddlePanel": True,
    },
    "OAUTH2_FLOWS": {
        "implicit": {
            "authorizationUrl": "https://auth.doctor-backend.com/o/authorize/",
            "scopes": {
                "read": "Read access",
                "write": "Write access",
                "admin": "Administrative access",
            },
        },
        "authorizationCode": {
            "authorizationUrl": "https://auth.doctor-backend.com/o/authorize/",
            "tokenUrl": "https://auth.doctor-backend.com/o/token/",
            "refreshUrl": "https://auth.doctor-backend.com/o/token/",
            "scopes": {
                "read": "Read access",
                "write": "Write access",
                "admin": "Administrative access",
            },
        },
    },
    "SECURITY": [
        {"BearerAuth": []},
        {"OAuth2": ["read", "write"]},
    ],
    "COMPONENTS": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
            },
            "OAuth2": {
                "type": "oauth2",
                "flows": {
                    "implicit": {
                        "authorizationUrl": "https://auth.doctor-backend.com/o/authorize/",
                        "scopes": {
                            "read": "Read access",
                            "write": "Write access",
                            "admin": "Administrative access",
                        },
                    },
                    "authorizationCode": {
                        "authorizationUrl": "https://auth.doctor-backend.com/o/authorize/",
                        "tokenUrl": "https://auth.doctor-backend.com/o/token/",
                        "refreshUrl": "https://auth.doctor-backend.com/o/token/",
                        "scopes": {
                            "read": "Read access",
                            "write": "Write access",
                            "admin": "Administrative access",
                        },
                    },
                },
            },
        },
    },
}


# =============================================================================
# COMMON ERROR RESPONSE COMPONENTS
# =============================================================================

VALIDATION_ERROR_EXAMPLE = OpenApiExample(
    "Validation Error",
    value={
        "detail": "Invalid input.",
        "errors": {
            "email": ["Enter a valid email address."],
            "password": ["This field is required."],
            "date_of_birth": ["Date must be in the past."],
        },
    },
    response_only=True,
    status_codes=["400"],
)

NOT_FOUND_ERROR_EXAMPLE = OpenApiExample(
    "Not Found",
    value={
        "detail": "Not found.",
        "code": "not_found",
    },
    response_only=True,
    status_codes=["404"],
)

CONFLICT_ERROR_EXAMPLE = OpenApiExample(
    "Conflict",
    value={
        "detail": "Resource already exists.",
        "code": "conflict",
        "conflicting_field": "email",
    },
    response_only=True,
    status_codes=["409"],
)

UNAUTHORIZED_ERROR_EXAMPLE = OpenApiExample(
    "Unauthorized",
    value={
        "detail": "Authentication credentials were not provided.",
        "code": "not_authenticated",
    },
    response_only=True,
    status_codes=["401"],
)

FORBIDDEN_ERROR_EXAMPLE = OpenApiExample(
    "Forbidden",
    value={
        "detail": "You do not have permission to perform this action.",
        "code": "permission_denied",
    },
    response_only=True,
    status_codes=["403"],
)

RATE_LIMIT_ERROR_EXAMPLE = OpenApiExample(
    "Rate Limited",
    value={
        "detail": "Request was throttled. Expected available in