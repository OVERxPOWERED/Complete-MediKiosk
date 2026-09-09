from django.db import models

class DoctorSettings(models.Model):
    doctor_hpr = models.CharField(max_length=50, default='HPR123456', unique=True)
    show_ayush_default = models.BooleanField(default=True)
    pinned_specialists = models.JSONField(
        default=list
    )
    auto_open_docs = models.BooleanField(default=True)
    highlight_abnormal_vitals = models.BooleanField(default=True)
    confirm_before_push = models.BooleanField(default=True)

    def __str__(self):
        return f"Settings for {self.doctor_hpr}"

class NoteTemplate(models.Model):
    template_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=100, default='General Medicine')
    content = models.TextField()
    shortcut = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.title} ({self.category})"
