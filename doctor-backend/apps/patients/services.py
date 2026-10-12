```python
from django.db import transaction
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils import timezone
from typing import Optional, Dict, Any, List, Tuple

from apps.patients.models import Patient
from apps.patients.validators import (
    validate_patient_data,
    validate_patient_update_data,
    validate_search_filters,
)
from apps.patients.selectors import (
    patient_get_by_id,
    patient_list,
    patient_search,
    patient_get_history,
)
from apps.core.exceptions import (
    ValidationError,
    NotFoundError,
    BusinessLogicError,
)


class PatientService:
    """
    Service layer for patient management operations.
    Encapsulates business logic and coordinates between selectors, validators, and models.
    """

    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100

    @transaction.atomic
    def create_patient(self, validated_data: Dict[str, Any]) -> Patient:
        """
        Create a new patient record with validated data.

        Args:
            validated_data: Dictionary containing patient data (already validated)

        Returns:
            Created Patient instance

        Raises:
            ValidationError: If data validation fails
            BusinessLogicError: If business rules are violated (e.g., duplicate MRN)
        """
        validate_patient_data(validated_data)

        mrn = validated_data.get("medical_record_number")
        if mrn and Patient.objects.filter(medical_record_number=mrn, is_deleted=False).exists():
            raise BusinessLogicError(
                f"Patient with medical record number '{mrn}' already exists.",
                code="DUPLICATE_MRN",
            )

        email = validated_data.get("email")
        if email and Patient.objects.filter(email__iexact=email, is_deleted=False).exists():
            raise BusinessLogicError(
                f"Patient with email '{email}' already exists.",
                code="DUPLICATE_EMAIL",
            )

        patient = Patient.objects.create(**validated_data)
        return patient

    def get_patient(self, patient_id: int) -> Patient:
        """
        Retrieve a patient by ID.

        Args:
            patient_id: Primary key of the patient

        Returns:
            Patient instance

        Raises:
            NotFoundError: If patient not found or is deleted
        """
        patient = patient_get_by_id(patient_id)
        if not patient:
            raise NotFoundError(f"Patient with ID {patient_id} not found.", code="PATIENT_NOT_FOUND")
        return patient

    @transaction.atomic
    def update_patient(self, patient_id: int, data: Dict[str, Any]) -> Patient:
        """
        Update an existing patient record.

        Args:
            patient_id: Primary key of the patient to update
            data: Dictionary containing fields to update

        Returns:
            Updated Patient instance

        Raises:
            NotFoundError: If patient not found
            ValidationError: If validation fails
            BusinessLogicError: If business rules are violated
        """
        patient = self.get_patient(patient_id)

        validate_patient_update_data(data, patient)

        if "medical_record_number" in data:
            new_mrn = data["medical_record_number"]
            if Patient.objects.filter(
                medical_record_number=new_mrn, is_deleted=False
            ).exclude(pk=patient_id).exists():
                raise BusinessLogicError(
                    f"Patient with medical record number '{new_mrn}' already exists.",
                    code="DUPLICATE_MRN",
                )

        if "email" in data:
            new_email = data["email"]
            if Patient.objects.filter(email__iexact=new_email, is_deleted=False).exclude(pk=patient_id).exists():
                raise BusinessLogicError(
                    f"Patient with email '{new_email}' already exists.",
                    code="DUPLICATE_EMAIL",
                )

        for field, value in data.items():
            if hasattr(patient, field) and field not in ("id", "created_at", "updated_at"):
                setattr(patient, field, value)

        patient.updated_at = timezone.now()
        patient.save(update_fields=list(data.keys()) + ["updated_at"])

        return patient

    @transaction.atomic
    def soft_delete_patient(self, patient_id: int) -> Patient:
        """
        Soft delete a patient record (mark as deleted without removing from DB).

        Args:
            patient_id: Primary key of the patient to delete

        Returns:
            Deleted Patient instance

        Raises:
            NotFoundError: If patient not found
            BusinessLogicError: If patient has active appointments or records preventing deletion
        """
        patient = self.get_patient(patient_id)

        if hasattr(patient, "appointments") and patient.appointments.filter(
            status__in=["scheduled", "confirmed", "in_progress"], is_deleted=False
        ).exists():
            raise BusinessLogicError(
                "Cannot delete patient with active appointments.",
                code="ACTIVE_APPOINTMENTS_EXIST",
            )

        if hasattr(patient, "medical_records") and patient.medical_records.filter(is_deleted=False).exists():
            raise BusinessLogicError(
                "Cannot delete patient with existing medical records. Archive records first.",
                code="MEDICAL_RECORDS_EXIST",
            )

        patient.is_deleted = True
        patient.deleted_at = timezone.now()
        patient.save(update_fields=["is_deleted", "deleted_at", "updated_at"])

        return patient

    def search_patients(
        self,
        query: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        page_size: Optional[int] = None,
        ordering: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Search and filter patients with pagination.

        Args:
            query: Free-text search query (searches name, MRN, email, phone)
            filters: Dictionary of filter parameters
            page: Page number (1-indexed)
            page_size: Number of results per page
            ordering: Field to order by (prefix with '-' for descending)

        Returns:
            Dictionary containing paginated results and metadata
        """
        validate_search_filters(filters or {})

        page_size = min(page_size or self.DEFAULT_PAGE_SIZE, self.MAX_PAGE_SIZE)

        queryset = patient_search(query=query, filters=filters)

        if ordering:
            valid_ordering_fields = [
                "first_name", "last_name", "date_of_birth",
                "medical_record_number", "created_at", "updated_at",
                "-first_name", "-last_name", "-date_of_birth",
                "-medical_record_number", "-created_at", "-updated_at",
            ]
            if ordering in valid_ordering_fields:
                queryset = queryset.order_by(ordering)
            else:
                queryset = queryset.order_by("-created_at")
        else:
            queryset = queryset.order_by("-created_at")

        paginator = Paginator(queryset, page_size)

        try:
            page_obj = paginator.page(page)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        return {
            "results": list(page_obj.object_list),
            "pagination": {
                "current_page": page_obj.number,
                "total_pages": paginator.num_pages,
                "total