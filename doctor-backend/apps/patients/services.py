```python
from django.db import transaction
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils import timezone
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta

from apps.patients.models import (
    Patient,
    Appointment,
    MedicalRecord,
    Prescription,
    MedicalRecordAttachment,
)
from apps.patients.validators import (
    validate_patient_data,
    validate_patient_update_data,
    validate_search_filters,
    validate_appointment_data,
    validate_appointment_update_data,
    validate_medical_record_data,
    validate_prescription_data,
    validate_prescription_renewal_data,
)
from apps.patients.selectors import (
    patient_get_by_id,
    patient_list,
    patient_search,
    patient_get_history,
    appointment_get_by_id,
    appointment_list,
    appointment_get_upcoming,
    appointment_check_conflicts,
    medical_record_get_by_id,
    medical_record_list,
    medical_record_get_patient_history,
    prescription_get_by_id,
    prescription_list,
    prescription_get_active,
    prescription_check_interactions,
)
from apps.core.exceptions import (
    ValidationError,
    NotFoundError,
    BusinessLogicError,
)


class AppointmentService:
    """
    Service layer for appointment management operations.
    Encapsulates business logic for scheduling, rescheduling, and managing appointments.
    """

    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    MIN_ADVANCE_BOOKING_MINUTES = 30
    MAX_ADVANCE_BOOKING_DAYS = 365

    @transaction.atomic
    def schedule_appointment(self, validated_data: Dict[str, Any]) -> Appointment:
        """
        Schedule a new appointment with validated data.

        Args:
            validated_data: Dictionary containing appointment data (already validated)

        Returns:
            Created Appointment instance

        Raises:
            ValidationError: If data validation fails
            BusinessLogicError: If business rules are violated (e.g., time conflict, past date)
        """
        validate_appointment_data(validated_data)

        patient_id = validated_data["patient_id"]
        provider_id = validated_data["provider_id"]
        scheduled_at = validated_data["scheduled_at"]
        duration_minutes = validated_data.get("duration_minutes", 30)

        patient = patient_get_by_id(patient_id)
        if not patient:
            raise NotFoundError(f"Patient with ID {patient_id} not found.", code="PATIENT_NOT_FOUND")

        now = timezone.now()
        if scheduled_at < now + timedelta(minutes=self.MIN_ADVANCE_BOOKING_MINUTES):
            raise BusinessLogicError(
                f"Appointments must be scheduled at least {self.MIN_ADVANCE_BOOKING_MINUTES} minutes in advance.",
                code="INSUFFICIENT_ADVANCE_NOTICE",
            )

        if scheduled_at > now + timedelta(days=self.MAX_ADVANCE_BOOKING_DAYS):
            raise BusinessLogicError(
                f"Appointments cannot be scheduled more than {self.MAX_ADVANCE_BOOKING_DAYS} days in advance.",
                code="EXCEEDS_MAX_ADVANCE_BOOKING",
            )

        if appointment_check_conflicts(provider_id, scheduled_at, duration_minutes):
            raise BusinessLogicError(
                "Provider has a conflicting appointment at the requested time.",
                code="PROVIDER_CONFLICT",
            )

        if appointment_check_conflicts(patient_id, scheduled_at, duration_minutes, is_patient=True):
            raise BusinessLogicError(
                "Patient has a conflicting appointment at the requested time.",
                code="PATIENT_CONFLICT",
            )

        appointment = Appointment.objects.create(
            patient=patient,
            provider_id=provider_id,
            scheduled_at=scheduled_at,
            duration_minutes=duration_minutes,
            status=Appointment.Status.SCHEDULED,
            appointment_type=validated_data.get("appointment_type", Appointment.Type.CONSULTATION),
            notes=validated_data.get("notes", ""),
            reason=validated_data.get("reason", ""),
        )
        return appointment

    def get_appointment(self, appointment_id: int) -> Appointment:
        """
        Retrieve an appointment by ID.

        Args:
            appointment_id: Primary key of the appointment

        Returns:
            Appointment instance

        Raises:
            NotFoundError: If appointment not found
        """
        appointment = appointment_get_by_id(appointment_id)
        if not appointment:
            raise NotFoundError(f"Appointment with ID {appointment_id} not found.", code="APPOINTMENT_NOT_FOUND")
        return appointment

    @transaction.atomic
    def reschedule_appointment(self, appointment_id: int, data: Dict[str, Any]) -> Appointment:
        """
        Reschedule an existing appointment.

        Args:
            appointment_id: Primary key of the appointment to reschedule
            data: Dictionary containing new scheduled_at and optionally duration_minutes

        Returns:
            Updated Appointment instance

        Raises:
            NotFoundError: If appointment not found
            ValidationError: If validation fails
            BusinessLogicError: If business rules are violated
        """
        appointment = self.get_appointment(appointment_id)

        if appointment.status in [Appointment.Status.COMPLETED, Appointment.Status.CANCELLED, Appointment.Status.NO_SHOW]:
            raise BusinessLogicError(
                f"Cannot reschedule appointment with status '{appointment.status}'.",
                code="INVALID_STATUS_FOR_RESCHEDULE",
            )

        validate_appointment_update_data(data, appointment)

        new_scheduled_at = data.get("scheduled_at", appointment.scheduled_at)
        new_duration = data.get("duration_minutes", appointment.duration_minutes)

        now = timezone.now()
        if new_scheduled_at < now + timedelta(minutes=self.MIN_ADVANCE_BOOKING_MINUTES):
            raise BusinessLogicError(
                f"Appointments must be scheduled at least {self.MIN_ADVANCE_BOOKING_MINUTES} minutes in advance.",
                code="INSUFFICIENT_ADVANCE_NOTICE",
            )

        if appointment_check_conflicts(
            appointment.provider_id,
            new_scheduled_at,
            new_duration,
            exclude_appointment_id=appointment_id,
        ):
            raise BusinessLogicError(
                "Provider has a conflicting appointment at the requested time.",
                code="PROVIDER_CONFLICT",
            )

        if appointment_check_conflicts(
            appointment.patient_id,
            new_scheduled_at,
            new_duration,
            exclude_appointment_id=appointment_id,
            is_patient=True,
        ):
            raise BusinessLogicError(
                "Patient has a conflicting appointment at the requested time.",
                code="PATIENT_CONFLICT",
            )

        appointment.scheduled_at = new_scheduled_at
        appointment.duration_minutes = new_duration
        if "notes" in data:
            appointment.notes = data["notes"]
        if "reason" in data:
            appointment.reason = data["reason"]
        appointment.status = Appointment.Status.RESCHEDULED
        appointment.save(update_fields=["scheduled_at", "duration_minutes", "notes", "reason", "status", "updated_at"])

        return appointment

    @transaction.atomic
    def cancel_appointment(self, appointment