```python
import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """Abstract base model with created_at and updated_at fields."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class Patient(TimeStampedModel):
    """Patient model with demographics and insurance information."""
    
    class Gender(models.TextChoices):
        MALE = 'M', _('Male')
        FEMALE = 'F', _('Female')
        OTHER = 'O', _('Other')
        PREFER_NOT_TO_SAY = 'P', _('Prefer not to say')

    class BloodType(models.TextChoices):
        A_POS = 'A+', _('A+')
        A_NEG = 'A-', _('A-')
        B_POS = 'B+', _('B+')
        B_NEG = 'B-', _('B-')
        AB_POS = 'AB+', _('AB+')
        AB_NEG = 'AB-', _('AB-')
        O_POS = 'O+', _('O+')
        O_NEG = 'O-', _('O-')
        UNKNOWN = 'UNK', _('Unknown')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_profile',
        help_text=_('Link to the user account')
    )
    date_of_birth = models.DateField(help_text=_('Patient date of birth'))
    gender = models.CharField(
        max_length=1,
        choices=Gender.choices,
        help_text=_('Patient gender')
    )
    blood_type = models.CharField(
        max_length=3,
        choices=BloodType.choices,
        default=BloodType.UNKNOWN,
        help_text=_('Patient blood type')
    )
    phone_number = models.CharField(max_length=20, blank=True, help_text=_('Contact phone number'))
    emergency_contact_name = models.CharField(max_length=100, blank=True, help_text=_('Emergency contact name'))
    emergency_contact_phone = models.CharField(max_length=20, blank=True, help_text=_('Emergency contact phone'))
    address_line1 = models.CharField(max_length=255, blank=True, help_text=_('Address line 1'))
    address_line2 = models.CharField(max_length=255, blank=True, help_text=_('Address line 2'))
    city = models.CharField(max_length=100, blank=True, help_text=_('City'))
    state = models.CharField(max_length=100, blank=True, help_text=_('State/Province'))
    postal_code = models.CharField(max_length=20, blank=True, help_text=_('Postal/ZIP code'))
    country = models.CharField(max_length=100, default='USA', help_text=_('Country'))
    
    # Insurance Information
    insurance_provider = models.CharField(max_length=100, blank=True, help_text=_('Insurance provider name'))
    insurance_policy_number = models.CharField(max_length=50, blank=True, help_text=_('Insurance policy number'))
    insurance_group_number = models.CharField(max_length=50, blank=True, help_text=_('Insurance group number'))
    insurance_subscriber_name = models.CharField(max_length=100, blank=True, help_text=_('Insurance subscriber name'))
    insurance_subscriber_dob = models.DateField(null=True, blank=True, help_text=_('Insurance subscriber date of birth'))
    insurance_relationship = models.CharField(
        max_length=20,
        choices=[
            ('self', _('Self')),
            ('spouse', _('Spouse')),
            ('child', _('Child')),
            ('other', _('Other')),
        ],
        default='self',
        help_text=_('Relationship to insurance subscriber')
    )
    
    # Medical Information
    allergies = models.TextField(blank=True, help_text=_('Known allergies'))
    current_medications = models.TextField(blank=True, help_text=_('Current medications'))
    medical_conditions = models.TextField(blank=True, help_text=_('Pre-existing medical conditions'))
    family_history = models.TextField(blank=True, help_text=_('Family medical history'))
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en', help_text=_('Preferred language code'))
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[
            ('phone', _('Phone')),
            ('email', _('Email')),
            ('sms', _('SMS')),
            ('portal', _('Patient Portal')),
        ],
        default='email',
        help_text=_('Preferred contact method')
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text=_('Whether the patient record is active'))
    last_visit = models.DateTimeField(null=True, blank=True, help_text=_('Date of last visit'))

    class Meta:
        db_table = 'core_patient'
        verbose_name = _('Patient')
        verbose_name_plural = _('Patients')
        indexes = [
            models.Index(fields=['user', 'is_active'], name='patient_user_active_idx'),
            models.Index(fields=['last_name', 'first_name'], name='patient_name_idx'),
            models.Index(fields=['date_of_birth'], name='patient_dob_idx'),
            models.Index(fields=['insurance_provider', 'insurance_policy_number'], name='patient_insurance_idx'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                name='unique_patient_per_user'
            ),
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} (DOB: {self.date_of_birth})"

    def clean(self):
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError(_('Date of birth cannot be in the future.'))
        
        if self.insurance_subscriber_dob and self.insurance_subscriber_dob > timezone.now().date():
            raise ValidationError(_('Insurance subscriber date of birth cannot be in the future.'))

    @property
    def age(self):
        """Calculate patient's current age."""
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username


class Doctor(TimeStampedModel):
    """Doctor model with specialization, license, and schedule information."""
    
    class Specialization(models.TextChoices):
        CARDIOLOGY = 'CARD', _('Cardiology')
        DERMATOLOGY = 'DERM', _('Dermatology')
        ENDOCRINOLOGY = 'ENDO', _('Endocrinology')
        GASTROENTEROLOGY = 'GAST', _('