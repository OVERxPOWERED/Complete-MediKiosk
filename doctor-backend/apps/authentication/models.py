from django.db import models

class DoctorProfile(models.Model):
    hpr_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    degrees = models.CharField(max_length=150, default='MBBS, MD (Internal Medicine)')
    designation = models.CharField(max_length=150, default='Consultant – General Medicine')
    department = models.CharField(max_length=150, default='General Medicine OPD')
    hospital = models.CharField(max_length=200, default='District Hospital, Bhopal')
    hospital_address = models.TextField(default='E-102, Arera Colony, Bhopal, Madhya Pradesh - 462016')
    counter_desk = models.CharField(max_length=50, default='Desk 4')
    timings = models.CharField(max_length=100, default='09:00 AM – 04:00 PM')
    email = models.CharField(max_length=150, default='anjali.verma@bhopalhosp.gov.in')
    phone = models.CharField(max_length=50, default='+91 98765 43210')
    is_verified_abdm = models.BooleanField(default=True)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.hpr_id})"

class Workspace(models.Model):
    department = models.CharField(max_length=150)
    desk = models.CharField(max_length=50)
    hospital = models.CharField(max_length=200, default='District Hospital, Bhopal')
    timings = models.CharField(max_length=100, default='09:00 AM – 04:00 PM')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.department} · {self.desk}"
