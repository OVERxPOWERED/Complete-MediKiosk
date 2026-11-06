import json
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.cache import cache
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
        doctor_group, _ = Group.objects.get_or_create(name="Doctors")
        self.groups.add(doctor_group)


class NurseFactory(UserFactory):
    is_staff = True

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return
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


class MedicalRecordFactory(DjangoModelFactory):
    class Meta:
        model = MedicalRecord

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    visit_date = factory.LazyAttribute(lambda _: timezone.now().date() - timedelta(days=factory.Faker("random_int", min=1, max=365).evaluate(None, None, {})))
    chief_complaint = factory.Faker("sentence", nb_words=8)
    diagnosis = factory.Faker("sentence", nb_words=10)
    treatment_plan = factory.Faker("paragraph", nb_sentences=3)
    notes = factory.Faker("paragraph", nb_sentences=2)
    is_confidential = False


class PrescriptionFactory(DjangoModelFactory):
    class Meta:
        model = Prescription

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    medical_record = factory.SubFactory(MedicalRecordFactory)
    medication_name = factory.Faker("word")
    dosage = factory.Faker("bothify", text="??mg")
    frequency = FuzzyChoice(["Once daily", "Twice daily", "Three times daily", "Four times daily", "As needed"])
    route = FuzzyChoice(["Oral", "Topical", "Injection", "Inhalation", "Sublingual"])
    quantity = factory.Faker("random_int", min=7, max=90)
    refills_remaining = factory.Faker("random_int", min=0, max=5)
    status = FuzzyChoice([choice[0] for choice in PrescriptionStatus.choices])
    prescribed_at = factory.LazyAttribute(lambda _: timezone.now() - timedelta(days=factory.Faker("random_int", min=1, max=30).evaluate(None, None, {})))
    instructions = factory.Faker("sentence", nb_words=12)


class LabResultFactory(DjangoModelFactory):
    class Meta:
        model = LabResult

    patient = factory.SubFactory(PatientFactory)
    doctor = factory.SubFactory(DoctorFactory)
    test_name = factory.Faker("word")
    test_code = factory.Faker("bothify", text="LAB-####")
    result_value = factory.Faker("pyfloat", min_value=0, max_value=500, right_digits=2)
    unit = FuzzyChoice(["mg/dL", "mmol/L", "g/dL", "U/L", "ng/mL", "pg/mL", "cells/µL", "%"])
    reference_range = factory.Faker("bothify", text="##.##-##.##")
    status = FuzzyChoice(["normal", "abnormal", "critical", "pending"])
    collected_at = factory.LazyAttribute(lambda _: timezone.now() - timedelta(days=factory.Faker("random_int", min=1, max=14).evaluate(None, None, {})))
    reported_at = factory.LazyAttribute(lambda o: o.collected_at + timedelta(hours=factory.Faker("random_int", min=1, max=48).evaluate(None, None, {})))
    notes = factory.Faker("sentence", nb_words=10)


class BaseAPITestCase(APITestCase):
    """Base test case with common setup for API integration tests."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = AdminFactory()
        self.doctor_user = DoctorFactory()
        self.nurse_user = NurseFactory()
        self.regular_user = UserFactory()

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin_user)

        self.doctor_client = APIClient()
        self.doctor_client.force_authenticate(user=self.doctor_user)

        self.nurse_client = APIClient()
        self.nurse_client.force_authenticate(user=self.nurse_user)

        self.unauthenticated_client = APIClient()

        cache.clear()

    def tearDown(self):
        cache.clear()


class PatientAPITestCase(BaseAPITestCase):
    """Integration tests for Patient API endpoints."""

    def test_create_patient_valid_data(self):
        """Test creating a patient with valid data."""
        url = reverse("patient-list")
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "gender": "M",
            "phone": "+15551234567",
            "email": "john.doe@example.com",
            "address": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "zip_code": "12345",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+15559876543",
            "insurance_provider": "Health Insurance Co",
            "insurance_policy_number": "POL-1234ABCD",
        }

        response = self.admin_client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["first_name"], "John")
        self.assertEqual(response.data["last_name"], "Doe")
        self.assertEqual(response.data["gender"], "M")
        self.assertTrue(Patient.objects.filter(mrn=response.data["mrn"]).exists())

    def test_create_patient_invalid_phone(self):
        """Test creating a patient with invalid phone number."""
        url = reverse("patient-list")
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "gender": "M",
            "phone": "invalid-phone",
            "email": "john.doe@example.com",
            "address": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "zip_code": "12345",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+15559876543",
            "insurance_provider": "Health Insurance Co",
            "insurance_policy_number": "POL-1234ABCD",
        }

        response = self.admin_client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_create_patient_missing_required_fields(self):
        """Test creating a patient with missing required fields."""
        url = reverse("patient-list")
        data = {
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.admin_client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date_of_birth", response.data)
        self.assertIn("gender", response.data)

    def test_create_patient_future_date_of_birth(self):
        """Test creating a patient with future date of birth."""
        url = reverse("patient-list")
        future_date = (timezone.now().date() + timedelta(days=1)).isoformat()
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": future_date,
            "gender": "M",
            "phone": "+15551234567",
            "email": "john.doe@example.com",
            "address": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "zip_code": "12345",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+15559876543",
            "insurance_provider": "Health Insurance Co",
            "insurance_policy_number": "POL-1234ABCD",
        }

        response = self.admin_client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date_of_birth", response.data)

    def test_create_patient_duplicate_mrn(self):
        """Test creating a patient with duplicate MRN."""
        patient = PatientFactory()
        url = reverse("patient-list")
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "gender": "M",
            "phone": "+15551234567",
            "email": "john.doe@example.com",
            "address": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "zip_code": "12345",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+15559876543",
            "insurance_provider": "Health Insurance Co",
            "insurance_policy_number": "POL-1234ABCD",
            "mrn": patient.mrn,
        }

        response = self.admin_client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mrn", response.data)

    def test_list_patients(self):
        """Test listing patients."""
        PatientFactory.create_batch(5)
        url = reverse("patient-list")

        response = self.admin_client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_retrieve_patient(self):
        """Test retrieving a single patient."""
        patient = PatientFactory()
        url = reverse("patient-detail", kwargs={"pk": patient.pk})

        response = self.admin_client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["mrn"], patient.mrn)

    def test_update_patient(self):
        """Test updating a patient."""
        patient = PatientFactory()
        url = reverse("patient-detail", kwargs={"pk": patient.pk})
        data = {"phone": "+15559999999", "email": "updated@example.com"}

        response = self.admin_client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone"], "+15559999999")
        self.assertEqual(response.data["email"], "updated@example.com")

    def test_delete_patient(self):
        """Test soft deleting a patient."""
        patient = PatientFactory()
        url = reverse("patient-detail", kwargs={"pk": patient.pk})

        response = self.admin_client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        patient.refresh_from_db()
        self.assertFalse(patient.is_active)

    def test_patient_search(self):
        """Test patient search functionality."""
        PatientFactory(first_name="John", last_name="Smith")
        PatientFactory(first_name="Jane", last_name="Doe")
        PatientFactory(first_name="Bob", last_name="Johnson")
        url = reverse("patient-list")

        response = self.admin_client.get(url, {"search": "John"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["first_name"], "John")

    def test_patient_filter_by_gender(self):
        """Test filtering patients by gender."""
        PatientFactory(gender="M")
        PatientFactory(gender="F")
        PatientFactory(gender="M")
        url = reverse("patient-list")

        response = self.admin_client.get(url, {"gender": "M"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)
        for patient in response.data["results"]:
            self.assertEqual(patient["gender"], "M")


class AppointmentAPITestCase(BaseAPITestCase):
    """Integration tests for Appointment API endpoints."""

    def setUp(self):
        super().setUp()
        self.patient = PatientFactory()
        self.doctor = DoctorFactory()
        self.other_doctor = DoctorFactory()

    def test_schedule_appointment_valid_data(self):
        """Test scheduling an appointment with valid data."""
        url = reverse("appointment-list")
        scheduled_at = timezone.now() + timedelta(days=7)
        data = {
            "patient": self.patient.pk,
            "doctor": self.doctor.pk,
            "appointment_type": AppointmentType.CONSULTATION,
            "scheduled_at": scheduled_at.isoformat(),
            "duration_minutes": 30,
            "chief_com