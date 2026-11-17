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