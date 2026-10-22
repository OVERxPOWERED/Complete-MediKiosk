```python
"""
Input sanitization and secure parameter validation utilities for all API endpoints.
"""
import re
import bleach
from functools import wraps
from typing import Any, Callable, Dict, List, Optional, Type

from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response


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


def validate_aadhaar(aadhaar: str) -> str:
    """
    Validate Aadhaar number using Verhoeff algorithm.
    
    Args:
        aadhaar: Aadhaar number string (12 digits)
    
    Returns:
        Validated Aadhaar number (12 digits, no spaces)
    
    Raises:
        ValidationError: If Aadhaar format or checksum is invalid
    """
    if not aadhaar:
        raise ValidationError("Aadhaar number is required.")
    
    # Remove spaces and hyphens
    cleaned = re.sub(r'[\s\-]', '', aadhaar)
    
    # Must be exactly 12 digits
    if not re.match(r'^\d{12}$', cleaned):
        raise ValidationError("Aadhaar number must be exactly 12 digits.")
    
    # Verhoeff algorithm validation
    if not _verhoeff_validate(cleaned):
        raise ValidationError("Invalid Aadhaar number (checksum verification failed).")
    
    return cleaned


def _verhoeff_validate(number: str) -> bool:
    """
    Validate a number using the Verhoeff algorithm.
    
    Args:
        number: String of digits to validate
    
    Returns:
        True if valid, False otherwise
    """
    # Verhoeff multiplication table
    d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4,