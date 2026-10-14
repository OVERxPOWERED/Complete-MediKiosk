```python
import uuid
from django.db import models
from django.core.validators import RegexValidator, ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class BaseModel(models.Model):
    """
    Abstract base model providing audit fields and soft-delete pattern
    for all domain models.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    deleted_at = models.DateTimeField(_('Deleted At'), null=True, blank=True, db_index=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self):
        """Mark the record as deleted without removing from database."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at', 'updated_at'])

    def restore(self):
        """Restore a soft-deleted record."""
        self.deleted_at = None
        self.save(update_fields=['deleted_at', 'updated_at'])

    @property
    def is_deleted(self):
        """Check if record is soft-deleted."""
        return self.deleted_at is not None


class PatientManager(models.Manager):
    """Custom manager for Patient model with active queryset filter."""

    def active(self):
        """Return only non-deleted, active patients."""
        return self.filter(is_active=True, deleted_at__isnull=True)

    def with_deleted(self):
        """Return all patients including soft-deleted ones."""
        return self.all()

    def deleted_only(self):
        """Return only soft-deleted patients."""
        return self.filter(deleted_at__isnull=False)


class Patient(BaseModel):
    """
    Core Patient domain model with medical record fields, audit timestamps,
    and soft-delete pattern matching backend contracts.
    """

    GENDER_CHOICES = [
        ('M', _('Male')),
        ('F', _('Female')),
        ('O', _('Other')),
        ('U', _('Unknown')),
    ]

    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('UNKNOWN', 'Unknown'),
    ]

    # Medical Record Number with validator
    mrn_validator = RegexValidator(
        regex=r'^MRN-\d{8}-\d{4}$',
        message=_('MRN must be in format: MRN-YYYYMMDD-XXXX')
    )
    mrn = models.CharField(
        _('Medical Record Number'),
        max_length=20,
        unique=True,
        validators=[mrn_validator],
        db_index=True,
        help_text=_('Format: MRN-YYYYMMDD-XXXX')
    )

    # Personal Information
    first_name = models.CharField(_('First Name'), max_length=100)
    last_name = models.CharField(_('Last Name'), max_length=100)
    date_of_birth = models.DateField(_('Date of Birth'))
    gender = models.CharField(
        _('Gender'),
        max_length=1,
        choices=GENDER_CHOICES,
        default='U'
    )

    # Contact Information
    phone = models.CharField(
        _('Phone Number'),
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_('Phone number must be entered in format: +999999999. Up to 15 digits allowed.')
            )
        ]
    )
    email = models.EmailField(_('Email Address'), blank=True, max_length=254)
    address = models.TextField(_('Address'), blank=True)

    # Emergency Contact (JSON for flexibility)
    emergency_contact = models.JSONField(
        _('Emergency Contact'),
        default=dict,
        blank=True,
        help_text=_('JSON object with name, relationship, phone, email')
    )

    # Insurance Information
    insurance_provider = models.CharField(_('Insurance Provider'), max_length=200, blank=True)
    insurance_policy_number = models.CharField(_('Insurance Policy Number'), max_length=100, blank=True)
    insurance_group_number = models.CharField(_('Insurance Group Number'), max_length=100, blank=True)

    # Medical Information
    blood_type = models.CharField(
        _('Blood Type'),
        max_length=10,
        choices=BLOOD_TYPE_CHOICES,
        default='UNKNOWN',
        blank=True
    )
    allergies = models.JSONField(
        _('Allergies'),
        default=list,
        blank=True,
        help_text=_('List of allergy objects: [{"allergen": "penicillin", "reaction": "rash", "severity": "moderate"}]')
    )
    chronic_conditions = models.JSONField(
        _('Chronic Conditions'),
        default=list,
        blank=True,
        help_text=_('List of condition objects: [{"condition": "diabetes", "diagnosed_date": "2020-01-15", "status": "active"}]')
    )

    # Primary Physician
    primary_physician = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_patients',
        verbose_name=_('Primary Physician')
    )

    # Status
    is_active = models.BooleanField(_('Active'), default=True)

    # Custom Manager
    objects = PatientManager()

    class Meta:
        db_table = 'patients_patient'
        verbose_name = _('Patient')
        verbose_name_plural = _('Patients')
        indexes = [
            models.Index(fields=['last_name', 'first_name'], name='patient_name_idx'),
            models.Index(fields=['date_of_birth'], name='patient_dob_idx'),
            models.Index(fields=['is_active', 'deleted_at'], name='patient_active_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(date_of_birth__lte=timezone.now().date()),
                name='patient_dob_not_future'
            ),
        ]

    def __str__(self):
        return f"{self.mrn} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    def clean(self):
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError({'date_of_birth': _('Date of birth cannot be in the future.')})

    def get_active_appointments(self):
        """Return upcoming appointments for this patient."""
        return self.appointments.filter(
            status__in=['scheduled', 'confirmed'],
            scheduled_time__gte=timezone.now(),
            deleted_at__isnull=True
        ).order_by('scheduled_time')

    def get_latest_medical_record(self):
        """Return the most recent medical record."""
        return self.medical_records.filter(deleted_at__isnull=True).first()

    def get_active_prescriptions(self):
        """Return currently active prescriptions."""
        return self.prescriptions.filter