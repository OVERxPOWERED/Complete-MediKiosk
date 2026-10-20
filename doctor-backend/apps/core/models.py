```python
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """Abstract base model with UUID primary key and audit timestamps."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class Patient(TimeStampedModel):
    """Patient model representing a person receiving medical care."""

    class Gender(models.TextChoices):
        MALE = 'M', _('Male')
        FEMALE = 'F', _('Female')
        OTHER = 'O', _('Other')
        PREFER_NOT_TO_SAY = 'P', _('Prefer not to say')

    name = models.CharField(_('full name'), max_length=255)
    date_of_birth = models.DateField(_('date of birth'))
    gender = models.CharField(
        _('gender'),
        max_length=1,
        choices=Gender.choices,
        default=Gender.PREFER_NOT_TO_SAY
    )
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    email = models.EmailField(_('email address'), blank=True)
    address = models.TextField(_('address'), blank=True)
    medical_history = models.TextField(_('medical history'), blank=True)

    class Meta:
        db_table = 'patients'
        verbose_name = _('patient')
        verbose_name_plural = _('patients')
        indexes = [
            models.Index(fields=['name'], name='patient_name_idx'),
            models.Index(fields=['email'], name='patient_email_idx'),
            models.Index(fields=['phone'], name='patient_phone_idx'),
        ]

    def __str__(self) -> str:
        return self.name

    def clean(self) -> None:
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError({'date_of_birth': _('Date of birth cannot be in the future.')})

    @property
    def age(self) -> int:
        """Calculate patient's current age."""
        today = timezone.now().date()
        return (
            today.year - self.date_of_birth.year
            - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        )


class Doctor(TimeStampedModel):
    """Doctor model representing a medical practitioner."""

    name = models.CharField(_('full name'), max_length=255)
    specialization = models.CharField(_('specialization'), max_length=100)
    license_number = models.CharField(_('license number'), max_length=50, unique=True)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    email = models.EmailField(_('email address'), blank=True)
    is_active = models.BooleanField(_('active'), default=True)

    class Meta:
        db_table = 'doctors'
        verbose_name = _('doctor')
        verbose_name_plural = _('doctors')
        indexes = [
            models.Index(fields=['name'], name='doctor_name_idx'),
            models.Index(fields=['specialization'], name='doctor_spec_idx'),
            models.Index(fields=['is_active'], name='doctor_active_idx'),
            models.Index(fields=['license_number'], name='doctor_license_idx'),
        ]

    def __str__(self) -> str:
        return f"Dr. {self.name} ({self.specialization})"

    def clean(self) -> None:
        super().clean()
        if self.license_number:
            self.license_number = self.license_number.strip().upper()


class Appointment(TimeStampedModel):
    """Appointment model representing a scheduled visit between patient and doctor."""

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        CHECKED_IN = 'CHECKED_IN', _('Checked In')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        NO_SHOW = 'NO_SHOW', _('No Show')

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='appointments',
        verbose_name=_('patient')
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.PROTECT,
        related_name='appointments',
        verbose_name=_('doctor')
    )
    scheduled_at = models.DateTimeField(_('scheduled at'), db_index=True)
    duration_minutes = models.PositiveIntegerField(_('duration (minutes)'), default=30)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True
    )
    reason = models.TextField(_('reason for visit'), blank=True)
    notes = models.TextField(_('notes'), blank=True)

    class Meta:
        db_table = 'appointments'
        verbose_name = _('appointment')
        verbose_name_plural = _('appointments')
        indexes = [
            models.Index(fields=['patient', 'scheduled_at'], name='appt_patient_time_idx'),
            models.Index(fields=['doctor', 'scheduled_at'], name='appt_doctor_time_idx'),
            models.Index(fields=['doctor', 'status', 'scheduled_at'], name='appt_doc_status_time_idx'),
            models.Index(fields=['status', 'scheduled_at'], name='appt_status_time_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(duration_minutes__gt=0),
                name='appointment_positive_duration'
            ),
            models.CheckConstraint(
                check=models.Q(scheduled_at__gte=timezone.now()),
                name='appointment_future_scheduled'
            ),
        ]

    def __str__(self) -> str:
        return f"{self.patient.name} - Dr. {self.doctor.name} at {self.scheduled_at:%Y-%m-%d %H:%M}"

    def clean(self) -> None:
        super().clean()
        self._validate_no_overlap()
        self._validate_doctor_active()
        self._validate_duration()

    def _validate_no_overlap(self) -> None:
        """Ensure no overlapping appointments for the same doctor."""
        if not self.doctor_id or not self.scheduled_at or not self.duration_minutes:
            return

        end_time = self.scheduled_at + timezone.timedelta(minutes=self.duration_minutes)

        overlapping = Appointment.objects.filter(
            doctor=self.doctor,
            scheduled_at__lt=end_time,
            status__in=[self.Status.SCHEDULED, self.Status.CHECKED_IN, self.Status.IN_PROGRESS]
        ).exclude(pk=self.pk)

        # Check if any existing appointment overlaps with this one
        for appt in overlapping