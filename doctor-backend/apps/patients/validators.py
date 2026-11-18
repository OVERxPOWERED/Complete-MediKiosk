import re
import json
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Union

from django.core.exceptions import ValidationError
from django.utils.html import strip_tags

try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    BLEACH_AVAILABLE = False

try:
    import jsonschema
    from jsonschema import validate as jsonschema_validate
    JSONSCHEMA_AVAILABLE = True
except ImportError:
    JSONSCHEMA_AVAILABLE = False


# JSON Schema for prescription validation
PRESCRIPTION_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "required": ["medicine_name", "dosage", "frequency", "duration"],
        "properties": {
            "medicine_name": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200,
                "pattern": "^[a-zA-Z0-9\\s\\-\\(\\)\\.\\,]+$"
            },
            "dosage": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "pattern": "^[a-zA-Z0-9\\s\\-\\.\\/\\+]+$"
            },
            "frequency": {
                "type": "string",
                "enum": [
                    "once_daily", "twice_daily", "thrice_daily", "four_times_daily",
                    "every_4_hours", "every_6_hours", "every_8_hours", "every_12_hours",
                    "as_needed", "weekly", "monthly", "custom"
                ]
            },
            "duration": {
                "type": "string",
                "minLength": 1,
                "maxLength": 50,
                "pattern": "^\\d+\\s*(days?|weeks?|months?|years?)$"
            },
            "instructions": {
                "type": "string",
                "maxLength": 500
            },
            "route": {
                "type": "string",
                "enum": ["oral", "topical", "injection", "inhalation", "sublingual", "rectal", "ophthalmic", "otic", "nasal", "transdermal"],
                "default": "oral"
            },
            "quantity": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1000
            },
            "refills": {
                "type": "integer",
                "minimum": 0,
                "maximum": 12,
                "default": 0
            }
        },
        "additionalProperties": False
    },
    "minItems": 1,
    "maxItems": 20
}


# Valid ranges for vital signs
VITALS_RANGES = {
    "systolic_bp": {"min": 50, "max": 300, "unit": "mmHg"},
    "diastolic_bp": {"min": 30, "max": 200, "unit": "mmHg"},
    "heart_rate": {"min": 30, "max": 220, "unit": "bpm"},
    "temperature": {"min": 30.0, "max": 45.0, "unit": "°C"},
    "temperature_f": {"min": 86.0, "max": 113.0, "unit": "°F"},
    "spo2": {"min": 50, "max": 100, "unit": "%"},
    "respiratory_rate": {"min": 5, "max": 60, "unit": "breaths/min"},
    "weight": {"min": 0.5, "max": 500, "unit": "kg"},
    "height": {"min": 30, "max": 250, "unit": "cm"},
    "bmi": {"min": 10.0, "max": 70.0, "unit": "kg/m²"},
    "blood_glucose": {"min": 20, "max": 600, "unit": "mg/dL"},
    "hba1c": {"min": 3.0, "max": 20.0, "unit": "%"},
}


# Indian phone number regex pattern
INDIAN_PHONE_PATTERN = re.compile(r'^(\+91|91)?[6-9]\d{9}$')

# Email regex pattern with stricter validation
EMAIL_PATTERN = re.compile(
    r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
)

# Allowed HTML tags for sanitization
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'ul', 'ol', 'li',
    'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
]

# Allowed HTML attributes
ALLOWED_ATTRIBUTES = {
    '*': ['class', 'style'],
    'span': ['class', 'style'],
    'div': ['class', 'style'],
}

# Allowed CSS styles
ALLOWED_STYLES = [
    'color', 'font-weight', 'font-style', 'text-decoration',
    'text-align', 'font-size', 'line-height', 'margin', 'padding'
]


def validate_phone_number(phone: str) -> str:
    """
    Validate and normalize Indian phone number format.
    
    Args:
        phone: Phone number string in various formats
        
    Returns:
        Normalized phone number in +91XXXXXXXXXX format
        
    Raises:
        ValidationError: If phone number is invalid
    """
    if not phone or not isinstance(phone, str):
        raise ValidationError("Phone number is required.")
    
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone.strip())
    
    # Validate against Indian phone pattern
    if not INDIAN_PHONE_PATTERN.match(cleaned):
        raise ValidationError(
            "Invalid Indian phone number format. Expected format: +91XXXXXXXXXX or 91XXXXXXXXXX or XXXXXXXXXX"
        )
    
    # Normalize to +91XXXXXXXXXX format
    if cleaned.startswith('+91'):
        normalized = cleaned
    elif cleaned.startswith('91') and len(cleaned) == 12:
        normalized = '+' + cleaned
    elif len(cleaned) == 10:
        normalized = '+91' + cleaned
    else:
        normalized = '+91' + cleaned[-10:]
    
    return normalized


def validate_email_format(email: str) -> str:
    """
    Validate email format with domain validation.
    
    Args:
        email: Email address string
        
    Returns:
        Cleaned and normalized email address (lowercase)
        
    Raises:
        ValidationError: If email format is invalid
    """
    if not email or not isinstance(email, str):
        raise ValidationError("Email address is required.")
    
    cleaned = email.strip().lower()
    
    if not cleaned:
        raise ValidationError("Email address cannot be empty.")
    
    if len(cleaned) > 254:
        raise ValidationError("Email address is too long (max 254 characters).")
    
    # Basic regex validation
    if not EMAIL_PATTERN.match(cleaned):
        raise ValidationError("Invalid email format.")
    
    # Additional domain validation
    local_part, domain = cleaned.rsplit('@', 1)
    
    # Check local part length
    if len(local_part) > 64:
        raise ValidationError("Email local part is too long (max 64 characters).")
    
    # Check domain format
    if not domain or len(domain) > 253:
        raise ValidationError("Invalid email domain.")
    
    # Domain must have at least one dot and valid TLD
    domain_parts = domain.split('.')
    if len(domain_parts) < 2:
        raise ValidationError("Email domain must have a valid TLD.")
    
    # Check each domain label
    for label in domain_parts:
        if not label or len(label) > 63:
            raise ValidationError("Invalid domain label length.")
        if label.startswith('-') or label.endswith('-'):
            raise ValidationError("Domain labels cannot start or end with hyphen.")
        if not re.match(r'^[a-zA-Z0-9-]+$', label):
            raise ValidationError("Domain contains invalid characters.")
    
    # TLD validation (basic check)
    tld = domain_parts[-1]
    if not re.match(r'^[a-zA-Z]{2,}$', tld):
        raise ValidationError("Invalid top-level domain.")
    
    return cleaned


def validate_date_not_future(value: Union[date, datetime, str], field_name: str = "Date") -> date:
    """
    Validate that a date is not in the future.
    
    Args:
        value: Date value to validate (date, datetime, or ISO format string)
        field_name: Name of the field for error messages
        
    Returns:
        Validated date object
        
    Raises:
        ValidationError: If date is in the future or invalid format
    """
    if value is None:
        raise ValidationError(f"{field_name} is required.")
    
    # Parse string to date if needed
    if isinstance(value, str):
        try:
            # Try ISO format first
            parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
            value = parsed.date()
        except ValueError:
            try:
                value = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise ValidationError(f"Invalid date format for {field_name}. Use YYYY-MM-DD.")
    elif isinstance(value, datetime):
        value = value.date()
    elif not isinstance(value, date):
        raise ValidationError(f"{field_name} must be a valid date.")
    
    today = date.today()
    if value > today:
        raise ValidationError(f"{field_name} cannot be in the future.")
    
    return value


def validate_date_range(
    start_date: Union[date, datetime, str],
    end_date: Union[date, datetime, str],
    max_days: Optional[int] = None,
    allow_future: bool = False
) -> tuple[date, date]:
    """
    Validate a date range.
    
    Args:
        start_date: Start date of range
        end_date: End date of range
        max_days: Maximum allowed days in range (optional)
        allow_future: Whether to allow future dates
        
    Returns:
        Tuple of (validated_start_date, validated_end_date)
        
    Raises:
        ValidationError: If range is invalid
    """
    today = date.today()
    
    # Validate start date
    if isinstance(start_date, str):
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
        except ValueError:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    elif isinstance(start_date, datetime):
        start_date = start_date.date()
    
    # Validate end date
    if isinstance(end_date, str):
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
        except ValueError:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    elif isinstance(end_date, datetime):
        end_date = end_date.date()
    
    if not isinstance(start_date, date) or not isinstance(end_date, date):
        raise ValidationError("Both start_date and end_date must be valid dates.")
    
    if start_date > end_date:
        raise ValidationError("Start date cannot be after end date.")
    
    if not allow_future:
        if start_date > today:
            raise ValidationError("Start date cannot be in the future.")
        if end_date > today:
            raise ValidationError("End date cannot be in the future.")
    
    if max_days is not None:
        delta = (end_date - start_date).days
        if delta > max_days:
            raise ValidationError(f"Date range cannot exceed {max_days} days.")
    
    return start_date, end_date


def validate_prescription_structure(prescriptions: Union[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Validate prescription data structure against JSON schema.
    
    Args:
        prescriptions: Prescription data as JSON string or list of dicts
        
    Returns:
        Validated list of prescription dictionaries
        
    Raises:
        ValidationError: If prescription structure is invalid
    """
    if not prescriptions:
        raise ValidationError("Prescription data is required.")
    
    # Parse JSON string if needed
    if isinstance(prescriptions, str):
        try:
            prescriptions = json.loads(prescriptions)
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON format for prescriptions: {str(e)}")
    
    if not isinstance(prescriptions, list):
        raise ValidationError("Prescriptions must be a list.")
    
    if not prescriptions:
        raise ValidationError("At least one prescription is required.")
    
    if len(prescriptions) > 20:
        raise ValidationError("Maximum 20 prescriptions allowed per request.")
    
    # Validate against JSON schema if jsonschema is available
    if JSONSCHEMA_AVAILABLE:
        try:
            jsonschema_validate(instance=prescriptions, schema=PRESCRIPTION_SCHEMA)
        except jsonschema.ValidationError as e:
            raise ValidationError(f"Prescription validation failed: {e.message}")
        except jsonschema.SchemaError as e:
            raise ValidationError(f"Prescription schema error: {str(e)}")
    else:
        # Fallback manual validation
        _validate_prescriptions_manual(prescriptions)
    
    return prescriptions


def _validate_prescriptions_manual(prescriptions: List[Dict[str, Any]]) -> None:
    """Manual prescription validation when jsonschema is not available."""
    required_fields = ['medicine_name', 'dosage', 'frequency', 'duration']
    valid_frequencies = {
        'once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily',
        'every_4_hours', 'every_6_hours', 'every_8_hours', 'every_12_hours',
        'as_needed', 'weekly', 'monthly', 'custom'
    }
    valid_routes = {
        'oral', 'topical', 'injection', 'inhalation', 'sublingual',
        'rectal', 'ophthalmic', 'otic', 'nasal', 'transdermal'
    }
    
    for idx, presc in enumerate(prescriptions):
        if not isinstance(presc, dict):
            raise ValidationError(f"Prescription {idx + 1} must be an object.")
        
        # Check required fields
        for field in required_fields:
            if field not in presc or not presc[field]:
                raise ValidationError(f"Prescription {idx + 1}: missing required field '{field}'.")
        
        # Validate medicine_name
        med_name = presc['medicine_name']
        if not isinstance(med_name, str) or not (1 <= len(med_name) <= 200):
            raise ValidationError(f"Prescription {idx + 1}: medicine_name must be 1-200 characters.")
        if not re.match(r'^[a-zA-Z0-9\s\-\.\(\)\,]+$', med_name):
            raise ValidationError(f"Prescription {idx + 1}: medicine_name contains invalid characters.")
        
        # Validate dosage
        dosage = presc['dosage']
        if not isinstance(dosage, str) or not (1 <= len(dosage) <= 100):
            raise ValidationError(f"Prescription {idx + 1}: dosage must be 1-100 characters.")
        
        # Validate frequency
        freq = presc['frequency']
        if freq not in valid_frequencies:
            raise ValidationError(f"Prescription {idx + 1}: invalid frequency '{freq}'.")
        
        # Validate duration
        duration = presc['duration']
        if not isinstance(duration, str) or not re.match(r'^\d+\s*(