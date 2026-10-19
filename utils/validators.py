```python
"""
Patient Data Validators

Provides input sanitization and secure parameter validation for patient data
including MRN format, PII protection, and medical data constraints.
"""

import re
import bleach
from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass


class ValidationErrorCode(str, Enum):
    """Validation error codes matching frontend error handling."""
    INVALID_MRN_FORMAT = "INVALID_MRN_FORMAT"
    MRN_TOO_SHORT = "MRN_TOO_SHORT"
    MRN_TOO_LONG = "MRN_TOO_LONG"
    INVALID_DATE_OF_BIRTH = "INVALID_DATE_OF_BIRTH"
    DATE_OF_BIRTH_FUTURE = "DATE_OF_BIRTH_FUTURE"
    AGE_EXCEEDS_LIMIT = "AGE_EXCEEDS_LIMIT"
    INVALID_BLOOD_TYPE = "INVALID_BLOOD_TYPE"
    INVALID_GENDER = "INVALID_GENDER"
    INVALID_PHONE_FORMAT = "INVALID_PHONE_FORMAT"
    INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT"
    INVALID_SSN_FORMAT = "INVALID_SSN_FORMAT"
    REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING"
    FIELD_TOO_LONG = "FIELD_TOO_LONG"
    INVALID_CHARACTERS = "INVALID_CHARACTERS"
    SANITIZATION_FAILED = "SANITIZATION_FAILED"


class BloodType(str, Enum):
    """Valid blood types."""
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"
    UNKNOWN = "UNKNOWN"


class Gender(str, Enum):
    """Valid gender values."""
    MALE = "M"
    FEMALE = "F"
    OTHER = "O"
    PREFER_NOT_TO_SAY = "P"
    UNKNOWN = "U"


@dataclass(frozen=True)
class ValidationResult:
    """Result of a validation operation."""
    is_valid: bool
    error_code: Optional[ValidationErrorCode] = None
    error_message: Optional[str] = None
    field_name: Optional[str] = None
    sanitized_value: Optional[Any] = None


@dataclass(frozen=True)
class ValidationSummary:
    """Summary of multiple validation results."""
    is_valid: bool
    results: List[ValidationResult]
    errors: List[ValidationResult]

    @property
    def error_codes(self) -> List[ValidationErrorCode]:
        return [r.error_code for r in self.errors if r.error_code]

    @property
    def error_messages(self) -> List[str]:
        return [r.error_message for r in self.errors if r.error_message]


# Configuration constants
STRIP_COMMENTS = True
MRN_MIN_LENGTH = 8
MRN_MAX_LENGTH = 12
MAX_AGE = 150
MAX_FIELD_LENGTHS = {
    "first_name": 50,
    "last_name": 50,
    "middle_name": 50,
    "address_line1": 100,
    "address_line2": 100,
    "city": 50,
    "state": 2,
    "zip_code": 10,
    "phone": 20,
    "email": 254,
    "ssn": 11,
    "emergency_contact_name": 100,
    "emergency_contact_phone": 20,
    "insurance_provider": 100,
    "insurance_policy_number": 50,
    "insurance_group_number": 50,
}

# Bleach configuration for sanitization
ALLOWED_TAGS = []
ALLOWED_ATTRIBUTES = {}
ALLOWED_PROTOCOLS = []
STRIP_COMMENTS = True


class PatientValidator:
    """
    Validator for patient data with comprehensive input sanitization
    and secure parameter validation.
    """

    # MRN pattern: alphanumeric, 8-12 characters
    MRN_PATTERN = re.compile(r'^[A-Za-z0-9]{8,12}$')

    # Phone pattern: supports various formats (US-focused)
    PHONE_PATTERN = re.compile(
        r'^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$'
    )

    # Email pattern (RFC 5322 compliant simplified)
    EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
    )

    # SSN pattern: XXX-XX-XXXX or XXXXXXXXX
    SSN_PATTERN = re.compile(r'^\d{3}-?\d{2}-?\d{4}$')

    # Date formats accepted
    DATE_FORMATS = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%m-%d-%Y",
        "%d-%m-%Y",
    ]

    @staticmethod
    def validate_mrn_format(mrn: str) -> ValidationResult:
        """
        Validate Medical Record Number format.

        Args:
            mrn: The MRN string to validate

        Returns:
            ValidationResult with validation status and details
        """
        if not mrn:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationErrorCode.REQUIRED_FIELD_MISSING,
                error_message="MRN is required",
                field_name="mrn"
            )

        if not isinstance(mrn, str):
            return ValidationResult(
                is_valid=False,
                error_code=ValidationErrorCode.INVALID_MRN_FORMAT,
                error_message="MRN must be a string",
                field_name="mrn"
            )

        mrn = mrn.strip()

        if len(mrn) < MRN_MIN_LENGTH:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationErrorCode.MRN_TOO_SHORT,
                error_message=f"MRN must be at least {MRN_MIN_LENGTH} characters",
                field_name="mrn"
            )

        if len(mrn) > MRN_MAX_LENGTH:
            return ValidationResult(
                is_valid=False,
                error_code=ValidationErrorCode.MRN_TOO_LONG,
                error_message=f"MRN must not exceed {MRN