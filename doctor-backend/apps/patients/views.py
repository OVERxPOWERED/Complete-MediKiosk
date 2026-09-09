from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.db import transaction
from datetime import datetime
from .models import (
    Patient,
    Vitals,
    ClinicalSummary,
    RedFlag,
    ScannedDocument,
    DocumentAnnotation,
    QueueItem,
)
from apps.consultations.models import AuditLog
from .serializers import (
    PatientSummarySerializer,
    ScannedDocumentSerializer,
    DocumentAnnotationSerializer,
)

class QueueListView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip().lower()
        status_filter = request.query_params.get('status', 'all')
        sort_by = request.query_params.get('sort_by', 'queue')

        patients = Patient.objects.all().select_related('vitals', 'clinical_summary', 'queue_item').prefetch_related('red_flags', 'documents')

        if query:
            patients = patients.filter(
                Q(name__icontains=query) |
                Q(queue_token__icontains=query) |
                Q(uhid__icontains=query) |
                Q(clinical_summary__chief_complaint__icontains=query)
            )

        if status_filter in ['New', 'Reviewed']:
            patients = patients.filter(queue_item__status=status_filter)

        # Sorting
        if sort_by == 'wait':
            patients = patients.order_by('queue_item__queue_number')
        elif sort_by == 'priority':
            patients = patients.order_by('-red_flags__is_active', 'queue_item__queue_number').distinct()
        else:
            patients = patients.order_by('queue_item__queue_number')

        serializer = PatientSummarySerializer(patients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ScanPatientView(APIView):
    def post(self, request):
        token_input = (request.data.get('token') or request.data.get('queue_token') or '').strip()
        if not token_input:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Extract token if formatted like URL or full string
        clean_token = token_input
        if '/' in token_input:
            clean_token = token_input.split('/')[-1]

        patient = Patient.objects.filter(
            Q(queue_token__iexact=clean_token) | Q(uhid__iexact=clean_token)
        ).first()

        if not patient:
            return Response({
                "success": False,
                "error": f"Patient with identifier '{token_input}' not found in current clinic registry.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientSummarySerializer(patient)
        return Response({
            "success": True,
            "patient": serializer.data,
            "message": f"Wristband {patient.queue_token} Scanned Successfully. {patient.name} added to Just Scanned.",
        }, status=status.HTTP_200_OK)

class PatientSummaryDetailView(APIView):
    def get(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientSummarySerializer(patient)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        patient_data = data.get('patient', {})
        vitals_data = data.get('vitals', {})

        # 1. Update demographics (except locked UHID & ABHA)
        if 'name' in patient_data:
            patient.name = patient_data['name']
        if 'age' in patient_data:
            patient.age = int(patient_data['age'])
        if 'gender' in patient_data:
            patient.gender = patient_data['gender']
        if 'phone' in patient_data:
            patient.phone = patient_data['phone']
        if 'address' in patient_data:
            patient.address = patient_data['address']

        emergency = patient_data.get('emergency_contact', {})
        if emergency:
            if 'name' in emergency:
                patient.emergency_name = emergency['name']
            if 'phone' in emergency:
                patient.emergency_phone = emergency['phone']
            if 'relation' in emergency:
                patient.emergency_relation = emergency['relation']
        patient.save()

        # 2. Update editable blood group (Device vitals remain locked!)
        if 'blood_group' in vitals_data and hasattr(patient, 'vitals'):
            bg = vitals_data['blood_group'].get('value') if isinstance(vitals_data['blood_group'], dict) else vitals_data['blood_group']
            if bg:
                patient.vitals.blood_group_value = bg
                patient.vitals.save()

        # 3. Update clinical summary
        cs, _ = ClinicalSummary.objects.get_or_create(patient=patient)
        if 'chief_complaint' in data:
            cs.chief_complaint = data['chief_complaint']
        if 'history_of_present_illness' in data:
            cs.history_of_present_illness = data['history_of_present_illness']
        if 'past_history' in data:
            cs.past_history = data['past_history'] if isinstance(data['past_history'], list) else [data['past_history']]
        
        drug_data = data.get('drug_allergy_history', {})
        if drug_data:
            if 'allergy' in drug_data:
                cs.allergy_name = drug_data['allergy']
            if 'reaction' in drug_data:
                cs.allergy_reaction = drug_data['reaction']
            if 'currentMeds' in drug_data:
                cs.current_meds = drug_data['currentMeds']

        if 'family_history' in data:
            cs.family_history = data['family_history']
        if 'personal_history' in data:
            cs.personal_history = data['personal_history']
        if 'review_of_systems' in data:
            cs.review_of_systems = data['review_of_systems']
        if 'prior_investigations_summary' in data:
            cs.prior_investigations_summary = data['prior_investigations_summary']

        ayush_data = data.get('ayush', {})
        if ayush_data:
            if 'prakriti' in ayush_data:
                cs.prakriti = ayush_data['prakriti']
            if 'vikriti' in ayush_data:
                cs.vikriti = ayush_data['vikriti']
            if 'agni' in ayush_data:
                cs.agni = ayush_data['agni']
            if 'koshtha' in ayush_data:
                cs.koshtha = ayush_data['koshtha']

        cs.save()

        # Log audit entry
        AuditLog.objects.create(
            patient=patient,
            time="Just now",
            title="Clinical Summary Updated by Physician",
            actor="Dr. Anjali Verma (HPR123456)",
            details="Physician edited pre-consultation draft summary before confirmation.",
            badge_color="bg-blue-100 text-blue-800",
            order=2,
        )

        serializer = PatientSummarySerializer(patient)
        return Response({
            "success": True,
            "patient": serializer.data,
            "message": "Patient summary successfully updated in HIS database.",
        }, status=status.HTTP_200_OK)

class ConfirmAndPushHisView(APIView):
    def post(self, request, token):
        patient = Patient.objects.filter(
            Q(queue_token__iexact=token) | Q(uhid__iexact=token)
        ).first()

        if not patient:
            return Response({"error": f"Patient '{token}' not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update queue item status to Reviewed
        queue_item, _ = QueueItem.objects.get_or_create(patient=patient)
        queue_item.status = 'Reviewed'
        queue_item.reviewed_at = '10:28 AM, 03 Sep 2026'
        queue_item.save()

        # Deactivate red flag alerts for active queue
        patient.red_flags.all().update(is_active=False)

        # Add Audit log
        AuditLog.objects.create(
            patient=patient,
            time="10:28 AM, 03 Sep 2026",
            title="Pre-consultation Summary Confirmed & Pushed to HIS",
            actor="Dr. Anjali Verma (HPR123456)",
            details="Physician verified clinical history, validated vitals readings, and signed final draft.",
            badge_color="bg-emerald-100 text-emerald-800",
            order=1,
        )

        serializer = PatientSummarySerializer(patient)
        return Response({
            "success": True,
            "patient": serializer.data,
            "message": f"Summary for {patient.name} confirmed and pushed to Hospital Information System.",
        }, status=status.HTTP_200_OK)

class DocumentAnnotationView(APIView):
    def post(self, request, doc_id):
        doc = ScannedDocument.objects.filter(doc_id=doc_id).first()
        if not doc:
            return Response({"error": f"Document '{doc_id}' not found"}, status=status.HTTP_404_NOT_FOUND)

        note_text = request.data.get('note_text', '').strip()
        doctor_name = request.data.get('doctor_name', 'Dr. Anjali Verma')
        if not note_text:
            return Response({"error": "Note text is required"}, status=status.HTTP_400_BAD_REQUEST)

        annotation = DocumentAnnotation.objects.create(
            document=doc,
            doctor_name=doctor_name,
            note_text=note_text,
        )
        return Response({
            "success": True,
            "annotation": DocumentAnnotationSerializer(annotation).data,
            "message": "Doctor observation saved to document record.",
        }, status=status.HTTP_201_CREATED)

class FlagDocumentRescanView(APIView):
    def post(self, request, doc_id):
        doc = ScannedDocument.objects.filter(doc_id=doc_id).first()
        if not doc:
            return Response({"error": f"Document '{doc_id}' not found"}, status=status.HTTP_404_NOT_FOUND)

        doc.is_flagged_rescan = not doc.is_flagged_rescan
        doc.save()
        return Response({
            "success": True,
            "doc_id": doc.doc_id,
            "is_flagged_rescan": doc.is_flagged_rescan,
            "message": f"Document {'flagged for rescan' if doc.is_flagged_rescan else 'unflagged'}.",
        }, status=status.HTTP_200_OK)

class PatientIntakeView(APIView):
    @transaction.atomic
    def post(self, request):
        data = request.data
        name = (data.get('name') or 'Rahul Sharma').strip()
        try:
            age = int(data.get('age', 22))
        except (ValueError, TypeError):
            age = 22
        gender = (data.get('gender') or 'Male').strip()
        phone = (data.get('phone') or '+91 98765 43210').strip()
        uhid = (data.get('uhid') or f"HSP{datetime.now().strftime('%m%d%H%M')}").strip()
        abha_id = (data.get('abha_id') or '91-4521-8890-1234').strip()

        # Generate or honor unique queue token
        incoming_token = (data.get('token') or data.get('queue_token') or '').strip()
        if not incoming_token:
            incoming_token = f"A{Patient.objects.count() + 1050}"
        
        token = incoming_token
        # Prevent collision with existing tokens
        existing = Patient.objects.filter(queue_token=token).first()
        if existing and existing.uhid != uhid:
            token = f"A{Patient.objects.count() + 1052}"

        patient, created = Patient.objects.get_or_create(
            uhid=uhid,
            defaults={
                'name': name,
                'age': age,
                'gender': gender,
                'phone': phone,
                'queue_token': token,
                'abha_id': abha_id,
                'address': data.get('address', 'Bengaluru, Karnataka'),
                'attendant': 'Self'
            }
        )
        if not created:
            patient.name = name
            patient.age = age
            patient.gender = gender
            patient.phone = phone
            patient.queue_token = token
            patient.save()

        # Vitals
        v_data = data.get('vitals', {})
        vitals, _ = Vitals.objects.get_or_create(patient=patient)
        vitals.bp_value = v_data.get('bp_value', '118/76 mmHg')
        vitals.bp_source = v_data.get('bp_source', 'kiosk_device')
        vitals.bp_timestamp = v_data.get('bp_timestamp', f"Kiosk · {datetime.now().strftime('%I:%M %p')}")
        vitals.spo2_value = v_data.get('spo2_value', '98%')
        vitals.spo2_source = 'kiosk_device'
        vitals.pulse_value = v_data.get('pulse_value', '72 bpm')
        vitals.pulse_source = 'kiosk_device'
        vitals.temp_value = v_data.get('temp_value', '98.6 °F')
        vitals.blood_group_value = v_data.get('blood_group_value', 'B+')
        vitals.save()

        # Clinical Summary & AYUSH
        ayush_data = data.get('ayush', {})
        summary, _ = ClinicalSummary.objects.get_or_create(patient=patient)
        summary.chief_complaint = data.get('chief_complaint', 'Fever and headache since yesterday')
        summary.history_of_present_illness = data.get('history_of_present_illness', 'Low-grade fever with dull frontal headache for ~24 hours.')
        summary.prakriti = ayush_data.get('prakriti', 'Vata-Pitta')
        summary.agni = ayush_data.get('agni', 'Mandagni')
        summary.koshtha = ayush_data.get('koshtha', 'Madhyama')
        summary.save()

        # Queue item (New patient in Dr. Anjali's queue)
        q_count = QueueItem.objects.count() + 1
        queue_item, _ = QueueItem.objects.get_or_create(
            patient=patient,
            defaults={
                'status': 'New',
                'queue_number': q_count,
                'wait_time': '5 min',
                'arrived_at': datetime.now().strftime('%I:%M %p')
            }
        )
        queue_item.status = 'New'
        queue_item.queue_number = q_count
        queue_item.arrived_at = datetime.now().strftime('%I:%M %p')
        queue_item.save()

        # Red flags
        red_flags_input = data.get('red_flags', [])
        if red_flags_input:
            RedFlag.objects.filter(patient=patient).delete()
            for rf in red_flags_input:
                RedFlag.objects.create(
                    patient=patient,
                    symptom=rf.get('symptom', 'Frontal headache with fever'),
                    severity=rf.get('severity', 'Low-Medium (Monitor neurological signs)'),
                    badge_label='Clinical Triage',
                    badge_type=rf.get('badge_type', 'amber'),
                    is_active=True
                )

        # Scanned Documents
        docs_input = data.get('documents', [])
        for doc in docs_input:
            ScannedDocument.objects.get_or_create(
                patient=patient,
                doc_id=doc.get('doc_id', f"DOC-{patient.id}"),
                defaults={
                    'doc_type': doc.get('doc_type', 'Doctor Prescription (Prior Visit)'),
                    'subtitle': doc.get('subtitle', 'Scanned at MediKiosk'),
                    'pages': doc.get('pages', 1),
                    'date': doc.get('date', 'Today'),
                    'impression': doc.get('impression', 'Document collected during pre-consultation intake.'),
                    'signatory': doc.get('signatory', 'Treating Physician'),
                    'source': 'MediKiosk (Patient Scan)'
                }
            )

        # AuditLog
        AuditLog.objects.create(
            patient=patient,
            time=datetime.now().strftime('%I:%M %p, %d %b %Y'),
            title="Kiosk Pre-Consultation Intake Completed",
            actor="MediKiosk Hardware Station",
            details=f"Patient intake completed at Kiosk. Token #{token} assigned. Vitals captured from hardware devices.",
            badge_color="bg-emerald-100 text-emerald-800",
            order=1
        )

        return Response({
            "success": True,
            "message": f"Patient {patient.name} intake registered and added to Dr. Anjali's queue.",
            "queue_token": token,
            "uhid": patient.uhid,
            "patient_id": patient.id
        }, status=status.HTTP_201_CREATED)

