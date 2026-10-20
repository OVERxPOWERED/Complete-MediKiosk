```python
import json
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

import factory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice, FuzzyDate, FuzzyDecimal, FuzzyText

from apps.core.models import (
    Appointment,
    AppointmentStatus,
    AppointmentType,
    LabResult,
    MedicalRecord,
    Patient,
    Prescription,
    PrescriptionStatus,
)
from apps.core.serializers import (
    AppointmentSerializer,
    LabResultSerializer,
    MedicalRecordSerializer,
    PatientSerializer,
    PrescriptionSerializer,
)

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_staff = False
    is_superuser = False

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        if not create:
            return
        self.set_password(extracted or "testpass123")
        self.save()


class DoctorFactory(UserFactory):
    is_staff = True

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return
        from django.contrib.auth.models import Group

        doctor_group, _ = Group.objects.get_or_create(name="Doctors")
        self.groups.add(doctor_group)


class NurseFactory(UserFactory):
    is_staff = True

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return
        from django.contrib.auth.models import Group

        nurse_group, _ = Group.objects.get_or_create(name="Nurses")
        self.groups.add(nurse_group)


class AdminFactory(UserFactory):
    is_staff = True
    is_superuser = True


class PatientFactory(DjangoModelFactory):
    class Meta:
        model = Patient
        django_get_or_create = ("mrn",)

    mrn = factory.Sequence(lambda n: f"MRN{n:08d}")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    date_of_birth = FuzzyDate(date(1930, 1, 1), date(2010, 12, 31))
    gender = FuzzyChoice(["M", "F", "O"])
    phone = factory.Faker("phone_number")
    email = factory.Faker("email")
    address = factory.Faker("street_address")
    city = factory.Faker("city")
    state = factory.Faker("state_abbr")
    zip_code = factory.Faker("zipcode")
    emergency_contact_name = factory.Faker("name")
    emergency_contact_phone = factory.Faker("phone_number")
    insurance_provider = factory.Faker("company")
    insurance_policy_number = factory.Faker("bothify", text="POL-####????")
    is_active = True


class AppointmentFactory(DjangoModelFactory):
    class Meta:
        model = Appointment

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    appointment_type = FuzzyChoice([choice[0] for choice in AppointmentType.choices])
    status = FuzzyChoice([choice[0] for choice in AppointmentStatus.choices])
    scheduled_at = factory.LazyAttribute(
        lambda _: timezone.now() + timedelta(days=factory.Faker("random_int", min=1, max=30).evaluate(None, None, {}))
    )
    duration_minutes = FuzzyChoice([15, 30, 45, 60, 90])
    chief_complaint = factory.Faker("sentence", nb_words=6)
    notes = factory.Faker("paragraph", nb_sentences=2)
    created_by = factory.SubFactory(NurseFactory)

    @factory.post_generation
    def set_scheduled_at(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            self.scheduled_at = extracted
        else:
            self.scheduled_at = timezone.now() + timedelta(days=7)
        self.save()


class MedicalRecordFactory(DjangoModelFactory):
    class Meta:
        model = MedicalRecord

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    appointment = factory.SubFactory(AppointmentFactory)
    visit_type = FuzzyChoice(["initial", "follow_up", "emergency", "routine"])
    chief_complaint = factory.Faker("sentence", nb_words=8)
    history_of_present_illness = factory.Faker("paragraph", nb_sentences=3)
    physical_examination = factory.Faker("paragraph", nb_sentences=3)
    assessment = factory.Faker("paragraph", nb_sentences=2)
    plan = factory.Faker("paragraph", nb_sentences=2)
    vital_signs = factory.LazyFunction(
        lambda: {
            "blood_pressure": "120/80",
            "heart_rate": 72,
            "temperature": 98.6,
            "respiratory_rate": 16,
            "oxygen_saturation": 98,
            "weight": 170,
            "height": 70,
        }
    )
    is_confidential = False


class PrescriptionFactory(DjangoModelFactory):
    class Meta:
        model = Prescription

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    medical_record = factory.SubFactory(MedicalRecordFactory)
    medication_name = factory.Faker("word")
    dosage = factory.Faker("bothify", text="??mg")
    frequency = FuzzyChoice(["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "as_needed"])
    route = FuzzyChoice(["oral", "topical", "injection", "inhalation", "sublingual"])
    quantity = factory.Faker("random_int", min=7, max=90)
    refills = factory.Faker("random_int", min=0, max=5)
    status = FuzzyChoice([choice[0] for choice in PrescriptionStatus.choices])
    instructions = factory.Faker("sentence", nb_words=10)
    start_date = factory.LazyFunction(date.today)
    end_date = factory.LazyAttribute(lambda o: o.start_date + timedelta(days=30))


class LabResultFactory(DjangoModelFactory):
    class Meta:
        model = LabResult

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    medical_record = factory.SubFactory(MedicalRecordFactory)
    test_name = factory.Faker("word")
    test_code = factory.Faker("bothify", text="LAB-####")
    result_value = factory.Faker("pyfloat", left_digits=3, right_digits=2, positive=True)
    unit = FuzzyChoice(["mg/dL", "mmol/L", "g/dL", "U/L", "ng/mL", "pg/m