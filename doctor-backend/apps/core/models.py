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


class PatientManager(models.Manager):
    """Custom manager for Patient with optimized querysets."""

    def with_appointments(self):
        return self.prefetch_related(
            models.Prefetch('appointments', queryset=Appointment.objects.select_related('doctor'))
        )

    def with_medical_records(self):
        return self.prefetch_related(
            models.Prefetch('medical_records', queryset=MedicalRecord.objects.select_related('doctor', 'appointment'))
        )

    def active_patients(self):
        return self.filter(appointments__status__in=[Appointment.Status.SCHEDULED, Appointment.Status.CHECKED_IN, Appointment.Status.IN_PROGRESS]).distinct()


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
    phone = models.CharField(_('phone number'), max_length=20, blank=True, db_index=True)
    email = models.EmailField(_('email address'), blank=True, db_index=True)
    address = models.TextField(_('address'), blank=True)
    insurance_id = models.CharField(_('insurance ID'), max_length=100, blank=True)
    medical_history = models.TextField(_('medical history'), blank=True)

    objects = PatientManager()

    class Meta:
        db_table = 'patients'
        verbose_name = _('patient')
        verbose_name_plural = _('patients')
        indexes = [
            models.Index(fields=['name'], name='patient_name_idx'),
            models.Index(fields=['email'], name='patient_email_idx'),
            models.Index(fields=['phone'], name='patient_phone_idx'),
            models.Index(fields=['insurance_id'], name='patient_insurance_idx'),
            models.Index(fields=['date_of_birth'], name='patient_dob_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(date_of_birth__lte=timezone.now().date()),
                name='patient_dob_not_future'
            ),
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


class DoctorManager(models.Manager):
    """Custom manager for Doctor with optimized querysets."""

    def active(self):
        return self.filter(is_active=True)

    def by_specialization(self, specialization: str):
        return self.active().filter(specialization__iexact=specialization)

    def with_appointments(self):
        return self.prefetch_related(
            models.Prefetch('appointments', queryset=Appointment.objects.select_related('patient'))
        )

    def available_at(self, scheduled_at: timezone.datetime):
        """Get doctors available at a specific time (no conflicting appointments)."""
        return self.active().exclude(
            appointments__scheduled_at__range=(
                scheduled_at - timezone.timedelta(minutes=30),
                scheduled_at + timezone.timedelta(minutes=30)
            ),
            appointments__status__in=[Appointment.Status.SCHEDULED, Appointment.Status.CHECKED_IN, Appointment.Status.IN_PROGRESS]
        )


class Doctor(TimeStampedModel):
    """Doctor model representing a medical practitioner."""

    name = models.CharField(_('full name'), max_length=255)
    specialization = models.CharField(_('specialization'), max_length=100, db_index=True)
    license_number = models.CharField(_('license number'), max_length=50, unique=True, db_index=True)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    email = models.EmailField(_('email address'), blank=True)
    department = models.CharField(_('department'), max_length=100, blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)

    objects = DoctorManager()

    class Meta:
        db_table = 'doctors'
        verbose_name = _('doctor')
        verbose_name_plural = _('doctors')
        indexes = [
            models.Index(fields=['name'], name='doctor_name_idx'),
            models.Index(fields=['specialization'], name='doctor_spec_idx'),
            models.Index(fields=['is_active'], name='doctor_active_idx'),
            models.Index(fields=['license_number'], name='doctor_license_idx'),
            models.Index(fields=['department'], name='doctor_dept_idx'),
            models.Index(fields=['is_active', 'specialization'], name='doctor_active_spec_idx'),
        ]

    def __str__(self) -> str:
        return f"Dr. {self.name} ({self.specialization})"

    def clean(self) -> None:
        super().clean()
        if self.license_number:
            self.license_number = self.license_number.strip().upper()


class AppointmentManager(models.Manager):
    """Custom manager for Appointment with optimized querysets."""

    def upcoming(self):
        return self.filter(
            scheduled_at__gte=timezone.now(),
            status__in=[self.model.Status.SCHEDULED, self.model.Status.CHECKED_IN]
        ).select_related('patient', 'doctor')

    def past(self):
        return self.filter(
            scheduled_at__lt=timezone.now()
        ).select_related('patient', 'doctor')

    def by_status(self, status: str):
        return self.filter(status=status).select_related('patient', 'doctor')

    def by_doctor(self, doctor_id: uuid.UUID):
        return self.filter(doctor_id=doctor_id).select_related('