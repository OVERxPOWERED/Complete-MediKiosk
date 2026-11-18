import pytest
from datetime import date, timedelta
from decimal import Decimal
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.patients.models import Patient, Visit, MedicalRecord
from apps.users.models import User


class PatientFactory:
    @staticmethod
    def create(**kwargs):
        defaults = {
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': date(1990, 1, 15),
            'gender': 'M',
            'phone': '+15551234567',
            'email': 'john.doe@example.com',
            'address': '123 Main St, City, State 12345',
            'emergency_contact_name': 'Jane Doe',
            'emergency_contact_phone': '+15559876543',
            'insurance_provider': 'Blue Cross',
            'insurance_policy_number': 'BC123456789',
        }
        defaults.update(kwargs)
        return Patient.objects.create(**defaults)

    @staticmethod
    def build(**kwargs):
        defaults = {
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': date(1990, 1, 15),
            'gender': 'M',
            'phone': '+15551234567',
            'email': 'john.doe@example.com',
            'address': '123 Main St, City, State 12345',
            'emergency_contact_name': 'Jane Doe',
            'emergency_contact_phone': '+15559876543',
            'insurance_provider': 'Blue Cross',
            'insurance_policy_number': 'BC123456789',
        }
        defaults.update(kwargs)
        return Patient(**defaults)


class VisitFactory:
    @staticmethod
    def create(patient=None, **kwargs):
        if patient is None:
            patient = PatientFactory.create()
        defaults = {
            'patient': patient,
            'scheduled_at': timezone.now() + timedelta(days=1),
            'status': 'scheduled',
            'visit_type': 'consultation',
            'chief_complaint': 'Regular checkup',
            'notes': '',
        }
        defaults.update(kwargs)
        return Visit.objects.create(**defaults)

    @staticmethod
    def build(patient=None, **kwargs):
        if patient is None:
            patient = PatientFactory.build()
        defaults = {
            'patient': patient,
            'scheduled_at': timezone.now() + timedelta(days=1),
            'status': 'scheduled',
            'visit_type': 'consultation',
            'chief_complaint': 'Regular checkup',
            'notes': '',
        }
        defaults.update(kwargs)
        return Visit(**defaults)


class MedicalRecordFactory:
    @staticmethod
    def create(visit=None, **kwargs):
        if visit is None:
            visit = VisitFactory.create()
        defaults = {
            'visit': visit,
            'diagnosis': 'Hypertension',
            'treatment_plan': 'Lifestyle changes and medication',
            'prescriptions': 'Lisinopril 10mg daily',
            'follow_up_date': date.today() + timedelta(days=30),
            'vital_signs': {
                'blood_pressure': '140/90',
                'heart_rate': 72,
                'temperature': 98.6,
                'respiratory_rate': 16,
                'oxygen_saturation': 98,
            },
        }
        defaults.update(kwargs)
        return MedicalRecord.objects.create(**defaults)

    @staticmethod
    def build(visit=None, **kwargs):
        if visit is None:
            visit = VisitFactory.build()
        defaults = {
            'visit': visit,
            'diagnosis': 'Hypertension',
            'treatment_plan': 'Lifestyle changes and medication',
            'prescriptions': 'Lisinopril 10mg daily',
            'follow_up_date': date.today() + timedelta(days=30),
            'vital_signs': {
                'blood_pressure': '140/90',
                'heart_rate': 72,
                'temperature': 98.6,
                'respiratory_rate': 16,
                'oxygen_saturation': 98,
            },
        }
        defaults.update(kwargs)
        return MedicalRecord(**defaults)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, django_user_model):
    user = django_user_model.objects.create_user(
        username='testdoctor',
        email='doctor@test.com',
        password='testpass123'
    )
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def patient():
    return PatientFactory.create()


@pytest.fixture
def visit(patient):
    return VisitFactory.create(patient=patient)


@pytest.fixture
def medical_record(visit):
    return MedicalRecordFactory.create(visit=visit)


@pytest.mark.django_db
class TestPatientRegistrationFlow:
    def test_patient_registration_creates_record(self, authenticated_client):
        url = reverse('patient-list')
        data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'date_of_birth': '1985-03-22',
            'gender': 'F',
            'phone': '+15551112222',
            'email': 'alice.smith@example.com',
            'address': '456 Oak Ave, Town, State 67890',
            'emergency_contact_name': 'Bob Smith',
            'emergency_contact_phone': '+15553334444',
            'insurance_provider': 'Aetna',
            'insurance_policy_number': 'AE987654321',
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'Alice'
        assert response.data['last_name'] == 'Smith'
        assert response.data['email'] == 'alice.smith@example.com'
        assert 'id' in response.data
        assert 'created_at' in response.data
        assert 'updated_at' in response.data
        
        patient = Patient.objects.get(id=response.data['id'])
        assert patient.first_name == 'Alice'
        assert patient.last_name == 'Smith'
        assert patient.date_of_birth == date(1985, 3, 22)
        assert patient.gender == 'F'
        assert patient.phone == '+15551112222'
        assert patient.insurance_provider == 'Aetna'

    def test_patient_registration_duplicate_email_fails(self, authenticated_client, patient):
        url = reverse('patient-list')
        data = {
            'first_name': 'Different',
            'last_name': 'Name',
            'date_of_birth': '1990-01-01',
            'gender': 'M',
            'phone': '+15559998888',
            'email': patient.email,
            'address': '789 Pine Rd, Village, State 54321',
            'emergency_contact_name': 'Contact',
            'emergency_contact_phone': '+15557776666',
            'insurance_provider': 'Cigna',
            'insurance_policy_number': 'CI111222333',
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_patient_registration_invalid_data_fails(self, authenticated_client):
        url = reverse('patient-list')
        data = {
            'first_name': '',
            'last_name': 'Doe',
            'date_of_birth': 'invalid-date',
            'gender': 'X',
            'phone': 'not-a-phone',
            'email': 'not-an-email',
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'first_name' in response.data
        assert 'date_of_birth' in response.data
        assert 'gender' in response.data

    def test_patient_list_retrieval(self, authenticated_client, patient):
        PatientFactory.create(first_name='Jane', last_name='Doe', email='jane@example.com')
        PatientFactory.create(first_name='Bob', last_name='Wilson', email='bob@example.com')
        
        url = reverse('patient-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 3
        emails = [p['email'] for p in response.data['results']]
        assert patient.email in emails
        assert 'jane@example.com' in emails
        assert 'bob@example.com' in emails

    def test_patient_detail_retrieval(self, authenticated_client, patient):
        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == patient.pk
        assert response.data['first_name'] == patient.first_name
        assert response.data['last_name'] == patient.last_name
        assert response.data['email'] == patient.email

    def test_patient_update(self, authenticated_client, patient):
        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        data = {
            'phone': '+15550001111',
            'address': 'New Address, New City, State 99999',
            'insurance_provider': 'UnitedHealth',
        }
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['phone'] == '+15550001111'
        assert response.data['address'] == 'New Address, New City, State 99999'
        assert response.data['insurance_provider'] == 'UnitedHealth'
        
        patient.refresh_from_db()
        assert patient.phone == '+15550001111'
        assert patient.insurance_provider == 'UnitedHealth'

    def test_patient_deletion(self, authenticated_client, patient):
        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Patient.objects.filter(pk=patient.pk).exists()


@pytest.mark.django_db
class TestVisitLifecycle:
    def test_visit_scheduling_creates_record(self, authenticated_client, patient):
        url = reverse('visit-list')
        scheduled_at = (timezone.now() + timedelta(days=2)).isoformat()
        data = {
            'patient': patient.pk,
            'scheduled_at': scheduled_at,
            'visit_type': 'consultation',
            'chief_complaint': 'Annual physical',
            'notes': 'Patient requests full blood work',
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['patient'] == patient.pk
        assert response.data['visit_type'] == 'consultation'
        assert response.data['chief_complaint'] == 'Annual physical'
        assert response.data['status'] == 'scheduled'
        assert 'id' in response.data
        
        visit = Visit.objects.get(id=response.data['id'])
        assert visit.patient == patient
        assert visit.visit_type == 'consultation'
        assert visit.status == 'scheduled'

    def test_visit_scheduling_conflict_detection(self, authenticated_client, patient, visit):
        url = reverse('visit-list')
        conflict_time = visit.scheduled_at.isoformat()
        data = {
            'patient': patient.pk,
            'scheduled_at': conflict_time,
            'visit_type': 'follow_up',
            'chief_complaint': 'Follow up',
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'non_field_errors' in response.data or 'scheduled_at' in response.data

    def test_visit_scheduling_different_patient_same_time_allowed(self, authenticated_client, visit):
        other_patient = PatientFactory.create(email='other@example.com')
        url = reverse('visit-list')
        data = {
            'patient': other_patient.pk,
            'scheduled_at': visit.scheduled_at.isoformat(),
            'visit_type': 'consultation',
            'chief_complaint': 'New patient',
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED

    def test_check_in_updates_visit_status(self, authenticated_client, visit):
        url = reverse('visit-check-in', kwargs={'pk': visit.pk})
        response = authenticated_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'in_progress'
        assert 'checked_in_at' in response.data
        
        visit.refresh_from_db()
        assert visit.status == 'in_progress'
        assert visit.checked_in_at is not None

    def test_check_in_already_checked_in_fails(self, authenticated_client, visit):
        visit.status = 'in_progress'
        visit.checked_in_at = timezone.now()
        visit.save()
        
        url = reverse('visit-check-in', kwargs={'pk': visit.pk})
        response = authenticated_client.post(url)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_visit_completion_updates_status(self, authenticated_client, visit):
        visit.status = 'in_progress'
        visit.checked_in_at = timezone.now()
        visit.save()
        
        url = reverse('visit-complete', kwargs={'pk': visit.pk})
        response = authenticated_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'completed'
        assert 'completed_at' in response.data
        
        visit.refresh_from_db()
        assert visit.status == 'completed'
        assert visit.completed_at is not None

    def test_visit_cancellation(self, authenticated_client, visit):
        url = reverse('visit-cancel', kwargs={'pk': visit.pk})
        data = {'reason': 'Patient requested cancellation'}
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'cancelled'
        assert response.data['cancellation_reason'] == 'Patient requested cancellation'
        
        visit.refresh_from_db()
        assert visit.status == 'cancelled'
        assert visit.cancellation_reason == 'Patient requested cancellation'

    def test_visit_list_filtering_by_patient(self, authenticated_client, patient):
        VisitFactory.create(patient=patient, visit_type='consultation')
        VisitFactory.create(patient=patient, visit_type='follow_up')
        other_patient = PatientFactory.create(email='other@example.com')
        VisitFactory.create(patient=other_patient, visit_type='consultation')
        
        url = reverse('visit-list')
        response = authenticated_client.get(url, {'patient': patient.pk})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
        for visit_data in response.data['results']:
            assert visit_data['patient'] == patient.pk

    def test_visit_list_filtering_by_status(self, authenticated_client, patient):
        VisitFactory.create(patient=patient, status='scheduled')
        VisitFactory.create(patient=patient, status='completed')
        VisitFactory.create(patient=patient, status='cancelled')
        
        url = reverse('visit-list')
        response = authenticated_client.get(url, {'status': 'scheduled'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['status'] == 'scheduled'

    def test_visit_list_filtering_by_date_range(self, authenticated_client, patient):
        today = timezone.now().date()
        VisitFactory.create(patient=patient, scheduled_at=timezone.make_aware(
            timezone.datetime.combine(today, timezone.datetime.min.time())
        ))
        VisitFactory.create(patient=patient, scheduled_at=timezone.make_aware(
            timezone.datetime.combine(today + timedelta(days=5), timezone.datetime.min.time())
        ))
        VisitFactory.create(patient=patient, scheduled_at=timezone.make_aware(
            timezone.datetime.combine(today + timedelta(days=10), timezone.datetime.min.time())
        ))
        
        url