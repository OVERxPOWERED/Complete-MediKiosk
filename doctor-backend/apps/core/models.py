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
            models.Prefetch('appointments', queryset='core.Appointment'.objects.select_related('doctor'))
        )

    def with_medical_records(self):
        return self.prefetch_related(
            models.Prefetch('medical_records', queryset='core.MedicalRecord'.objects.select_related('doctor', 'appointment'))
        )

    def active_patients(self):
        return self.filter(
            appointments__status__in=[
                'core.Appointment'.Status.SCHEDULED,
                'core.Appointment'.Status.CHECKED_IN,
                'core.Appointment'.Status.IN_PROGRESS
            ]
        ).distinct()


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
            models.Prefetch('appointments', queryset='core.Appointment'.objects.select_related('patient'))
        )


class Doctor(TimeStampedModel):
    """Doctor model representing a medical practitioner."""

    name = models.CharField(_('full name'), max_length=255)
    specialization = models.CharField(_('specialization'), max_length=100, db_index=True)
    license_number = models.CharField(_('license number'), max_length=50, unique=True, db_index=True)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    email = models.EmailField(_('email address'), blank=True, db_index=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    bio = models.TextField(_('biography'), blank=True)
    years_of_experience = models.PositiveIntegerField(_('years of experience'), default=0)

    objects = DoctorManager()

    class Meta:
        db_table = 'doctors'
        verbose_name = _('doctor')
        verbose_name_plural = _('doctors')
        indexes = [
            models.Index(fields=['name'], name='doctor_name_idx'),
            models.Index(fields=['specialization', 'is_active'], name='doctor_spec_active_idx'),
            models.Index(fields=['license_number'], name='doctor_license_idx'),
        ]
        ordering = ['name']

    def __str__(self) -> str:
        return f"Dr. {self.name} ({self.specialization})"

    def clean(self) -> None:
        super().clean()
        if self.license_number:
            self.license_number = self.license_number.strip().upper()


class Appointment(TimeStampedModel):
    """Appointment model representing a scheduled medical visit."""

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        CHECKED_IN = 'CHECKED_IN', _('Checked In')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        NO_SHOW = 'NO_SHOW', _('No Show')

    patient = models.ForeignKey(
        'core.Patient',
        on_delete=models.PROTECT,
        related_name='appointments',
        verbose_name=_('patient')
    )
    doctor = models.ForeignKey(
        'core.Doctor',
        on_delete=models.PROTECT,
        related_name='appointments',
        verbose_name=_('doctor')
    )
    scheduled_at = models.DateTimeField(_('scheduled at'), db_index=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True
    )
    reason = models.TextField(_('reason for visit'), blank=True)
    notes = models.TextField(_('notes'), blank=True)
    duration_minutes = models.PositiveIntegerField(_('duration (minutes)'), default=30)
    checked_in_at = models.DateTimeField(_('checked in at'), null=True, blank=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)

    class Meta:
        db_table = 'appointments'
        verbose_name = _('appointment')
        verbose_name_plural = _('appointments')
        indexes = [
            models.Index(fields=['doctor', 'scheduled_at'], name='appt_doctor_scheduled_idx'),
            models.Index(fields=['patient', 'scheduled_at'], name='appt_patient_scheduled_idx'),
            models.Index(fields=['status', 'scheduled_at'], name='appt_status_scheduled_idx'),
            models.Index(fields=['scheduled_at'], name='appt_scheduled_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(scheduled_at__gte=timezone.now()),
                name='appt_scheduled_not_past'
            ),
            models.CheckConstraint(
                check=models.Q(duration_minutes__gt=0) & models.Q(duration_minutes__lte=480),
                name='appt_duration_valid'
            ),
        ]
        ordering = ['-scheduled_at']

    def __str__(self) -> str:
        return f"{self.patient.name} - Dr. {self.doctor.name} at {self.scheduled_at.strftime('%Y-%m-%d %H:%M')}"

    def clean(self) -> None:
        super().clean()
        if self.scheduled_at and self.scheduled_at < timezone.now():
            raise ValidationError({'scheduled_at': _('Appointment cannot be scheduled in the past.')})
        if self.duration_minutes and (self.duration_minutes < 5 or self.duration_minutes > 480):
            raise ValidationError({'duration_minutes': _('Duration must be between 5 and 480 minutes.')})

    def mark_checked_in(self) -> None:
        """Mark appointment as checked in."""
        self.status = self.Status.CHECKED_IN
        self.checked_in_at = timezone.now()
        self.save(update_fields=['status', 'checked_in_at', 'updated_at'])

    def mark_in_progress(self) -> None:
        """Mark appointment as in progress."""
        self.status = self.Status.IN_PROGRESS
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at', 'updated_at'])

    def mark_completed(self) -> None:
        """Mark appointment as completed."""
        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])

    def mark_cancelled(self) -> None:
        """Mark appointment as cancelled."""
        self.status = self.Status.CANCELLED
        self.save(update_fields=['status', 'updated_at'])

    def mark_no_show(self) -> None:
        """Mark appointment as no show."""
        self.status = self.Status.NO_SHOW
        self.save(update_fields=['status', 'updated_at'])


class MedicalRecord(TimeStampedModel):
    """Medical record model representing a clinical encounter documentation."""

    patient = models.ForeignKey(
        'core.Patient',
        on_delete=models.PROTECT,
        related_name='medical_records',
        verbose_name=_('patient')
    )
    doctor = models.ForeignKey(
        'core.Doctor',
        on_delete=models.PROTECT,
        related_name='medical_records',
        verbose_name=_('doctor')
    )
    appointment = models.OneToOneField(
        'core.Appointment',
        on_delete=models.PROTECT,
        related_name='medical_record',
        verbose_name=_('appointment'),
        null=True,
        blank=True
    )
    diagnosis = models.TextField(_('diagnosis'))
    prescription = models.TextField(_('prescription'), blank=True)
    vitals_json = models.JSONField(_('vitals'), default=dict, blank=True)
    follow_up_date = models.DateField(_('follow-up date'), null=True, blank=True)
    follow_up_notes = models.TextField(_('follow-up notes'), blank=True)

    class Meta:
        db_table = 'medical_records'
        verbose_name = _('medical record')
        verbose_name_plural = _('medical records')
        indexes = [
            models.Index(fields=['patient', '-created_at'], name='medrec_patient_created_idx'),
            models.Index(fields=['doctor', '-created_at'], name='medrec_doctor_created_idx'),
            models.Index(fields=['appointment'], name='medrec_appointment_idx'),
            models.Index(fields=['follow_up_date'], name='medrec_followup_idx'),
        ]
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Record for {self.patient.name} by Dr. {self.doctor.name} on {self.created_at.strftime('%Y-%m-%d')}"

    def clean(self) -> None:
        super().clean()
        if self.appointment and self.appointment.patient_id != self.patient_id:
            raise ValidationError({'appointment': _('Appointment must belong to the same patient.')})
        if self.appointment and self.appointment.doctor_id != self.doctor_id:
            raise ValidationError({'appointment': _('Appointment must belong to the same doctor.')})
        if self.follow_up_date and self.follow_up_date < timezone.now().date():
            raise ValidationError({'follow_up_date': _('Follow-up date cannot be in the past.')})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)