from django.db import models

class Patient(models.Model):
    uhid = models.CharField(max_length=50, unique=True)
    abha_id = models.CharField(max_length=50, blank=True)
    queue_token = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    age = models.IntegerField()
    gender = models.CharField(max_length=20)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    photo_url = models.TextField(blank=True)
    attendant = models.CharField(max_length=50, default='Self')
    emergency_name = models.CharField(max_length=150, blank=True)
    emergency_relation = models.CharField(max_length=50, blank=True)
    emergency_phone = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.queue_token})"

class Vitals(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='vitals')
    
    # Blood Pressure
    bp_value = models.CharField(max_length=50, default='120/80 mmHg')
    bp_source = models.CharField(max_length=50, default='kiosk_device')
    bp_timestamp = models.CharField(max_length=100, default='Kiosk · 09:12 AM')
    bp_is_abnormal = models.BooleanField(default=False)

    # Blood Sugar
    sugar_value = models.CharField(max_length=50, default='100 mg/dL')
    sugar_source = models.CharField(max_length=50, default='self_reported')
    sugar_timestamp = models.CharField(max_length=100, default='Self reported · 09:10 AM')

    # Blood Group
    blood_group_value = models.CharField(max_length=10, default='B+')
    blood_group_source = models.CharField(max_length=50, default='self_reported')

    # SpO2
    spo2_value = models.CharField(max_length=50, default='98 %')
    spo2_source = models.CharField(max_length=50, default='kiosk_device')
    spo2_timestamp = models.CharField(max_length=100, default='Kiosk · 09:12 AM')

    # Pulse
    pulse_value = models.CharField(max_length=50, default='72 bpm')
    pulse_source = models.CharField(max_length=50, default='kiosk_device')
    pulse_timestamp = models.CharField(max_length=100, default='Kiosk · 09:12 AM')

    # Temperature
    temp_value = models.CharField(max_length=50, default='98.6 °F')
    temp_source = models.CharField(max_length=50, default='kiosk_device')
    temp_timestamp = models.CharField(max_length=100, default='Kiosk · 09:12 AM')

    # Weight
    weight_value = models.CharField(max_length=50, default='65 kg')
    weight_source = models.CharField(max_length=50, default='kiosk_device')
    weight_timestamp = models.CharField(max_length=100, default='Kiosk · 09:12 AM')

    def __str__(self):
        return f"Vitals for {self.patient.name}"

class ClinicalSummary(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='clinical_summary')
    chief_complaint = models.TextField()
    history_of_present_illness = models.TextField()
    past_history = models.JSONField(default=list)
    allergy_name = models.CharField(max_length=150, default='NKDA')
    allergy_reaction = models.CharField(max_length=150, default='None')
    current_meds = models.JSONField(default=list)
    family_history = models.JSONField(default=list)
    personal_history = models.JSONField(default=list)
    review_of_systems = models.JSONField(default=dict)
    prior_investigations_summary = models.JSONField(default=list)

    # AYUSH Section
    prakriti = models.CharField(max_length=100, default='Vata-Pitta')
    vikriti = models.CharField(max_length=100, default='Vata aggravation')
    agni = models.CharField(max_length=100, default='Madhyama')
    koshtha = models.CharField(max_length=100, default='Madhyama')

    def __str__(self):
        return f"Clinical Summary for {self.patient.name}"

class RedFlag(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='red_flags')
    symptom = models.TextField()
    severity = models.CharField(max_length=50, default='Needs attention')
    badge_label = models.CharField(max_length=100, default='Critical')
    badge_type = models.CharField(max_length=20, default='red') # red, amber
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"RedFlag: {self.badge_label} for {self.patient.queue_token}"

class ScannedDocument(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='documents')
    doc_id = models.CharField(max_length=100)
    doc_type = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=150, blank=True)
    pages = models.IntegerField(default=1)
    date = models.CharField(max_length=50)
    time = models.CharField(max_length=50, blank=True)
    file_id = models.CharField(max_length=100)
    source = models.CharField(max_length=150, default='MediKiosk (Patient Scan)')
    impression = models.TextField(blank=True)
    signatory = models.CharField(max_length=200, blank=True)
    preview_url = models.TextField(blank=True)
    pages_list = models.JSONField(default=list)
    is_flagged_rescan = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.doc_type} ({self.doc_id}) for {self.patient.name}"

class DocumentAnnotation(models.Model):
    document = models.ForeignKey(ScannedDocument, on_delete=models.CASCADE, related_name='annotations')
    doctor_name = models.CharField(max_length=150, default='Dr. Anjali Verma')
    note_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Annotation by {self.doctor_name} on {self.document.doc_type}"

class QueueItem(models.Model):
    STATUS_CHOICES = [
        ('New', 'New'),
        ('Reviewed', 'Reviewed'),
    ]
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='queue_item')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    queue_number = models.IntegerField(default=1)
    wait_time = models.CharField(max_length=50, default='5 min')
    arrived_at = models.CharField(max_length=50, default='09:12 AM')
    reviewed_at = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Queue #{self.queue_number}: {self.patient.name} ({self.status})"
