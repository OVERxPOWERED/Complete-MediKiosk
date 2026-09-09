export type PatientStatus = 'New' | 'Reviewed';

export interface VitalsReading {
  value: string;
  source: 'kiosk_device' | 'self_reported' | 'scanned_doc';
  timestamp?: string;
  isAbnormal?: boolean;
}

export interface PatientVitals {
  blood_pressure: VitalsReading;
  blood_sugar: VitalsReading;
  blood_group: VitalsReading;
  spo2: VitalsReading;
  pulse: VitalsReading;
  temperature: VitalsReading;
  weight: VitalsReading;
}

export interface RedFlag {
  symptom: string;
  severity: 'Needs attention' | 'Critical';
  badgeLabel?: string;
  badgeType?: 'red' | 'gray';
}

export interface ScannedDocumentPage {
  pageNumber: number;
  imageUrl: string;
  title: string;
}

export interface ScannedDocument {
  id: string;
  doc_type: string;
  subtitle?: string;
  pages: number;
  date: string;
  time: string;
  fileId?: string;
  source?: string;
  previewUrl?: string;
  pagesList?: ScannedDocumentPage[];
  impression?: string;
  signatory?: string;
}

export interface AyushAssessmentData {
  prakriti: string;
  vikriti: string;
  agni: string;
  koshtha: string;
}

export interface PatientDetails {
  photo_url?: string;
  abha_id: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  queue_token: string;
  uhid: string;
  name: string;
  phone: string;
  address?: string;
  attendant?: string;
  emergency_contact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface PatientRecord {
  patient: PatientDetails;
  status: PatientStatus;
  waitTime: string;
  queueNumber: number;
  arrivedAt: string;
  reviewedAt?: string;
  chief_complaint: string;
  history_of_present_illness: string;
  past_history: string[];
  drug_allergy_history: {
    allergy: string;
    reaction: string;
    currentMeds?: string[];
  };
  family_history: string[];
  personal_history: string[];
  review_of_systems: {
    respiratory?: string;
    cardiovascular?: string;
    gastrointestinal?: string;
    others?: string;
  };
  prior_investigations_summary: string[];
  vitals: PatientVitals;
  red_flags: RedFlag[];
  ayush: AyushAssessmentData;
  documents: ScannedDocument[];
  consultation_outcome?: ConsultationOutcomeData;
  missing_field_reasons?: Record<string, string>;
}

export type OutcomeType =
  | 'Treated & Discharged'
  | 'Referred to Specialist'
  | 'Advised Investigation'
  | 'Admitted'
  | 'Follow-up';

export interface PrescribedMedication {
  id: string;
  name: string;
  dosage: string;
  duration: string;
}

export interface ConsultationOutcomeData {
  outcome_type: OutcomeType;
  clinical_notes: string;
  prescriptions: PrescribedMedication[];
  advice: string[];
  follow_up_date?: string;
  remind_sms?: boolean;
  referred_specialist?: string;
  additional_instructions?: string;
  recorded_at: string;
  doctor_name: string;
  pushed_to_his: boolean;
}

export interface DoctorProfile {
  hpr_id: string;
  name: string;
  degrees: string;
  designation: string;
  department: string;
  hospital: string;
  hospital_address: string;
  counter_desk: string;
  timings: string;
  email: string;
  phone: string;
  is_verified_abdm: boolean;
  status: 'Active';
}

export interface SyncAction {
  id: string;
  patient_token: string;
  uhid: string;
  patient_name?: string;
  action_type: 'Patient summary' | 'Outcome (Treated)' | 'Outcome (Referred)' | 'Documents (2 files)' | string;
  timestamp: string;
  status: 'Pending' | 'Synced' | 'Failed';
  details?: string;
}

export interface NoteTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  shortcut?: string;
  order?: number;
}

