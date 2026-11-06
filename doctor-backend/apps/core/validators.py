"""
Input sanitization and secure parameter validation utilities for all API endpoints.
"""
import re
import json
import bleach
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Union

from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible
from rest_framework import serializers


# Allowed HTML tags and attributes for sanitization
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre', 'a', 'img'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id'],
}

ALLOWED_PROTOCOLS = ['http', 'https', 'mailto', 'tel']


def sanitize_html(html: str, strip: bool = True) -> str:
    """
    Sanitize HTML input to prevent XSS attacks using bleach.
    
    Args:
        html: Raw HTML string to sanitize
        strip: Whether to strip disallowed tags (True) or escape them (False)
    
    Returns:
        Sanitized HTML string safe for rendering
    """
    if not html:
        return ""
    
    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=strip,
        strip_comments=True,
    )


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitize filename for safe file uploads.
    
    Args:
        filename: Original filename
        max_length: Maximum allowed filename length
    
    Returns:
        Sanitized filename safe for filesystem storage
    
    Raises:
        ValidationError: If filename is empty or contains only invalid characters
    """
    if not filename:
        raise ValidationError("Filename cannot be empty.")
    
    # Remove path traversal attempts
    filename = filename.replace('..', '').replace('/', '').replace('\\', '')
    
    # Remove null bytes
    filename = filename.replace('\x00', '')
    
    # Keep only alphanumeric, dots, hyphens, underscores
    filename = re.sub(r'[^\w\.\-]', '_', filename)
    
    # Prevent hidden files
    if filename.startswith('.'):
        filename = '_' + filename[1:]
    
    # Truncate to max length preserving extension
    if len(filename) > max_length:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        if ext:
            max_name_len = max_length - len(ext) - 1
            filename = name[:max_name_len] + '.' + ext
        else:
            filename = filename[:max_length]
    
    if not filename or filename == '.':
        raise ValidationError("Invalid filename after sanitization.")
    
    return filename


def validate_phone_number(phone: str) -> str:
    """
    Validate Indian mobile number format.
    
    Accepts formats:
    - +91XXXXXXXXXX
    - 91XXXXXXXXXX
    - 0XXXXXXXXXX
    - XXXXXXXXXX (10 digits starting with 6-9)
    
    Args:
        phone: Phone number string
    
    Returns:
        Normalized phone number in +91XXXXXXXXXX format
    
    Raises:
        ValidationError: If phone number format is invalid
    """
    if not phone:
        raise ValidationError("Phone number is required.")
    
    # Remove all non-digit characters except leading +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Handle different formats
    if cleaned.startswith('+91'):
        number = cleaned[3:]
    elif cleaned.startswith('91') and len(cleaned) == 12:
        number = cleaned[2:]
    elif cleaned.startswith('0') and len(cleaned) == 11:
        number = cleaned[1:]
    else:
        number = cleaned
    
    # Validate: 10 digits starting with 6, 7, 8, or 9
    if not re.match(r'^[6-9]\d{9}$', number):
        raise ValidationError(
            "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9."
        )
    
    return f"+91{number}"


def validate_email(email: str) -> str:
    """
    Validate email address format.
    
    Args:
        email: Email address string
    
    Returns:
        Normalized lowercase email address
    
    Raises:
        ValidationError: If email format is invalid
    """
    if not email:
        raise ValidationError("Email address is required.")
    
    email = email.strip().lower()
    
    # RFC 5322 compliant regex (simplified but practical)
    email_regex = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
    
    if not re.match(email_regex, email):
        raise ValidationError("Invalid email address format.")
    
    if len(email) > 254:
        raise ValidationError("Email address is too long (max 254 characters).")
    
    # Additional check for consecutive dots
    if '..' in email:
        raise ValidationError("Email address cannot contain consecutive dots.")
    
    return email


def validate_license_number(license_number: str) -> str:
    """
    Validate medical license number format.
    
    Expected format: XX-XXXXX (2 letters, hyphen, 5 digits)
    Example: MH-12345, DL-67890
    
    Args:
        license_number: License number string
    
    Returns:
        Normalized license number (uppercase)
    
    Raises:
        ValidationError: If license number format is invalid
    """
    if not license_number:
        raise ValidationError("License number is required.")
    
    license_number = license_number.strip().upper()
    
    # Format: 2 letters, hyphen, 5 digits
    if not re.match(r'^[A-Z]{2}-\d{5}$', license_number):
        raise ValidationError(
            "Invalid license number format. Expected format: XX-XXXXX (e.g., MH-12345)"
        )
    
    return license_number


def validate_date_range(
    start_date: Union[date, datetime, str],
    end_date: Optional[Union[date, datetime, str]] = None,
    allow_past: bool = False,
    max_future_days: Optional[int] = None
) -> tuple:
    """
    Validate date range for appointments and scheduling.
    
    Args:
        start_date: Start date (date, datetime, or ISO format string)
        end_date: Optional end date
        allow_past: Whether to allow past dates
        max_future_days: Maximum days in future allowed (None for unlimited)
    
    Returns:
        Tuple of (validated_start_date, validated_end_date) as date objects
    
    Raises:
        ValidationError: If date range is invalid
    """
    today = date.today()
    
    def parse_date(value: Union[date, datetime, str]) -> date:
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00')).date()
            except ValueError:
                raise ValidationError(f"Invalid date format: {value}. Use ISO format (YYYY-MM-DD).")
        raise ValidationError(f"Invalid date type: {type(value)}")
    
    start = parse_date(start_date)
    
    if not allow_past and start < today:
        raise ValidationError("Start date cannot be in the past.")
    
    if max_future_days is not None:
        max_date = today.replace(day=today.day + max_future_days) if today.day + max_future_days <= 28 else \
                   (today.replace(month=today.month + 1, day=1) if today.month < 12 else today.replace(year=today.year + 1, month=1, day=1))
        # Simpler approach:
        from datetime import timedelta
        max_date = today + timedelta(days=max_future_days)
        if start > max_date:
            raise ValidationError(f"Start date cannot be more than {max_future_days} days in the future.")
    
    end = None
    if end_date is not None:
        end = parse_date(end_date)
        if end < start:
            raise ValidationError("End date cannot be before start date.")
        
        if not allow_past and end < today:
            raise ValidationError("End date cannot be in the past.")
        
        if max_future_days is not None and end > max_date:
            raise ValidationError(f"End date cannot be more than {max_future_days} days in the future.")
    
    return (start, end)


def validate_vitals_json(vitals: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validate vital signs JSON schema.
    
    Expected schema:
    {
        "blood_pressure": {"systolic": int, "diastolic": int},  # mmHg
        "heart_rate": int,  # bpm
        "temperature": float,  # Celsius
        "spo2": int,  # percentage
        "respiratory_rate": int,  # breaths per minute (optional)
        "weight": float,  # kg (optional)
        "height": float,  # cm (optional)
        "bmi": float,  # calculated (optional)
        "recorded_at": str  # ISO datetime (optional)
    }
    
    Args:
        vitals: Vital signs data as JSON string or dict
    
    Returns:
        Validated and normalized vitals dictionary
    
    Raises:
        ValidationError: If vitals data is invalid
    """
    if isinstance(vitals, str):
        try:
            vitals = json.loads(vitals)
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON format: {str(e)}")
    
    if not isinstance(vitals, dict):
        raise ValidationError("Vitals must be a JSON object.")
    
    validated = {}
    
    # Blood pressure (required)
    if 'blood_pressure' not in vitals:
        raise ValidationError("Blood pressure is required.")
    
    bp = vitals['blood_pressure']
    if not isinstance(bp, dict):
        raise ValidationError("Blood pressure must be an object with systolic and diastolic.")
    
    systolic = bp.get('systolic')
    diastolic = bp.get('diastolic')
    
    if systolic is None or diastolic is None:
        raise ValidationError("Blood pressure must include both systolic and diastolic values.")
    
    if not isinstance(systolic, (int, float)) or not isinstance(diastolic, (int, float)):
        raise ValidationError("Blood pressure values must be numbers.")
    
    systolic = int(systolic)
    diastolic = int(diastolic)
    
    if not (50 <= systolic <= 300):
        raise ValidationError("Systolic pressure must be between 50 and 300 mmHg.")
    if not (30 <= diastolic <= 200):
        raise ValidationError("Diastolic pressure must be between 30 and 200 mmHg.")
    if systolic <= diastolic:
        raise ValidationError("Systolic pressure must be greater than diastolic pressure.")
    
    validated['blood_pressure'] = {'systolic': systolic, 'diastolic': diastolic}
    
    # Heart rate (required)
    if 'heart_rate' not in vitals:
        raise ValidationError("Heart rate is required.")
    
    hr = vitals['heart_rate']
    if not isinstance(hr, (int, float)):
        raise ValidationError("Heart rate must be a number.")
    
    hr = int(hr)
    if not (20 <= hr <= 300):
        raise ValidationError("Heart rate must be between 20 and 300 bpm.")
    
    validated['heart_rate'] = hr
    
    # Temperature (required)
    if 'temperature' not in vitals:
        raise ValidationError("Temperature is required.")
    
    temp = vitals['temperature']
    if not isinstance(temp, (int, float)):
        raise ValidationError("Temperature must be a number.")
    
    temp = float(temp)
    if not (30.0 <= temp <= 45.0):
        raise ValidationError("Temperature must be between 30.0°C and 45.0°C.")
    
    validated['temperature'] = round(temp, 1)
    
    # SpO2 (required)
    if 'spo2' not in vitals:
        raise ValidationError("SpO2 is required.")
    
    spo2 = vitals['spo2']
    if not isinstance(spo2, (int, float)):
        raise ValidationError("SpO2 must be a number.")
    
    spo2 = int(spo2)
    if not (50 <= spo2 <= 100):
        raise ValidationError("SpO2 must be between 50% and 100%.")
    
    validated['spo2'] = spo2
    
    # Optional fields
    optional_fields = {
        'respiratory_rate': (int, 5, 60, "Respiratory rate must be between 5 and 60 breaths/min."),
        'weight': (float, 0.5, 500.0, "Weight must be between 0.5 and 500 kg."),
        'height': (float, 30.0, 300.0, "Height must be between 30 and 300 cm."),
        'bmi': (float, 5.0, 100.0, "BMI must be between 5.0 and 100.0."),
    }
    
    for field, (field_type, min_val, max_val, error_msg) in optional_fields.items():
        if field in vitals and vitals[field] is not None:
            value = vitals[field]
            if not isinstance(value, (int, float)):
                raise ValidationError(f"{field} must be a number.")
            value = field_type(value)
            if not (min_val <= value <= max_val):
                raise ValidationError(error_msg)
            validated[field] = round(value, 1) if field_type == float else value
    
    # Recorded timestamp
    if 'recorded_at' in vitals and vitals['recorded_at']:
        try:
            recorded_at = datetime.fromisoformat(vitals['recorded_at'].replace('Z', '+00:00'))
            if recorded_at > datetime.now():
                raise ValidationError("Recorded timestamp cannot be in the future.")
            validated['recorded_at'] = recorded_at.isoformat()
        except (ValueError, AttributeError):
            raise ValidationError("Invalid recorded_at format. Use ISO format (YYYY-MM-DDTHH:MM:SS).")
    else:
        validated['recorded_at'] = datetime.now().isoformat()
    
    return validated


# =============================================================================
# DRF Custom Validator Classes
# =============================================================================

@deconstructible
class PhoneNumberValidator:
    """
    DRF validator for Indian phone numbers.
    """
    message = "Enter a valid Indian mobile number (e.g., +919876543210)."
    code = "invalid_phone"
    
    def __call__(self, value: str) -> str:
        return validate_phone_number(value)
    
    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, PhoneNumberValidator) and
            self.message == other.message and
            self.code == other.code
        )


@deconstructible
class EmailValidator:
    """
    DRF validator for email addresses.
    """
    message = "Enter a valid email address."
    code = "invalid_email"
    
    def __call__(self, value: str) -> str:
        return validate_email(value)
    
    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, EmailValidator) and
            self.message ==