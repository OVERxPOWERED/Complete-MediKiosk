from rest_framework import serializers
from .models import (
    Patient,
    Vitals,
    ClinicalSummary,
    RedFlag,
    ScannedDocument,
    DocumentAnnotation,
    QueueItem,
)

class RedFlagSerializer(serializers.ModelSerializer):
    badgeLabel = serializers.CharField(source='badge_label')
    badgeType = serializers.CharField(source='badge_type')

    class Meta:
        model = RedFlag
        fields = ['id', 'symptom', 'severity', 'badgeLabel', 'badgeType', 'is_active']

class DocumentAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentAnnotation
        fields = ['id', 'doctor_name', 'note_text', 'created_at']

class ScannedDocumentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='doc_id')
    fileId = serializers.CharField(source='file_id')
    previewUrl = serializers.CharField(source='preview_url')
    pagesList = serializers.JSONField(source='pages_list')
    isFlaggedRescan = serializers.BooleanField(source='is_flagged_rescan')
    annotations = DocumentAnnotationSerializer(many=True, read_only=True)

    class Meta:
        model = ScannedDocument
        fields = [
            'id',
            'doc_type',
            'subtitle',
            'pages',
            'date',
            'time',
            'fileId',
            'source',
            'impression',
            'signatory',
            'preview_url',
            'previewUrl',
            'pagesList',
            'isFlaggedRescan',
            'annotations',
        ]

class PatientSummarySerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    waitTime = serializers.SerializerMethodField()
    queueNumber = serializers.SerializerMethodField()
    arrivedAt = serializers.SerializerMethodField()
    reviewedAt = serializers.SerializerMethodField()
    chief_complaint = serializers.SerializerMethodField()
    history_of_present_illness = serializers.SerializerMethodField()
    past_history = serializers.SerializerMethodField()
    drug_allergy_history = serializers.SerializerMethodField()
    family_history = serializers.SerializerMethodField()
    personal_history = serializers.SerializerMethodField()
    review_of_systems = serializers.SerializerMethodField()
    prior_investigations_summary = serializers.SerializerMethodField()
    vitals = serializers.SerializerMethodField()
    red_flags = serializers.SerializerMethodField()
    ayush = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    consultation_outcome = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'patient',
            'status',
            'waitTime',
            'queueNumber',
            'arrivedAt',
            'reviewedAt',
            'chief_complaint',
            'history_of_present_illness',
            'past_history',
            'drug_allergy_history',
            'family_history',
            'personal_history',
            'review_of_systems',
            'prior_investigations_summary',
            'vitals',
            'red_flags',
            'ayush',
            'documents',
            'consultation_outcome',
        ]

    def get_patient(self, obj):
        return {
            "uhid": obj.uhid,
            "abha_id": obj.abha_id,
            "queue_token": obj.queue_token,
            "name": obj.name,
            "age": obj.age,
            "gender": obj.gender,
            "phone": obj.phone,
            "address": obj.address,
            "photo_url": obj.photo_url or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "attendant": obj.attendant,
            "emergency_contact": {
                "name": obj.emergency_name or "Family Contact",
                "relation": obj.emergency_relation or "Relative",
                "phone": obj.emergency_phone or obj.phone,
            },
        }

    def get_status(self, obj):
        return getattr(obj, 'queue_item', None).status if hasattr(obj, 'queue_item') else 'New'

    def get_waitTime(self, obj):
        return getattr(obj, 'queue_item', None).wait_time if hasattr(obj, 'queue_item') else '5 min'

    def get_queueNumber(self, obj):
        return getattr(obj, 'queue_item', None).queue_number if hasattr(obj, 'queue_item') else 1

    def get_arrivedAt(self, obj):
        return getattr(obj, 'queue_item', None).arrived_at if hasattr(obj, 'queue_item') else '09:12 AM'

    def get_reviewedAt(self, obj):
        return getattr(obj, 'queue_item', None).reviewed_at if hasattr(obj, 'queue_item') else None

    def get_chief_complaint(self, obj):
        return obj.clinical_summary.chief_complaint if hasattr(obj, 'clinical_summary') else ''

    def get_history_of_present_illness(self, obj):
        return obj.clinical_summary.history_of_present_illness if hasattr(obj, 'clinical_summary') else ''

    def get_past_history(self, obj):
        return obj.clinical_summary.past_history if hasattr(obj, 'clinical_summary') else []

    def get_drug_allergy_history(self, obj):
        if hasattr(obj, 'clinical_summary'):
            return {
                "allergy": obj.clinical_summary.allergy_name,
                "reaction": obj.clinical_summary.allergy_reaction,
                "currentMeds": obj.clinical_summary.current_meds,
            }
        return {"allergy": "NKDA", "reaction": "None", "currentMeds": []}

    def get_family_history(self, obj):
        return obj.clinical_summary.family_history if hasattr(obj, 'clinical_summary') else []

    def get_personal_history(self, obj):
        return obj.clinical_summary.personal_history if hasattr(obj, 'clinical_summary') else []

    def get_review_of_systems(self, obj):
        return obj.clinical_summary.review_of_systems if hasattr(obj, 'clinical_summary') else {}

    def get_prior_investigations_summary(self, obj):
        return obj.clinical_summary.prior_investigations_summary if hasattr(obj, 'clinical_summary') else []

    def get_vitals(self, obj):
        if hasattr(obj, 'vitals'):
            v = obj.vitals
            return {
                "blood_pressure": {
                    "value": v.bp_value,
                    "source": v.bp_source,
                    "timestamp": v.bp_timestamp,
                    "isAbnormal": v.bp_is_abnormal,
                },
                "blood_sugar": {
                    "value": v.sugar_value,
                    "source": v.sugar_source,
                    "timestamp": v.sugar_timestamp,
                },
                "blood_group": {
                    "value": v.blood_group_value,
                    "source": v.blood_group_source,
                },
                "spo2": {
                    "value": v.spo2_value,
                    "source": v.spo2_source,
                    "timestamp": v.spo2_timestamp,
                },
                "pulse": {
                    "value": v.pulse_value,
                    "source": v.pulse_source,
                    "timestamp": v.pulse_timestamp,
                },
                "temperature": {
                    "value": v.temp_value,
                    "source": v.temp_source,
                    "timestamp": v.temp_timestamp,
                },
                "weight": {
                    "value": v.weight_value,
                    "source": v.weight_source,
                    "timestamp": v.weight_timestamp,
                },
            }
        return {}

    def get_red_flags(self, obj):
        return RedFlagSerializer(obj.red_flags.all(), many=True).data

    def get_ayush(self, obj):
        if hasattr(obj, 'clinical_summary'):
            cs = obj.clinical_summary
            return {
                "prakriti": cs.prakriti,
                "vikriti": cs.vikriti,
                "agni": cs.agni,
                "koshtha": cs.koshtha,
            }
        return {"prakriti": "Vata-Pitta", "vikriti": "Vata aggravation", "agni": "Madhyama", "koshtha": "Madhyama"}

    def get_documents(self, obj):
        return ScannedDocumentSerializer(obj.documents.all(), many=True).data

    def get_consultation_outcome(self, obj):
        if hasattr(obj, 'consultation_outcome'):
            co = obj.consultation_outcome
            prescriptions = [
                {"id": str(p.id), "name": p.name, "dosage": p.dosage, "duration": p.duration}
                for p in co.prescriptions.all()
            ]
            return {
                "outcome_type": co.outcome_type,
                "clinical_notes": co.clinical_notes,
                "prescriptions": prescriptions,
                "advice": co.advice,
                "follow_up_date": co.follow_up_date,
                "remind_sms": co.remind_sms,
                "referred_specialist": co.referred_specialist,
                "additional_instructions": co.additional_instructions,
                "recorded_at": co.recorded_at,
                "doctor_name": co.doctor_name,
                "pushed_to_his": co.pushed_to_his,
            }
        return None
