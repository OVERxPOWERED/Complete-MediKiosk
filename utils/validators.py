```python
"""
Core validation utilities for the Doctor Backend application.

Provides environment guardrails, input validation, and sanitization
for secure parameter handling across the domain.
"""

import re
import os
from typing import Optional, List, Tuple
from urllib.parse import urlparse

import bleach
import phonenumbers
from phonenumbers import NumberParseException, PhoneNumberFormat
from pydantic import BaseModel, field_validator, ValidationError

from .exceptions import (
    ValidationError as DomainValidationError,
    InvalidPhoneNumberError,
    InvalidAadhaarError,
    InvalidDosageError,
    InvalidAppointmentSlotError,
    InvalidFileUploadError,
    ConfigurationError,
)


# =============================================================================
# Phone Number Validation (Indian Format)
# =============================================================================

INDIAN_PHONE_REGEX = re.compile(r"^(\+91|91|0)?[6-9]\d{9}$")


def validate_phone_number(phone: str, region: str = "IN") -> str:
    """
    Validate and normalize an Indian phone number.

    Args:
        phone: Raw phone number string
        region: ISO country code (default: "IN" for India)

    Returns:
        Normalized phone number in E.164 format (+91XXXXXXXXXX)

    Raises:
        InvalidPhoneNumberError: If the phone number is invalid
    """
    if not phone or not isinstance(phone, str):
        raise InvalidPhoneNumberError("Phone number cannot be empty")

    # Strip whitespace and common formatting characters
    cleaned = re.sub(r"[\s\-\(\)]", "", phone.strip())

    # Quick regex check for Indian format
    if not INDIAN_PHONE_REGEX.match(cleaned):
        raise InvalidPhoneNumberError(
            f"Invalid Indian phone number format: {phone}. "
            "Expected format: +91XXXXXXXXXX, 91XXXXXXXXXX, or 0XXXXXXXXXX"
        )

    try:
        parsed = phonenumbers.parse(cleaned, region)
    except NumberParseException as e:
        raise InvalidPhoneNumberError(f"Failed to parse phone number: {e}")

    if not phonenumbers.is_valid_number(parsed):
        raise InvalidPhoneNumberError(f"Invalid phone number: {phone}")

    if phonenumbers.region_code_for_number(parsed) != "IN":
        raise InvalidPhoneNumberError("Phone number must be an Indian number (+91)")

    # Return in E.164 format
    return phonenumbers.format_number(parsed, PhoneNumberFormat.E164)


# =============================================================================
# Aadhaar Validation (Verhoeff Algorithm Checksum)
# =============================================================================

# Verhoeff algorithm tables
VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]


def _verhoeff_checksum(digits: str) -> int:
    """Calculate Verhoeff checksum for a digit string."""
    c = 0
    for i, ch in enumerate(reversed(digits)):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][int(ch)]]
    return c


def validate_aadhaar(aadhaar: str) -> str:
    """
    Validate an Aadhaar number using Verhoeff algorithm checksum.

    Args:
        aadhaar: 12-digit Aadhaar number (spaces/hyphens allowed)

    Returns:
        Cleaned 12-digit Aadhaar number

    Raises:
        InvalidAadhaarError: If the Aadhaar number is invalid
    """
    if not aadhaar or not isinstance(aadhaar, str):
        raise InvalidAadhaarError("Aadhaar number cannot be empty")

    # Remove spaces and hyphens
    cleaned = re.sub(r"[\s\-]", "", aadhaar.strip())

    # Must be exactly 12 digits
    if not re.fullmatch(r"\d{12}", cleaned):
        raise InvalidAadhaarError(
            f"Aadhaar must be 12 digits, got: {cleaned}"
        )

    # First digit cannot be 0 or 1
    if cleaned[0] in ("0", "1"):
        raise InvalidAadhaarError("Aadhaar number cannot start with 0 or 1")

    # Verify checksum (last digit is check digit)