from django.db import models
from apps.patients.models import Patient

class ConsultationOutcome(models.Model):
    OUTCOME_TYPES = [
        ('Treated & Discharged', 'Treated & Discharged'),
        ('Referred to Specialist', 'Referred to Specialist'),
        ('Advised Investigation', 'Advised Investigation'),
        ('Admitted', 'Admitted'),
        ('Follow-up', 'Follow-up'),
    ]

    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='consultation_outcome')
    outcome_type = models.CharField(max_length=50, choices=OUTCOME_TYPES, default='Treated & Discharged')
    clinical_notes = models.TextField(blank=True)
    follow_up_date = models.CharField(max_length=50, blank=True)
    remind_sms = models.BooleanField(default=True)
    referred_specialist = models.CharField(max_length=150, blank=True)
    additional_instructions = models.TextField(blank=True)
    advice = models.JSONField(default=list)
    recorded_at = models.CharField(max_length=100, default='11:42 AM, 03 Sep 2026')
    doctor_name = models.CharField(max_length=150, default='Dr. Anjali Verma')
    pushed_to_his = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Outcome for {self.patient.name}: {self.outcome_type}"

class Prescription(models.Model):
    outcome = models.ForeignKey(ConsultationOutcome, on_delete=models.CASCADE, related_name='prescriptions')
    name = models.CharField(max_length=150)
    dosage = models.CharField(max_length=100, default='1 tablet once daily')
    duration = models.CharField(max_length=100, default='30 days')

    def __str__(self):
        return f"{self.name} ({self.dosage})"

class AuditLog(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='audit_logs')
    time = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    actor = models.CharField(max_length=150)
    details = models.TextField()
    badge_color = models.CharField(max_length=100, default='bg-emerald-100 text-emerald-800')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return f"{self.title} - {self.time}"
