"""
Domain service handlers and business logic for patient management.

This module provides service classes for patient registration, visit scheduling,
and medical record management with proper validation, error handling,
and transaction management.
"""

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import MedicalRecord, Patient, Visit


# =============================================================================
# Custom Exceptions
# =============================================================================

class PatientServiceError(Exception):
    """Base exception for patient service errors."""
    pass


class PatientNotFoundError(PatientServiceError):
    """Raised when a patient is not found."""
    def __init__(self, patient_id: UUID | str, message: str | None = None):
        self.patient_id = patient_id
        super().__init__(message or f"Patient with ID {patient_id} not found")


class PatientValidationError(PatientServiceError):
    """Raised when patient data validation fails."""
    def __init__(self, field: str, message: str):
        self.field = field
        super().__init__(f"Validation error for field '{field}': {message}")


class VisitServiceError(Exception):
    """Base exception for visit service errors."""
    pass


class VisitNotFoundError(VisitServiceError):
    """Raised when a visit is not found."""
    def __init__(self, visit_id: UUID | str, message: str | None = None):
        self.visit_id = visit_id
        super().__init__(message or f"Visit with ID {visit_id} not found")


class VisitConflictError(VisitServiceError):
    """Raised when there's a scheduling conflict."""
    def __init__(self, message: str, conflicting_visit_id: UUID | None = None):
        self.conflicting_visit_id = conflicting_visit_id
        super().__init__(message)


class VisitStateError(VisitServiceError):
    """Raised when a visit is in an invalid state for the requested operation."""
    def __init__(self, visit_id: UUID, current_state: str, required_state: str):
        self.visit_id = visit_id
        self.current_state = current_state
        self.required_state = required_state
        super().__init__(
            f"Visit {visit_id} is in state '{current_state}', "
            f"but '{required_state}' is required"
        )


class MedicalRecordServiceError(Exception):
    """Base exception for medical record service errors."""
    pass


class MedicalRecordNotFoundError(MedicalRecordServiceError):
    """Raised when a medical record is not found."""
    def __init__(self, record_id: UUID | str, message: str | None = None):
        self.record_id = record_id
        super().__init__(message or f"Medical record with ID {record_id} not found")


class PrescriptionError(MedicalRecordServiceError):
    """Raised when prescription operations fail."""
    pass


# =============================================================================
# Data Transfer Objects (DTOs)
# =============================================================================

@dataclass(frozen=True)
class PatientDTO:
    """Data transfer object for Patient."""
    id: UUID
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    email: str
    address_line1: str
    address_line2: str
    city: str
    state: str
    postal_code: str
    country: str
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str
    insurance_provider: str
    insurance_policy_number: str
    insurance_group_number: str
    primary_care_physician: str
    allergies: list[str]
    chronic_conditions: list[str]
    current_medications: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    age: int = field(init=False)

    def __post_init__(self):
        today = date.today()
        dob = self.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        object.__setattr__(self, 'age', age)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


@dataclass(frozen=True)
class VisitDTO:
    """Data transfer object for Visit."""
    id: UUID
    patient_id: UUID
    patient_name: str
    visit_type: str
    status: str
    scheduled_at: datetime
    checked_in_at: datetime | None
    completed_at: datetime | None
    chief_complaint: str
    notes: str
    provider_id: UUID | None
    provider_name: str | None
    duration_minutes: int | None
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True)
class MedicalRecordDTO:
    """Data transfer object for MedicalRecord."""
    id: UUID
    visit_id: UUID
    patient_id: UUID
    diagnosis_codes: list[str]
    diagnosis_descriptions: list[str]
    treatment_plan: str
    follow_up_instructions: str
    follow_up_date: date | None
    prescriptions: list[dict[str, Any]]
    vitals: dict[str, Any]
    provider_notes: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True)
class PrescriptionDTO:
    """Data transfer object for Prescription."""
    id: UUID
    medical_record_id: UUID
    medication_name: str
    dosage: str
    frequency: str
    route: str
    quantity: int
    refills: int
    instructions: str
    prescribed_at: datetime
    prescribed_by: str
    is_active: bool


@dataclass(frozen=True)
class VitalsDTO:
    """Data transfer object for Vitals."""
    id: UUID
    medical_record_id: UUID
    temperature_celsius: Decimal | None
    heart_rate: int | None
    blood_pressure_systolic: int | None
    blood_pressure_diastolic: int | None
    respiratory_rate: int | None
    oxygen_saturation: Decimal | None
    weight_kg: Decimal | None
    height_cm: Decimal | None
    bmi: Decimal | None
    recorded_at: datetime
    recorded_by: str


# =============================================================================
# Service Classes
# =============================================================================

class PatientService:
    """Service class for patient management operations."""

    # Valid gender choices
    VALID_GENDERS = {'M', 'F', 'O', 'U'}  # Male, Female, Other, Unknown

    # Valid visit types
    VALID_VISIT_TYPES = {
        'consultation', 'follow_up', 'emergency', 'routine_checkup',
        'procedure', 'lab_work', 'imaging', 'vaccination', 'therapy', 'other'
    }

    # Valid visit statuses
    VALID_VISIT_STATUSES = {
        'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'
    }

    def __init__(self):
        self._patient_cache: dict[UUID, Patient] = {}

    # -------------------------------------------------------------------------
    # Patient CRUD Operations
    # -------------------------------------------------------------------------

    @transaction.atomic
    def register_patient(
        self,
        mrn: str,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        gender: str,
        phone: str,
        email: str,
        address_line1: str,
        city: str,
        state: str,
        postal_code: str,
        country: str = "USA",
        address_line2: str = "",
        emergency_contact_name: str = "",
        emergency_contact_phone: str = "",
        emergency_contact_relationship: str = "",
        insurance_provider: str = "",
        insurance_policy_number: str = "",
        insurance_group_number: str = "",
        primary_care_physician: str = "",
        allergies: list[str] | None = None,
        chronic_conditions: list[str] | None = None,
        current_medications: list[str] | None = None,
    ) -> PatientDTO:
        """
        Register a new patient.

        Args:
            mrn: Medical Record Number (unique)
            first_name: Patient's first name
            last_name: Patient's last name
            date_of_birth: Patient's date of birth
            gender: Gender (M, F, O, U)
            phone: Phone number
            email: Email address
            address_line1: Street address
            city: City
            state: State
            postal_code: ZIP/Postal code
            country: Country (default: USA)
            address_line2: Apartment/Suite (optional)
            emergency_contact_name: Emergency contact name
            emergency_contact_phone: Emergency contact phone
            emergency_contact_relationship: Relationship to emergency contact
            insurance_provider: Insurance provider name
            insurance_policy_number: Insurance policy number
            insurance_group_number: Insurance group number
            primary_care_physician: Primary care physician name
            allergies: List of allergies
            chronic_conditions: List of chronic conditions
            current_medications: List of current medications

        Returns:
            PatientDTO: The created patient

        Raises:
            PatientValidationError: If validation fails
            PatientServiceError: If MRN already exists
        """
        # Validate inputs
        self._validate_patient_data(
            mrn=mrn,
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            gender=gender,
            phone=phone,
            email=email,
        )

        # Check for duplicate MRN
        if Patient.objects.filter(mrn=mrn).exists():
            raise PatientServiceError(f"Patient with MRN '{mrn}' already exists")

        # Create patient
        patient = Patient.objects.create(
            mrn=mrn,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            date_of_birth=date_of_birth,
            gender=gender.upper(),
            phone=phone.strip(),
            email=email.strip().lower(),
            address_line1=address_line1.strip(),
            address_line2=address_line2.strip() if address_line2 else "",
            city=city.strip(),
            state=state.strip().upper(),
            postal_code=postal_code.strip(),
            country=country.strip().upper(),
            emergency_contact_name=emergency_contact_name.strip(),
            emergency_contact_phone=emergency_contact_phone.strip(),
            emergency_contact_relationship=emergency_contact_relationship.strip(),
            insurance_provider=insurance_provider.strip(),
            insurance_policy_number=insurance_policy_number.strip(),
            insurance_group_number=insurance_group_number.strip(),
            primary_care_physician=primary_care_physician.strip(),
            allergies=allergies or [],
            chronic_conditions=chronic_conditions or [],
            current_medications=current_medications or [],
            is_active=True,
        )

        return self._patient_to_dto(patient)

    def get_patient(self, patient_id: UUID) -> PatientDTO:
        """
        Retrieve a patient by ID.

        Args:
            patient_id: Patient UUID

        Returns:
            PatientDTO: The patient data

        Raises:
            PatientNotFoundError: If patient not found
        """
        try:
            patient = Patient.objects.select_related().get(id=patient_id, is_active=True)
        except Patient.DoesNotExist:
            raise PatientNotFoundError(patient_id)

        return self._patient_to_dto(patient)

    def get_patient_by_mrn(self, mrn: str) -> PatientDTO:
        """
        Retrieve a patient by MRN.

        Args:
            mrn: Medical Record Number

        Returns:
            PatientDTO: The patient data

        Raises:
            PatientNotFoundError: If patient not found
        """
        try:
            patient = Patient.objects.select_related().get(mrn=mrn, is_active=True)
        except Patient.DoesNotExist:
            raise PatientNotFoundError(mrn)

        return self._patient_to_dto(patient)

    @transaction.atomic
    def update_patient(
        self,
        patient_id: UUID,
        first_name: str | None = None,
        last_name: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        address_line1: str | None = None,
        address_line2: str | None = None,
        city: str | None = None,
        state: str | None = None,
        postal_code: str | None = None,
        country: str | None = None,
        emergency_contact_name: str | None = None,
        emergency_contact_phone: str | None = None,
        emergency_contact_relationship: str | None = None,
        insurance_provider: str | None = None,
        insurance_policy_number: str | None = None,
        insurance_group_number: str | None = None,
        primary_care_physician: str | None = None,
        allergies: list[str] | None = None,
        chronic_conditions: list[str] | None = None,
        current_medications: list[str] | None = None,
        is_active: bool | None = None,
    ) -> PatientDTO:
        """
        Update patient demographics and information.

        Args:
            patient_id: Patient UUID
            first_name: New first name
            last_name: New last name
            phone: New phone number
            email: New email
            address_line1: New address line 1
            address_line2: New address line 2
            city: New city
            state: New state
            postal_code: New postal code
            country: New country
            emergency_contact_name: New emergency contact name
            emergency_contact_phone: New emergency contact phone
            emergency_contact_relationship: New emergency contact relationship
            insurance_provider: New insurance provider
            insurance_policy_number: New insurance policy number
            insurance_group_number: New insurance group number
            primary_care_physician: New primary care physician
            allergies: New allergies list
            chronic_conditions: New chronic conditions list
            current_medications: New current medications list
            is_active: New active status

        Returns:
            PatientDTO: Updated patient data

        Raises:
            PatientNotFoundError: If patient not found
            PatientValidationError: If validation fails
        """
        try:
            patient = Patient.objects.select_for_update().get(id=patient_id)
        except Patient.DoesNotExist:
            raise PatientNotFoundError(patient_id)

        # Validate email if provided
        if email is not None:
            email = email.strip().lower()
            if email and Patient.objects.exclude(id=patient_id).filter(email=email).exists():
                raise PatientValidationError("email", "Email already in use by another patient")

        # Update fields
        update_fields = []

        if first_name is not None:
            patient.first_name = first_name.strip()
            update_fields.append('first_name')
        if last_name is not None:
            patient.last_name = last_name.strip()
            update_fields.append('last_name')
        if phone is not None:
            patient.phone = phone.strip()
            update_fields.append('phone')
        if email is not None:
            patient.email = email
            update_fields.append('email')
        if address_line1 is not None:
            patient.address_line1 = address_line1.strip()
            update_fields.append('address_line1')
        if address_line2 is not None:
            patient.address_line2 = address_line2.strip()
            update_fields.append('address_line2')
        if city is not None:
            patient.city = city.strip()
            update_fields.append('city')
        if state is not None:
            patient.state = state.strip().upper()
            update_fields.append('state')
        if postal_code is not None:
            patient.postal_code = postal_code.strip()
            update_fields.append('postal_code')
        if country is not None:
            patient.country = country.strip().upper()
            update_fields.append('country')
        if emergency_contact_name is not None:
            patient.emergency_contact_name = emergency_contact_name.strip()
            update_fields.append('emergency_contact_name')
        if emergency_contact_phone is not None:
            patient.emergency_contact_phone = emergency_contact_phone.strip()
            update_fields.append('emergency_contact_phone')
        if emergency_contact_relationship is not None:
            patient.emergency_contact_relationship = emergency_contact_relationship.strip()
            update_fields.append('emergency_contact_relationship')
        if insurance_provider is not None:
            patient.insurance_provider = insurance_provider.strip()
            update_fields.append('insurance_provider')
        if insurance_policy_number is not None:
            patient.insurance_policy_number = insurance_policy_number.strip()
            update_fields.append('insurance_policy_number')
        if insurance_group_number is not None:
            patient.insurance_group_number = insurance_group_number.strip()
            update_fields.append('insurance_group_number')
        if primary_care_physician is not None:
            patient.primary_care_physician = primary_care_physician.strip()
            update_fields.append('primary_care_physician')
        if allergies is not None:
            patient.allergies = allergies
            update_fields.append('allergies')
        if chronic_conditions is not None:
            patient.chronic_conditions = chronic_conditions
            update_fields.append('chronic_conditions')
        if current_medications is not None:
            patient.current_medications = current_medications
            update_fields.append('current_medications')
        if is_active is not None:
            patient.is_active = is_active
            update_fields.append('is_active')

        if update_fields: