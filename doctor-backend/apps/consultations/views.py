from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from apps.patients.models import Patient
from apps.sync_service.models import SyncActionItem
from .models import ConsultationOutcome, Prescription, AuditLog
from .serializers import ConsultationOutcomeSerializer, AuditLogSerializer
from apps.patients.serializers import PatientSummarySerializer

class RecordOutcomeView(APIView):
    def post(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        outcome_type = data.get('outcome_type', 'Treated & Discharged')
        clinical_notes = data.get('clinical_notes', '')
        follow_up_date = data.get('follow_up_date', '')
        remind_sms = data.get('remind_sms', True)
        referred_specialist = data.get('referred_specialist', '')
        additional_instructions = data.get('additional_instructions', '')
        advice = data.get('advice', ['Rest and hydration', 'Low salt diet'])
        doctor_name = data.get('doctor_name', 'Dr. Anjali Verma')

        # Update or create outcome
        outcome, created = ConsultationOutcome.objects.update_or_create(
            patient=patient,
            defaults={
                'outcome_type': outcome_type,
                'clinical_notes': clinical_notes,
                'follow_up_date': follow_up_date,
                'remind_sms': remind_sms,
                'referred_specialist': referred_specialist,
                'additional_instructions': additional_instructions,
                'advice': advice,
                'recorded_at': '11:42 AM, 03 Sep 2026',
                'doctor_name': doctor_name,
                'pushed_to_his': True,
            }
        )

        # Clear and recreate prescriptions
        outcome.prescriptions.all().delete()
        prescriptions_data = data.get('prescriptions', [])
        for rx in prescriptions_data:
            Prescription.objects.create(
                outcome=outcome,
                name=rx.get('name', ''),
                dosage=rx.get('dosage', '1 tablet once daily'),
                duration=rx.get('duration', '30 days'),
            )

        # Ensure patient status is Reviewed
        if hasattr(patient, 'queue_item'):
            patient.queue_item.status = 'Reviewed'
            if not patient.queue_item.reviewed_at:
                patient.queue_item.reviewed_at = '10:28 AM, 03 Sep 2026'
            patient.queue_item.save()

        # Add Audit log
        AuditLog.objects.create(
            patient=patient,
            time="11:42 AM, 03 Sep 2026",
            title="Consultation Outcome Recorded & Synced",
            actor=f"{doctor_name} (HPR123456)",
            details=f"Outcome type: {outcome_type}. Pushed to HIS and pharmacy queue.",
            badge_color="bg-emerald-100 text-emerald-800",
            order=0,
        )

        # Add sync action record
        SyncActionItem.objects.create(
            action_id=f"sync-{patient.queue_token}-{outcome_type[:4].lower()}",
            patient_token=patient.queue_token,
            uhid=patient.uhid,
            action_type=f"Outcome ({outcome_type.split()[0]})",
            timestamp="03 Sep 2026, 11:42 AM",
            status="Synced",
            details="Consultation outcome successfully committed to hospital repository.",
        )

        serializer = PatientSummarySerializer(patient)
        return Response({
            "success": True,
            "patient": serializer.data,
            "message": "Consultation outcome recorded and pushed to Hospital Information System.",
        }, status=status.HTTP_200_OK)

class UndoOutcomeView(APIView):
    def post(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(patient, 'consultation_outcome'):
            patient.consultation_outcome.delete()

        # Log audit entry
        AuditLog.objects.create(
            patient=patient,
            time="Just now",
            title="Consultation Outcome Reverted (Physician Undo)",
            actor="Dr. Anjali Verma (HPR123456)",
            details="Physician reversed recently submitted consultation outcome.",
            badge_color="bg-amber-100 text-amber-800",
            order=0,
        )

        serializer = PatientSummarySerializer(patient)
        return Response({
            "success": True,
            "patient": serializer.data,
            "message": "Consultation outcome reverted.",
        }, status=status.HTTP_200_OK)

class PatientAuditTrailView(APIView):
    def get(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        logs = patient.audit_logs.all()
        if not logs.exists():
            # Populate default standard audit timeline matching 3D.png
            default_logs = [
                {
                    "time": "11:42 AM, 03 Sep 2026",
                    "title": "Consultation Outcome Recorded & Synced",
                    "actor": "Dr. Anjali Verma (HPR123456)",
                    "details": "Outcome type: Treated & Discharged. Pushed to HIS and pharmacy queue.",
                    "badge_color": "bg-emerald-100 text-emerald-800",
                    "order": 1,
                },
                {
                    "time": "10:28 AM, 03 Sep 2026",
                    "title": "Pre-consultation Summary Confirmed & Pushed to HIS",
                    "actor": "Dr. Anjali Verma (HPR123456)",
                    "details": "Physician validated clinical history, verified vitals readings, and signed draft.",
                    "badge_color": "bg-emerald-100 text-emerald-800",
                    "order": 2,
                },
                {
                    "time": "09:14 AM, 03 Sep 2026",
                    "title": "Clinical Summary Structured & Routed to OPD Desk 4",
                    "actor": "MediKiosk Engine (v2.4.1)",
                    "details": f"Structured pre-consultation summary generated and queued for Token {patient.queue_token}.",
                    "badge_color": "bg-blue-100 text-blue-800",
                    "order": 3,
                },
                {
                    "time": "09:12 AM, 03 Sep 2026",
                    "title": "Hardware Sensor Readings Captured & Locked",
                    "actor": "MediKiosk Sensor Suite",
                    "details": "BP: 148/92 mmHg, Pulse: 84 bpm, SpO2: 97 %, Temp: 98.4 °F. Immutable record generated.",
                    "badge_color": "bg-indigo-100 text-indigo-800",
                    "order": 4,
                },
                {
                    "time": "09:10 AM, 03 Sep 2026",
                    "title": "Self-Reported History & Document Scan Completed",
                    "actor": f"{patient.name} (Patient Self-Intake)",
                    "details": "Chief complaint recorded: 'Chest pain since yesterday.' 3 previous records scanned via high-speed kiosk camera.",
                    "badge_color": "bg-slate-100 text-slate-800",
                    "order": 5,
                },
                {
                    "time": "09:08 AM, 03 Sep 2026",
                    "title": "Wristband Scanned / Token Generated",
                    "actor": "MediKiosk Terminal 02",
                    "details": f"Patient registered under UHID {patient.uhid}, ABHA verified and token {patient.queue_token} assigned.",
                    "badge_color": "bg-slate-100 text-slate-800",
                    "order": 6,
                },
            ]
            for l in default_logs:
                AuditLog.objects.create(patient=patient, **l)
            logs = patient.audit_logs.all()

        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
