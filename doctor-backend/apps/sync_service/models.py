from django.db import models

class SyncActionItem(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Synced', 'Synced'),
    ]

    action_id = models.CharField(max_length=50, unique=True)
    patient_token = models.CharField(max_length=50)
    uhid = models.CharField(max_length=50)
    action_type = models.CharField(max_length=150)
    timestamp = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.patient_token} - {self.action_type} ({self.status})"
