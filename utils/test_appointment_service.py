```python
import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from apps.appointments.services import AppointmentService
from apps.appointments.models import Appointment, AppointmentStatus
from apps.appointments.exceptions import (
    AppointmentNotFoundError,
    AppointmentConflictError,
    InvalidAppointmentStatusTransitionError,
    PastAppointmentError,
)
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.tests.factories import (
    AppointmentFactory,
    PatientFactory,
    DoctorFactory,
    UserFactory,
)


pytestmark = pytest.mark.django_db


class TestAppointmentServiceCRUD:
    """Test CRUD operations for AppointmentService."""

    def test_create_appointment_success(self):
        """Test successful appointment creation with valid data."""
        patient = PatientFactory()
        doctor = DoctorFactory()
        scheduled_at = timezone.now() + timedelta(days=1)
        
        appointment = AppointmentService.create_appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            scheduled_at=scheduled_at,
            duration_minutes=30,
            reason="Annual checkup",
            notes="Patient prefers morning appointments",
        )
        
        assert appointment.id is not None
        assert appointment.patient == patient
        assert appointment.doctor == doctor
        assert appointment.scheduled_at == scheduled_at
        assert appointment.duration_minutes == 30
        assert appointment.reason == "Annual checkup"
        assert appointment.notes == "Patient prefers morning appointments"
        assert appointment.status == AppointmentStatus.SCHEDULED
        assert appointment.created_at is not None
        assert appointment.updated_at is not None

    def test_create_appointment_with_minimal_data(self):
        """Test appointment creation with only required fields."""
        patient = PatientFactory()
        doctor = DoctorFactory()
        scheduled_at = timezone.now() + timedelta(hours=2)
        
        appointment = AppointmentService.create_appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            scheduled_at=scheduled_at,
        )
        
        assert appointment.id is not None
        assert appointment.duration_minutes == 30  # default
        assert appointment.reason == ""
        assert appointment.notes == ""
        assert appointment.status == AppointmentStatus.SCHEDULED

    def test_create_appointment_patient_not_found(self):
        """Test appointment creation with non-existent patient raises error."""
        doctor = DoctorFactory()
        scheduled_at = timezone.now() + timedelta(days=1)
        
        with pytest.raises(Patient.DoesNotExist):
            AppointmentService.create_appointment(
                patient_id=99999,
                doctor_id=doctor.id,
                scheduled_at=scheduled_at,
            )

    def test_create_appointment_doctor_not_found(self):
        """Test appointment creation with non-existent doctor raises error."""
        patient = PatientFactory()
        scheduled_at = timezone.now() + timedelta(days=1)
        
        with pytest.raises(Doctor.DoesNotExist):
            AppointmentService.create_appointment(
                patient_id=patient.id,
                doctor_id=99999,
                scheduled_at=scheduled_at,
            )

    def test_get_appointment_by_id_success(self):
        """Test retrieving appointment by ID."""
        appointment = AppointmentFactory()
        
        retrieved = AppointmentService.get_appointment_by_id(appointment.id)
        
        assert retrieved == appointment
        assert retrieved.id == appointment.id

    def test_get_appointment_by_id_not_found(self):
        """Test retrieving non-existent appointment raises error."""
        with pytest.raises(AppointmentNotFoundError):
            AppointmentService.get_appointment_by_id(99999)

    def test_get_appointment_by_id_soft_deleted(self):
        """Test retrieving soft-deleted appointment raises error."""
        appointment = AppointmentFactory()
        appointment.soft_delete()
        
        with pytest.raises(AppointmentNotFoundError):
            AppointmentService.get_appointment_by_id(appointment.id)

    def test_update_appointment_success(self):
        """Test successful appointment update."""
        appointment = AppointmentFactory(status=AppointmentStatus.SCHEDULED)
        new_scheduled_at = timezone.now() + timedelta(days=2)
        new_reason = "Follow-up consultation"
        new_notes = "Bring previous test results"
        
        updated = AppointmentService.update_appointment(
            appointment_id=appointment.id,
            scheduled_at=new_scheduled_at,
            duration_minutes=45,
            reason=new_reason,
            notes=new_notes,
        )
        
        assert updated.scheduled_at == new_scheduled_at
        assert updated.duration_minutes == 45
        assert updated.reason == new_reason
        assert updated.notes == new_notes
        assert updated.status == AppointmentStatus.SCHEDULED  # unchanged

    def test_update_appointment_partial(self):
        """Test partial appointment update."""
        appointment = AppointmentFactory(
            duration_minutes=30,
            reason="Initial visit",
            notes="Original notes",
        )
        
        updated = AppointmentService.update_appointment(
            appointment_id=appointment.id,
            reason="Updated reason",
        )
        
        assert updated.reason == "Updated reason"
        assert updated.duration_minutes == 30  # unchanged
        assert updated.notes == "Original notes"  # unchanged

    def test_update_appointment_not_found(self):
        """Test updating non-existent appointment raises error."""
        with pytest.raises(AppointmentNotFoundError):
            AppointmentService.update_appointment(
                appointment_id=99999,
                reason="New reason",
            )

    def test_update_appointment_past_appointment_error(self):
        """Test updating a past appointment raises error."""
        past_appointment = AppointmentFactory(
            scheduled_at=timezone.now() - timedelta(days=1),
            status=AppointmentStatus.COMPLETED,
        )
        
        with pytest.raises(PastAppointmentError):
            AppointmentService.update_appointment(
                appointment_id=past_appointment.id,
                reason="New reason",
            )

    def test_delete_appointment_success(self):
        """Test successful appointment deletion (soft delete)."""
        appointment = AppointmentFactory()
        
        result = AppointmentService.delete_appointment(appointment.id)
        
        assert result is True
        appointment.refresh_from_db()
        assert appointment.deleted_at is not None
        assert appointment.is_deleted is True

    def test_delete_appointment_not_found(self):
        """Test deleting non-existent appointment raises error."""
        with pytest.raises(AppointmentNotFoundError):
            AppointmentService.delete_appointment(99999)

    def test_soft_delete_appointment(self):
        """Test soft delete explicitly."""
        appointment = AppointmentFactory()
        
        AppointmentService.soft_delete_appointment(appointment.id)
        
        appointment.refresh_from_db()
        assert appointment.deleted_at is not None
        assert appointment.is_deleted is True

    def test_restore_appointment_success(self):
        """Test restoring a soft-deleted appointment."""
        appointment = AppointmentFactory()
        AppointmentService.soft_delete_appointment(appointment.id)
        
        restored = AppointmentService.restore_appointment(appointment.id)
        
        assert restored.deleted_at is None
        assert restored.is_deleted is False

    def test_restore_appointment_not_found(self):
        """Test