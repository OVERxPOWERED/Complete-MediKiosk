```python
"""
Domain service layer for the doctor-backend application.

This module contains business logic services for patient management,
doctor management, appointment scheduling, and medical records.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Optional

from django.db import transaction
from django.db.models import Q, QuerySet
from django.utils import timezone

from apps.core.exceptions import ConflictError, NotFoundError, ValidationError
from apps.core.models import Appointment, Doctor, MedicalRecord, Patient
from apps.core.validators import (
    validate_appointment_data,
    validate_doctor_data,
    validate_medical_record_data,
    validate_patient_data,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class PaginationParams:
    """Pagination parameters for list queries."""
    page: int = 1
    page_size: int = 20

    def __post_init__(self) -> None:
        if self.page < 1:
            raise ValidationError("Page must be >= 1")
        if self.page_size < 1 or self.page_size > 100:
            raise ValidationError("Page size must be between 1 and 100")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


@dataclass(frozen=True, slots=True)
class PatientSearchFilters:
    """Filters for patient search."""
    query: Optional[str] = None
    date_of_birth_from: Optional[date] = None
    date_of_birth_to: Optional[date] = None
    gender: Optional[str] = None
    is_active: Optional[bool] = None


@dataclass(frozen=True, slots=True)
class DoctorAvailabilityFilters:
    """Filters for doctor availability search."""
    specialization: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    available_at: Optional[datetime] = None


class PatientService:
    """Service for patient management operations."""

    def create_patient(
        self,
        *,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        gender: str,
        phone: str,
        email: str,
        address: str,
        emergency_contact_name: str,
        emergency_contact_phone: str,
        insurance_provider: Optional[str] = None,
        insurance_policy_number: Optional[str] = None,
        blood_type: Optional[str] = None,
        allergies: Optional[str] = None,
        medical_conditions: Optional[str] = None,
    ) -> Patient:
        """
        Create a new patient with validation.

        Args:
            first_name: Patient's first name
            last_name: Patient's last name
            date_of_birth: Patient's date of birth
            gender: Patient's gender (M/F/O)
            phone: Phone number
            email: Email address
            address: Physical address
            emergency_contact_name: Emergency contact name
            emergency_contact_phone: Emergency contact phone
            insurance_provider: Insurance provider name
            insurance_policy_number: Insurance policy number
            blood_type: Blood type
            allergies: Known allergies
            medical_conditions: Pre-existing conditions

        Returns:
            Created Patient instance

        Raises:
            ValidationError: If validation fails
            ConflictError: If patient with same email/phone exists
        """
        data = {
            "first_name": first_name,
            "last_name": last_name,
            "date_of_birth": date_of_birth,
            "gender": gender,
            "phone": phone,
            "email": email,
            "address": address,
            "emergency_contact_name": emergency_contact_name,
            "emergency_contact_phone": emergency_contact_phone,
            "insurance_provider": insurance_provider,
            "insurance_policy_number": insurance_policy_number,
            "blood_type": blood_type,
            "allergies": allergies,
            "medical_conditions": medical_conditions,
        }

        validated_data = validate_patient_data(data)

        if Patient.objects.filter(email=validated_data["email"]).exists():
            raise ConflictError(f"Patient with email {validated_data['email']} already exists")

        if Patient.objects.filter(phone=validated_data["phone"]).exists():
            raise ConflictError(f"Patient with phone {validated_data['phone']} already exists")

        with transaction.atomic():
            patient = Patient.objects.create(**validated_data)
            logger.info(f"Created patient: {patient.id} - {patient.full_name}")

        return patient

    def get_patient(self, patient_id: int) -> Patient:
        """
        Retrieve a patient by ID.

        Args:
            patient_id: Patient primary key

        Returns:
            Patient instance

        Raises:
            NotFoundError: If patient not found
        """
        try:
            return Patient.objects.select_related().get(pk=patient_id)
        except Patient.DoesNotExist:
            raise NotFoundError(f"Patient with id {patient_id} not found")

    def update_patient(
        self,
        patient_id: int,
        *,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        date_of_birth: Optional[date] = None,
        gender: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        address: Optional[str] = None,
        emergency_contact_name: Optional[str] = None,
        emergency_contact_phone: Optional[str] = None,
        insurance_provider: Optional[str] = None,
        insurance_policy_number: Optional[str] = None,
        blood_type: Optional[str] = None,
        allergies: Optional[str] = None,
        medical_conditions: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Patient:
        """
        Update patient information.

        Args:
            patient_id: Patient primary key
            **fields: Fields to update (None values are ignored)

        Returns:
            Updated Patient instance

        Raises:
            NotFoundError: If patient not found
            ValidationError: If validation fails
            ConflictError: If email/phone conflicts with another patient
        """
        patient = self.get_patient(patient_id)

        update_data = {
            "first_name": first_name,
            "last_name": last_name,
            "date_of_birth": date_of_birth,
            "gender": gender,
            "phone": phone,
            "email": email,
            "address": address,
            "emergency_contact_name": emergency_contact_name,
            "emergency_contact_phone": emergency_contact_phone,
            "insurance_provider": insurance_provider,
            "insurance_policy_number": insurance_policy_number,
            "blood_type": blood_type,
            "allergies": allergies,
            "medical_conditions": medical_conditions,
            "is_active": is_active,
        }

        update_data = {k: v for k, v in update_data.items() if v is not None}

        if not update_data:
            return patient

        validated_data = validate_patient_data(update_data, partial=True)

        if "email" in validated_data and validated_data["