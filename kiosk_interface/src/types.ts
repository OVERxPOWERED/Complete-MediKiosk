export type ScreenId = 
  | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9' | 's10'
  | 's11' | 's12' | 's13' | 's14' | 's15' | 's16' | 's17' | 's18' | 's19' | 's20'
  | 's21' | 's22' | 's23' | 's24' | 's25' | 's26' | 's27' | 's28' | 's29' | 's30'
  | 's31' | 's32' | 's33' | 's34' | 's35' | 's36' | 's37' | 's38' | 's39' | 's40'
  | 's41' | 's42' | 's43' | 's44' | 's45' | 's46' | 's47' | 's48' | 's49' | 's50'
  | 's51'
  // Legacy aliases for backward compatibility
  | '00_IDLE'
  | '01_WELCOME'
  | '02_LANGUAGE'
  | '03_CONSENT'
  | '04_EXISTING_NEW'
  | '05_NEW_PATIENT_RECORD'
  | '06A_IDENTIFY_EXISTING'
  | '06B_ENTER_PHONE'
  | '06C_SEARCHING'
  | '07_EXISTING_FOUND'
  | '08_IDENTIFICATION_FAILED'
  | '09_NAME_INPUT'
  | '10_AGE_INPUT'
  | '11_GENDER_INPUT'
  | '12_PHONE_INPUT'
  | '13_PROFILE_CONFIRM'
  | '14_PHOTO_CAPTURE'
  | '14A_OUT_OF_FRAME'
  | '15_CLINICAL_CONVERSATION'
  | '16_LISTENING'
  | '17_PROCESSING'
  | '18_I_HEARD_CONFIRM'
  | '19_TOUCH_INPUT'
  | '20_CHOICE_QUESTION'
  | '21_RETRY_UNCLEAR'
  | '22_UNKNOWN_NOT_SURE'
  | '23_RED_FLAG'
  | '24_MEASUREMENTS_INTRO'
  | '25_BP_INSTRUCTIONS'
  | '26_BP_POSITIONING'
  | '27_BP_MEASURING'
  | '28_BP_RESULT'
  | '29_SPO2_MEASUREMENT'
  | '30_DOCUMENT_INTRO'
  | '31_PLACE_DOCUMENT'
  | '32_SCANNING_BACKGROUND'
  | '33_DOCUMENT_SCANNED'
  | '34_OCR_PROCESSING'
  | '35_DOCUMENT_PROBLEM'
  | '36_DOCUMENT_COMPLETE'
  | '37_PREPARING_CASE'
  | '38_CASE_READY'
  | '39_VISIT_QR'
  | '40_WRISTBAND_PRINTING'
  | '41_COLLECT_WRISTBAND'
  | '42_ALL_SET'
  | '43_SESSION_COMPLETE'
  | '44_RESET';

export interface PatientVitals {
  bp: string;
  bpSource: string;
  spo2: string;
  pulse: string;
  bloodGroup: string;
  temp?: string;
  weight?: string;
}

export interface AyushAssessment {
  prakriti: string;
  agni: string;
  koshtha: string;
  vikriti?: string;
}

export interface RedFlagItem {
  symptom: string;
  severity: string;
  badgeType?: 'red' | 'amber';
}

export interface ScannedDocItem {
  docId: string;
  docType: string;
  subtitle: string;
  pages: number;
  date: string;
  impression: string;
  signatory: string;
  previewUrl?: string;
}

export interface PatientData {
  name: string;
  age: number;
  gender: string;
  phone: string;
  uhid: string;
  abha: string;
  address: string;
  token: string;
  chiefComplaint: string;
  hpi: string;
  allergies?: string;
  vitals: PatientVitals;
  ayush: AyushAssessment;
  redFlags: RedFlagItem[];
  documents?: ScannedDocItem[];
}
