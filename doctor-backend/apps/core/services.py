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


# =============================================================================
# Custom Domain Exceptions
# =============================================================================

class AppointmentConflictError(ConflictError):
    """Raised when appointment scheduling conflicts with existing appointments."""
    def __init__(self, message: str = "Appointment time slot is not available", **kwargs):
        super().__init__(message, **kwargs)


class PatientNotFoundError(NotFoundError):
    """Raised when a patient cannot be found."""
    def __init__(self, message: str = "Patient not found", **kwargs):
        super().__init__(message, **kwargs)


class DoctorNotFoundError(NotFoundError):
    """Raised when a doctor cannot be found."""
    def __init__(self, message: str = "Doctor not found", **kwargs):
        super().__init__(message, **kwargs)


class DoctorUnavailableError(ConflictError):
    """Raised when a doctor is not available for the requested time."""
    def __init__(self, message: str = "Doctor is not available at the requested time", **kwargs):
        super().__init__(message, **kwargs)


class MedicalRecordNotFoundError(NotFoundError):
    """Raised when a medical record cannot be found."""
    def __init__(self, message: str = "Medical record not found", **kwargs):
        super().__init__(message, **kwargs)


# =============================================================================
# Data Transfer Objects / Parameter Classes
# =============================================================================

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


@dataclass(frozen=True, slots=True)
class AppointmentSearchFilters:
    """Filters for appointment search."""
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    status: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


# =============================================================================
# Patient Service
# =============================================================================

class PatientService:
    """
    Service layer for patient management operations.
    
    Handles patient registration, retrieval, updates, and history queries
    with proper validation and business rule enforcement.
    """

    @staticmethod
    def register_patient(
        *,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        gender: str,
        phone: str,
        email: str,
        address: str,
        emergency_contact_name: Optional[str] = None,
        emergency_contact_phone: Optional[str] = None,
        blood_type: Optional[str] = None,
        allergies: Optional[str] = None,
        medical_conditions: Optional[str] = None,
    ) -> Patient:
        """
        Register a new patient with validation.
        
        Args:
            first_name: Patient's first name
            last_name: Patient's last name
            date_of_birth: Patient's date of birth
            gender: Patient's gender (M/F/O)
            phone: Contact phone number
            email: Contact email
            address: Residential address
            emergency_contact_name: Emergency contact name
            emergency_contact_phone: Emergency contact phone
            blood_type: Blood type (A+, B-, etc.)
            allergies: Known allergies
            medical_conditions: Pre-existing conditions
            
        Returns:
            Created Patient instance
            
        Raises:
            ValidationError: If validation fails
            ConflictError: If patient with same email/phone exists
        """
        # Validate input data
        validate_patient_data(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            gender=gender,
            phone=phone,
            email=email,
        )

        # Check for existing patient with same email or phone
        if Patient.objects.filter(email__iexact=email).exists():
            raise ConflictError("A patient with this email already exists")
        if Patient.objects.filter(phone=phone).exists():
            raise ConflictError("A patient with this phone number already exists")

        # Validate age (must be reasonable)
        today = date.today()
        age = today.year - date_of_birth.year - (
            (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
        )
        if age < 0 or age > 150:
            raise ValidationError("Invalid date of birth: age must be between 0 and 150")

        with transaction.atomic():
            patient = Patient.objects.create(
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                date_of_birth=date_of_birth,
                gender=gender.upper(),
                phone=phone.strip(),
                email=email.lower().strip(),
                address=address.strip(),
                emergency_contact_name=emergency_contact_name.strip() if emergency_contact_name else None,
                emergency_contact_phone=emergency_contact_phone.strip() if emergency_contact_phone else None,
                blood_type=blood_type.upper() if blood_type else None,
                allergies=allergies.strip() if allergies else None,
                medical_conditions=medical_conditions.strip() if medical_conditions else None,
                is_active=True,
            )
            logger.info(f"Registered new patient: {patient.id} - {patient.full_name}")
            return patient

    @staticmethod
    def get_patient_by_id(patient_id: int) -> Patient:
        """
        Retrieve a patient by ID with optimized queries.
        
        Args:
            patient_id: Patient primary key
            
        Returns:
            Patient instance
            
        Raises:
            PatientNotFoundError: If patient doesn't exist
        """
        try:
            return Patient.objects.select_related().get(pk=patient_id)
        except Patient.DoesNotExist:
            raise PatientNotFoundError(f"Patient with ID {patient_id} not found")

    @staticmethod
    def get_patient_history(patient_id: int) -> dict:
        """
        Get comprehensive patient history including appointments and medical records.
        
        Args:
            patient_id: Patient primary key
            
        Returns:
            Dictionary with patient info, appointments, and medical records
        """
        patient = PatientService.get_patient_by_id(patient_id)
        
        appointments = Appointment.objects.filter(patient=patient).select_related(
            'doctor', 'doctor__user'
        ).prefetch_related('medical_records').order_by('-scheduled_at')
        
        medical_records = MedicalRecord.objects.filter(patient=patient).select_related(
            'doctor', 'doctor__user', 'appointment'
        ).order_by('-created_at')

        return {
            'patient': patient,
            'appointments': list(appointments),
            'medical_records': list(medical_records),
            'appointment_count': appointments.count(),
            'record_count': medical_records.count(),
        }

    @staticmethod
    def update_patient(
        patient_id: int,
        *,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        address: Optional[str] = None,
        emergency_contact_name: Optional[str] = None,
        emergency_contact_phone: Optional[str] = None,
        blood_type: Optional[str] = None,
        allergies: Optional[str] = None,
        medical_conditions: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Patient:
        """
        Update patient information with validation.
        
        Args:
            patient_id: Patient primary key
            **fields: Fields to update (None means no change)
            
        Returns:
            Updated Patient instance
            
        Raises:
            PatientNotFoundError: If patient doesn't exist
            ValidationError: If validation fails
            ConflictError: If email/phone conflicts with another patient
        """
        patient = PatientService.get_patient_by_id(patient_id)

        # Validate email uniqueness if changing
        if email is not None and email.lower().strip() != patient.email:
            if Patient.objects.filter(email__iexact=email).exclude(pk=patient_id).exists():
                raise ConflictError("A patient with this email already exists")

        # Validate phone uniqueness if changing
        if phone is not None and phone.strip() != patient.phone:
            if Patient.objects.filter(phone=phone).exclude(pk=patient_id).exists():
                raise ConflictError("A patient with this phone number already exists")

        # Build update fields
        update_fields = {}
        if first_name is not None:
            update_fields['first_name'] = first_name.strip()
        if last_name is not None:
            update_fields['last_name'] = last_name.strip()
        if phone is not None:
            update_fields['phone'] = phone.strip()
        if email is not None:
            update_fields['email'] = email.lower().strip()
        if address is not None:
            update_fields['address'] = address.strip()
        if emergency_contact_name is not None:
            update_fields['emergency_contact_name'] = emergency_contact_name.strip() if emergency_contact_name else None
        if emergency_contact_phone is not None:
            update_fields['emergency_contact_phone'] = emergency_contact_phone.strip() if emergency_contact_phone else None
        if blood_type is not None:
            update_fields['blood_type'] = blood_type.upper() if blood_type else None
        if allergies is not None:
            update_fields['allergies'] = allergies.strip() if allergies else None
        if medical_conditions is not None:
            update_fields['medical_conditions'] = medical_conditions.strip() if medical_conditions else None
        if is_active is not None:
            update_fields['is_active'] = is_active

        if update_fields:
            with transaction.atomic():
                for field, value in update_fields.items():
                    setattr(patient, field, value)
                patient.save(update_fields=list(update_fields.keys()) + ['updated_at'])
                logger.info(f"Updated patient {patient_id}: {list(update_fields.keys())}")

        return patient

    @staticmethod
    def search_patients(
        filters: PatientSearchFilters,
        pagination: PaginationParams,
    ) -> tuple[list[Patient], int]:
        """
        Search patients with filters and pagination.
        
        Args:
            filters: Search filters
            pagination: Pagination parameters
            
        Returns:
            Tuple of (patient list, total count)
        """
        queryset = Patient.objects.all()

        if filters.query:
            queryset = queryset.filter(
                Q(first_name__icontains=filters.query) |
                Q(last_name__icontains=filters.query) |
                Q(email__icontains=filters.query) |
                Q(phone__icontains=filters.query)
            )

        if filters.date_of_birth_from:
            queryset = queryset.filter(date_of_birth__gte=filters.date_of_birth_from)
        if filters.date_of_birth_to:
            queryset = queryset.filter(date_of_birth__lte=filters.date_of_birth_to)
        if filters.gender:
            queryset = queryset.filter(gender=filters.gender.upper())
        if filters.is_active is not None:
            queryset = queryset.filter(is_active=filters.is_active)

        total = queryset.count()
        patients = list(
            queryset.order_by('-created_at')[pagination.offset:pagination.offset + pagination.limit]
        )

        return patients, total

    @staticmethod
    def deactivate_patient(patient_id: int) -> Patient:
        """
        Soft delete a patient by setting is_active=False.
        
        Args:
            patient_id: Patient primary key
            
        Returns:
            Updated Patient instance
        """
        return PatientService.update_patient(patient_id, is_active=False)


# =============================================================================
# Doctor Service
# =============================================================================

class DoctorService:
    """
    Service layer for doctor management operations.
    """

    @staticmethod
    def register_doctor(
        *,
        user_id: int,
        specialization: str,
        license_number: str,
        phone: str,
        email: str,
        address: str,
        consultation_fee: Decimal,
        bio: Optional[str] = None,
        years_of_experience: int = 0,
        education: Optional[str] = None,
        certifications: Optional[str] = None,
        languages: Optional[str] = None,
        available_days: Optional[list[int]] = None,
        available_from: Optional[time] = None,
        available_to: Optional[time] = None,
    ) -> Doctor:
        """
        Register a new doctor with validation.
        
        Args:
            user_id: Associated user ID
            specialization: Medical specialization
            license_number: Medical license number
            phone: Contact phone
            email: Contact email
            address: Clinic address
            consultation_fee: Fee per consultation
            bio: Professional biography
            years_of_experience: Years of experience
            education: Education background
            certifications: Certifications
            languages: Languages spoken
            available_days: List of weekday integers (0=Monday)
            available_from: Start of availability
            available_to: End of availability
            
        Returns:
            Created Doctor instance
        """
        validate_doctor_data(
            specialization=specialization,
            license_number=license_number,
            phone=phone,
            email=email,
            consultation_fee=consultation_fee,
        )

        if Doctor.objects.filter(license_number=license_number).exists():
            raise ConflictError("A doctor with this license number already exists")
        if Doctor.objects.filter(email__iexact=email).exists():
            raise ConflictError("A doctor with this email already exists")
        if Doctor.objects.filter(user_id=user_id).exists():
            raise ConflictError("This user already has a doctor profile")

        with transaction.atomic():
            doctor = Doctor.objects.create(
                user_id=user_id,
                specialization=specialization.strip(),
                license_number=license_number.strip(),
                phone=phone.strip(),
                email=email.lower().strip(),
                address=address.strip(),
                consultation_fee=consultation_fee,
                bio=bio.strip() if bio else None,
                years_of_experience=years_of_experience,
                education=education.strip() if education else None,
                certifications=certifications.strip() if certifications else None,
                languages=languages.strip() if languages else None,
                available_days=available_days or [0, 1, 2, 3, 4],  # Mon-Fri default
                available_from=available_from or time(9, 0),
                available_to=available_to or time(17, 0),
                is_active=True,
                is_verified=False,
            )
            logger.info(f"Registered new doctor: {doctor.id} - Dr. {doctor.user.get_full_name()}")
            return doctor

    @staticmethod
    def get_doctor_by_id(doctor_id: int) -> Doctor:
        """Retrieve a doctor by ID."""
        try:
            return Doctor.objects.select_related('user').get(pk=doctor_id)
        except Doctor.DoesNotExist:
            raise DoctorNotFoundError(f"Doctor with ID {doctor_id} not found")

    @staticmethod
    def get_available_doctors(
        filters: DoctorAvailabilityFilters,
        pagination: PaginationParams,
    ) -> tuple[list[Doctor], int]:
        """
        Get available doctors with filters.
        
        Args:
            filters: Availability filters
            pagination: Pagination parameters
            
        Returns:
            Tuple of (doctor list, total count)
        """
        queryset = Doctor.objects.filter(is_active=True, is_verified=True).select_related('user')

        if filters.specialization:
            queryset = queryset.filter(specialization__icontains