from django.db import models
from django.core.validators import (
    RegexValidator,
    MinValueValidator,
    MaxValueValidator,
    EmailValidator,
)
from django.utils import timezone
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class GenderChoices(models.TextChoices):
    MALE = "M", _("Male")
    FEMALE = "F", _("Female")
    OTHER = "O", _("Other")
    PREFER_NOT_TO_SAY = "P", _("Prefer not to say")


class VisitTypeChoices(models.TextChoices):
    CONSULTATION = "consultation", _("Consultation")
    FOLLOW_UP = "follow_up", _("Follow-up")
    EMERGENCY = "emergency", _("Emergency")
    ROUTINE_CHECKUP = "routine_checkup", _("Routine Checkup")
    SPECIALIST = "specialist", _("Specialist Visit")
    TELEMEDICINE = "telemedicine", _("Telemedicine")
    PROCEDURE = "procedure", _("Procedure")
    VACCINATION = "vaccination", _("Vaccination")


class VisitStatusChoices(models.TextChoices):
    SCHEDULED = "scheduled", _("Scheduled")
    CONFIRMED = "confirmed", _("Confirmed")
    CHECKED_IN = "checked_in", _("Checked In")
    IN_PROGRESS = "in_progress", _("In Progress")
    COMPLETED = "completed", _("Completed")
    CANCELLED = "cancelled", _("Cancelled")
    NO_SHOW = "no_show", _("No Show")
    RESCHEDULED = "rescheduled", _("Rescheduled")


class Patient(models.Model):
    """
    Core patient demographic model with comprehensive validation.
    """

    first_name = models.CharField(_("first name"), max_length=100)
    last_name = models.CharField(_("last name"), max_length=100)
    date_of_birth = models.DateField(_("date of birth"))
    gender = models.CharField(
        _("gender"),
        max_length=1,
        choices=GenderChoices.choices,
        default=GenderChoices.PREFER_NOT_TO_SAY,
    )

    phone_regex = RegexValidator(
        regex=r"^\+?1?\d{9,15}$",
        message=_("Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."),
    )
    phone = models.CharField(
        _("phone number"),
        validators=[phone_regex],
        max_length=17,
        blank=True,
        default="",
    )

    email = models.EmailField(
        _("email address"),
        validators=[EmailValidator()],
        blank=True,
        default="",
        db_index=True,
    )

    address_line1 = models.CharField(_("address line 1"), max_length=255, blank=True, default="")
    address_line2 = models.CharField(_("address line 2"), max_length=255, blank=True, default="")
    city = models.CharField(_("city"), max_length=100, blank=True, default="")
    state = models.CharField(_("state/province"), max_length=100, blank=True, default="")
    postal_code = models.CharField(
        _("postal code"),
        max_length=20,
        blank=True,
        default="",
        validators=[RegexValidator(regex=r"^[A-Za-z0-9\s-]{3,20}$")],
    )
    country = models.CharField(_("country"), max_length=100, default="USA")

    emergency_contact_name = models.CharField(
        _("emergency contact name"), max_length=200, blank=True, default=""
    )
    emergency_contact_phone = models.CharField(
        _("emergency contact phone"),
        validators=[phone_regex],
        max_length=17,
        blank=True,
        default="",
    )
    emergency_contact_relationship = models.CharField(
        _("emergency contact relationship"), max_length=100, blank=True, default=""
    )

    insurance_provider = models.CharField(_("insurance provider"), max_length=200, blank=True, default="")
    insurance_policy_number = models.CharField(_("insurance policy number"), max_length=100, blank=True, default="")
    insurance_group_number = models.CharField(_("insurance group number"), max_length=100, blank=True, default="")

    is_active = models.BooleanField(_("active"), default=True, db_index=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("patient")
        verbose_name_plural = _("patients")
        ordering = ["last_name", "first_name", "date_of_birth"]
        indexes = [
            models.Index(fields=["last_name", "first_name"], name="patient_name_idx"),
            models.Index(fields=["date_of_birth"], name="patient_dob_idx"),
            models.Index(fields=["email"], name="patient_email_idx"),
            models.Index(fields=["phone"], name="patient_phone_idx"),
            models.Index(fields=["is_active", "last_name"], name="patient_active_name_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(date_of_birth__lte=timezone.now().date()),
                name="patient_dob_not_future",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.last_name}, {self.first_name} (DOB: {self.date_of_birth})"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self) -> int:
        today = timezone.now().date()
        return (
            today.year
            - self.date_of_birth.year
            - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        )

    def get_absolute_url(self) -> str:
        from django.urls import reverse
        return reverse("patients:patient-detail", kwargs={"pk": self.pk})


class Visit(models.Model):
    """
    Patient visit/encounter model with full lifecycle tracking.
    """

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name=_("patient"),
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name=_("provider"),
        limit_choices_to={"is_staff": True},
    )

    visit_type = models.CharField(
        _("visit type"),
        max_length=30,
        choices=VisitTypeChoices.choices,
        default=VisitTypeChoices.CONSULTATION,
        db_index=True,
    )

    status = models.CharField(
        _("status"),
        max_length=20,
        choices=VisitStatusChoices.choices,
        default=VisitStatusChoices.SCHEDULED,
        db_index=True,
    )

    scheduled_at = models.DateTimeField(_("scheduled at"), db_index=True)
    checked_in_at = models.DateTimeField(_("checked in at"), null=True, blank=True)
    started_at = models.DateTimeField(_("started at"), null=True, blank=True)
    completed_at = models.DateTimeField(_("completed at"), null=True, blank=True)

    chief_complaint = models.TextField(_("chief complaint"), blank=True, default="")
    notes = models.TextField(_("clinical notes"), blank=True, default="")

    duration_minutes = models.PositiveIntegerField(
        _("duration (minutes)"),
        validators=[MinValueValidator(1), MaxValueValidator(480)],
        null=True,
        blank=True,
    )

    cancellation_reason = models.TextField(_("cancellation reason"), blank=True, default="")
    cancelled_at = models.DateTimeField(_("cancelled at"), null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_visits",
        verbose_name=_("cancelled by"),
    )

    created_at = models.DateTimeField(_("created at"), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("visit")
        verbose_name_plural = _("visits")
        ordering = ["-scheduled_at"]
        indexes = [
            models.Index(fields=["patient", "-scheduled_at"], name="visit_patient_scheduled_idx"),
            models.Index(fields=["provider", "-scheduled_at"], name="visit_provider_scheduled_idx"),
            models.Index(fields=["status", "scheduled_at"], name="visit_status_scheduled_idx"),
            models.Index(fields=["visit_type", "status"], name="visit_type_status_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(checked_in_at__isnull=True)
                    | models.Q(checked_in_at__gte=models.F("scheduled_at"))
                ),
                name="visit_checkin_after_scheduled",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(completed_at__isnull=True)
                    | models.Q(completed_at__gte=models.F("checked_in_at"))
                ),
                name="visit_complete_after_checkin",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(cancelled_at__isnull=True)
                    | models.Q(cancelled_at__gte=models.F("created_at"))
                ),
                name="visit_cancel_after_create",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.patient} - {self.visit_type.label} on {self.scheduled_at:%Y-%m-%d %H:%M}"

    def clean(self) -> None:
        from django.core.exceptions import ValidationError

        if self.scheduled_at and self.scheduled_at < timezone.now():
            if self.status in [VisitStatusChoices.SCHEDULED, VisitStatusChoices.CONFIRMED]:
                raise ValidationError(_("Cannot schedule visits in the past."))

        if self.checked_in_at and self.scheduled_at and self.checked_in_at < self.scheduled_at:
            raise ValidationError(_("Check-in time cannot be before scheduled time."))

        if self.completed_at and self.checked_in_at and self.completed_at < self.checked_in_at:
            raise ValidationError(_("Completion time cannot be before check-in time."))

    def save(self, *args, **kwargs) -> None:
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def is_past_due(self) -> bool:
        return self.scheduled_at < timezone.now() and self.status in [
            VisitStatusChoices.SCHEDULED,
            VisitStatusChoices.CONFIRMED,
        ]

    @property
    def actual_duration(self) -> int | None:
        if self.checked_in_at and self.completed_at:
            delta = self.completed_at - self.checked_in_at
            return int(delta.total_seconds() / 60)
        return None


class MedicalRecord(models.Model):
    """
    Clinical medical record linked to a patient and optionally a visit.
    """

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medical_records",
        verbose_name=_("patient"),
    )

    visit = models.ForeignKey(
        Visit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="medical_records",
        verbose_name=_("visit"),
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="authored_records",
        verbose_name=_("provider"),
        limit_choices_to={"is_staff": True},
    )

    recorded_at = models.DateTimeField(_("recorded at"), default=timezone.now, db_index=True)

    diagnosis = models.TextField(_("diagnosis"), blank=True, default="")
    icd10_codes = models.JSONField(
        _("ICD-10 codes"),
        default=list,
        blank=True,
        help_text=_("List of ICD-10 diagnosis codes"),
    )

    treatment_plan = models.TextField(_("treatment plan"), blank=True, default="")

    prescriptions = models.JSONField(
        _("prescriptions"),
        default=list,
        blank=True,
        help_text=_(
            "List of prescriptions: [{'medication': str, 'dosage': str, 'frequency': str, "
            "'duration': str, 'quantity': int, 'refills': int, 'instructions': str}]"
        ),
    )

    vitals = models.JSONField(
        _("vitals"),
        default=dict,
        blank=True,
        help_text=_(
            "Vital signs: {'blood_pressure': '120/80', 'heart_rate': 72, "
            "'temperature': 98.6, 'respiratory_rate': 16, 'oxygen_saturation': 98, "
            "'weight': 70.5, 'height': 175, 'bmi': 22.9, 'pain_scale': 3}"
        ),
    )

    allergies = models.JSONField(
        _("allergies"),
        default=list,
        blank=True,
        help_text=_("List of allergies: [{'allergen': str, 'reaction': str, 'severity': str}]"),
    )

    follow_up_instructions = models.TextField(_("follow-up instructions"), blank=True, default="")
    follow_up_date = models.DateField(_("follow-up date"), null=True, blank=True)

    is_confidential = models.BooleanField(_("confidential"), default=False)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("medical record")
        verbose_name_plural = _("medical records")
        ordering = ["-recorded_at"]
        indexes = [
            models.Index(fields=["patient", "-recorded_at"], name="record_patient_date_idx"),
            models.Index(fields=["visit"], name="record_visit_idx"),
            models.Index(fields=["provider", "-recorded_at"], name="record_provider_date_idx"),
            models.Index(fields=["follow_up_date"], name="record_followup_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(recorded_at__lte=timezone.now()),
                name="record_not_future",
            ),
        ]

    def __str__(self) -> str:
        visit_str = f" (Visit: {self.visit.pk})" if self.visit else ""
        return f"Record for {self.patient} on {self.recorded_at:%Y-%m-%d}{visit_str}"

    def clean(self) -> None:
        from django.core.exceptions import ValidationError

        if self.visit and self.visit.patient != self.patient:
            raise ValidationError(_("Visit must belong to the same patient."))

        if self.follow_up_date and self.follow_up_date < self.recorded_at.date():
            raise ValidationError(_("Follow-up date cannot be before record date."))

    def save(self, *args, **kwargs) -> None:
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def has_prescriptions(self) -> bool:
        return bool(self.prescriptions)

    @property
    def prescription_count(self) -> int:
        return len(self.prescriptions) if self.prescriptions else 0