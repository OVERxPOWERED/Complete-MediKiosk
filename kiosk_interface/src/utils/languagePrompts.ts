/**
 * Bilingual Clinical Prompts & UI Text Dictionaries (English & Pure Hindi)
 * Provides authentic, empathetic conversational scripts, captions, and complete UI translations for MediKiosk
 */

import { ScreenId, PatientData } from '../types';

export interface ScreenPrompt {
  mascotSpeech: string;
  medikioskCaption: string;
  youCaption: string;
}

export const UI_STRINGS = {
  en: {
    topBar: {
      tagline: "Care Closer to You",
      help: "Help",
      volume: "Volume",
      listening: "Listening...",
      tapToSpeak: "Tap to Speak",
    },
    welcome: {
      title1: "Meet MediKiosk",
      subtitle1: "Your digital pre-consultation hospital assistant.",
      title2: "Tell me how you're feeling",
      subtitle2: "Speak naturally. I'll organize your information for the doctor.",
      title3: "Bring your medical reports",
      subtitle3: "MediKiosk can scan and organize your previous records.",
      title4: "Get your measurements",
      subtitle4: "Blood pressure and other supported measurements can be captured.",
      title5: "Spend your waiting time wisely",
      subtitle5: "Prepare your case before you meet the doctor.",
      title6: "Step closer to begin",
      subtitle6: "Just step closer or tap below.",
      touchToStart: "Touch to Start",
      startPreparation: "Start Preparation",
      changeLanguage: "Change Language",
      accessibility: "Accessibility",
      languageTitle: "Choose your preferred language",
      languageSubtitle: "You can speak or tap in any of these languages",
    },
    consent: {
      badge: "DATA PRIVACY & CONSENT",
      title: "Why we collect this information",
      subtitle: "MediKiosk prepares your case file so Dr. Anjali Verma can provide faster, focused care.",
      card1Title: "Pre-Consultation Summary",
      card1Desc: "Your symptoms are summarized so the doctor can review them beforehand.",
      card2Title: "Vitals & Measurements",
      card2Desc: "Automated blood pressure and pulse readings save consultation time.",
      card3Title: "Previous Medical Records",
      card3Desc: "Scanned prescriptions and lab reports are digitally attached to your visit.",
      card4Title: "Confidential & Encrypted",
      card4Desc: "Your health information is strictly shared only with your treating medical team.",
      btnAgree: "I Agree & Continue",
      btnDisagree: "Do Not Agree",
      btnQuestion: "I Have a Question",
    },
    patientType: {
      badge: "PATIENT IDENTIFICATION",
      title: "Have you visited this hospital before?",
      subtitle: "Say 'Existing' or 'New', or tap your choice below.",
      existingTitle: "Existing Patient",
      existingSubtitle: "I have visited this hospital before and have a Patient ID / Mobile number.",
      newTitle: "New Patient",
      newSubtitle: "This is my first visit to this hospital. Register my new file.",
      enterPhone: "Enter 10-Digit Mobile Number",
      searchRecord: "Searching Patient Record...",
      recordFound: "Patient Record Found!",
      nameLabel: "Patient Name",
      phoneLabel: "Mobile Number",
      mrnLabel: "Hospital ID (MRN)",
      confirmBtn: "Confirm & Proceed",
      photoTitle: "Visit Photo Verification",
      photoSubtitle: "Look straight into the camera for your token verification.",
      captureBtn: "Take Photo",
    },
    clinical: {
      badge: "CLINICAL VOICE INTERVIEW",
      exampleSay: "For example, you can say:",
      example1: '"I have a cold and runny nose" · "कल से सर्दी और ज़ुकाम है" · "Mild cough"',
      chips: [
        "Cold and runny nose",
        "Fever since yesterday",
        "Severe headache",
        "Stomach ache",
        "Routine check-up"
      ],
      tapToSpeakBtn: "Start Speaking (Tap & Speak)",
      listeningWave: "Listening to your voice...",
      orType: "Or type your symptoms below",
      typePlaceholder: "Type symptoms here...",
      confirmBtn: "Confirm & Continue",
      understoodTitle: "Here is what I understood",
      understoodSubtitle: "Please check if this matches what you are feeling:",
      choiceTitle: "Follow-up Health Question",
      choiceSubtitle: "Do you currently have a cough or chest discomfort?",
      choiceYes: "Yes",
      choiceNo: "No",
      redFlagTitle: "Immediate Clinical Attention Required",
      redFlagSubtitle: "Alerting emergency triage staff to attend to you immediately.",
    },
    vitals: {
      badge: "HEALTH MEASUREMENTS",
      title: "Quick Health Measurements",
      subtitle: "Automated desktop cuff and pulse readings for your consultation.",
      skippedTitle: "Measurements Not Needed Today",
      skippedDesc: "Based on your cold symptoms, routine blood pressure measurement is not required.",
      bpTitle: "Blood Pressure",
      bpDesc: "Automated desktop cuff measurement",
      spo2Title: "Pulse & Oxygen (SpO2)",
      spo2Desc: "Infrared fingertip sensor reading",
      beginBtn: "Begin Measurements",
      instructionsTitle: "Blood Pressure Instructions",
      instructionsSubtitle: "Slide your left arm into the cuff and rest your arm flat on the desk.",
      measuringTitle: "Measuring Blood Pressure...",
      measuringSubtitle: "Please remain quiet and relaxed during cuff inflation.",
      secondsLeft: "seconds remaining",
      bpResultTitle: "Blood Pressure Result",
      normalTag: "Optimal Range",
      continueBtn: "Continue",
    },
    documents: {
      badge: "MEDICAL DOCUMENTS",
      title: "Scan Previous Medical Documents",
      subtitle: "Insert past doctor prescriptions, lab test reports, or ECG records.",
      prescriptionsTitle: "Doctor Prescriptions",
      prescriptionsDesc: "Current & past medication history",
      labReportsTitle: "Lab & Diagnostic Reports",
      labReportsDesc: "Blood tests, lipid panels, ECG strips",
      insertGuideTitle: "Insert Document Into Scanner",
      insertGuideSubtitle: "Slide your document face-up into the lit slot below.",
      scanNowBtn: "Scan Document",
      skipBtn: "Skip / No Documents",
      scanningTitle: "Scanning Document...",
      ocrTitle: "Gemini Vision OCR Active",
      ocrSubtitle: "Extracting medication names and clinical impressions...",
      completeTitle: "Document Attached to Chart",
      nextBtn: "Next",
    },
    completion: {
      badge: "CONSULTATION READY",
      preparingTitle: "Synthesizing Clinical Summary...",
      preparingSubtitle: "Compiling your symptoms and sending your intake file to Dr. Anjali Verma.",
      qrTitle: "Your Visit Token is Ready!",
      qrSubtitle: "Show this QR code at the counter or wait for your token to be called.",
      wristbandTitle: "Dispensing Patient Wristband",
      wristbandSubtitle: "Please collect your printed wristband from the dispenser below.",
      allSetTitle: "You're All Set!",
      allSetSubtitle: "Please proceed to Consultation Room 4. Dr. Anjali Verma is ready to see you.",
      finishBtn: "Finish Session",
    }
  },
  hi: {
    topBar: {
      tagline: "स्वास्थ्य सेवा आपके निकट",
      help: "सहायता",
      volume: "ध्वनि",
      listening: "सुन रहा हूँ...",
      tapToSpeak: "बोलने के लिए छुएं",
    },
    welcome: {
      title1: "मेडीकियोस्क में आपका स्वागत है",
      subtitle1: "अस्पताल में परामर्श से पूर्व आपका डिजिटल सहायक।",
      title2: "बताएं आपको क्या तकलीफ है",
      subtitle2: "स्वाभाविक रूप से बोलें। मैं डॉक्टर के लिए आपकी जानकारी संकलित करूँगा।",
      title3: "अपनी पुरानी रिपोर्ट साथ लाएं",
      subtitle3: "मेडीकियोस्क आपके पुराने पर्चे और जांच रिपोर्ट स्कैन कर सकता है।",
      title4: "शारीरिक स्वास्थ्य परीक्षण",
      subtitle4: "रक्तचाप और अन्य आवश्यक परीक्षण आसानी से दर्ज हो जाते हैं।",
      title5: "प्रतीक्षा समय का सदुपयोग",
      subtitle5: "चिकित्सक से मिलने से पहले ही अपनी केस फाइल तैयार करें।",
      title6: "शुरू करने के लिए पास आएं",
      subtitle6: "बस पास आएं या नीचे छुएं।",
      touchToStart: "शुरू करने के लिए छुएं",
      startPreparation: "परामर्श तैयारी शुरू करें",
      changeLanguage: "भाषा बदलें",
      accessibility: "सुलभता",
      languageTitle: "अपनी पसंदीदा भाषा चुनें",
      languageSubtitle: "आप इनमें से किसी भी भाषा में बोल सकते हैं या छू सकते हैं",
    },
    consent: {
      badge: "डेटा गोपनीयता एवं सहमति",
      title: "हम यह जानकारी क्यों एकत्र करते हैं",
      subtitle: "मेडीकियोस्क आपकी केस फाइल तैयार करता है ताकि डॉक्टर अंजलि वर्मा आपको त्वरित व सटीक परामर्श दे सकें।",
      card1Title: "परामर्श पूर्व सारांश",
      card1Desc: "आपके लक्षणों का सारांश ताकि चिकित्सक पहले से आपकी स्थिति समझ सकें।",
      card2Title: "शारीरिक परीक्षण एवं वाइटल्स",
      card2Desc: "स्वचालित रक्तचाप और नाड़ी परीक्षण से परामर्श का समय बचता है।",
      card3Title: "पूर्व चिकित्सा अभिलेख",
      card3Desc: "स्कैन किए गए पर्चे और लैब रिपोर्ट आपके डिजिटल रिकॉर्ड से जुड़ जाते हैं।",
      card4Title: "गोपनीय एवं सुरक्षित",
      card4Desc: "आपकी स्वास्थ्य जानकारी केवल आपके उपचारक चिकित्सा दल के साथ साझा होती है।",
      btnAgree: "मैं सहमत हूँ और आगे बढ़ें",
      btnDisagree: "असहमत हूँ",
      btnQuestion: "मेरा एक प्रश्न है",
    },
    patientType: {
      badge: "मरीज़ पहचान",
      title: "क्या आप पहले इस अस्पताल में आ चुके हैं?",
      subtitle: "'पुराना' या 'नया' बोलें, या नीचे दिए गए विकल्प को छुएं।",
      existingTitle: "पुराने मरीज़",
      existingSubtitle: "मैं पहले इस अस्पताल आ चुका हूँ और मेरे पास मरीज़ आईडी या मोबाइल नंबर है।",
      newTitle: "नए मरीज़",
      newSubtitle: "यह मेरी इस अस्पताल में पहली यात्रा है। मेरा नया पंजीकरण करें।",
      enterPhone: "10 अंकों का मोबाइल नंबर दर्ज करें",
      searchRecord: "मरीज़ रिकॉर्ड खोजा जा रहा है...",
      recordFound: "मरीज़ रिकॉर्ड मिल गया!",
      nameLabel: "मरीज़ का नाम",
      phoneLabel: "मोबाइल नंबर",
      mrnLabel: "अस्पताल आईडी (MRN)",
      confirmBtn: "पुष्टि करें और आगे बढ़ें",
      photoTitle: "मरीज़ फोटो सत्यापन",
      photoSubtitle: "टोकन सत्यापन के लिए कैमरे की ओर सीधे देखें।",
      captureBtn: "फोटो लें",
    },
    clinical: {
      badge: "चिकित्सीय आवाज़ संवाद",
      exampleSay: "उदाहरण के लिए आप कह सकते हैं:",
      example1: '"मुझे सर्दी और ज़ुकाम है" · "कल से हल्का बुखार है" · "सिर में दर्द है"',
      chips: [
        "सर्दी और ज़ुकाम",
        "कल से बुखार",
        "तेज़ सिरदर्द",
        "पेट में दर्द",
        "नियमित स्वास्थ्य जांच"
      ],
      tapToSpeakBtn: "बोलना शुरू करें (माइक दबाएं)",
      listeningWave: "आपकी आवाज़ सुनी जा रही है...",
      orType: "या अपने लक्षण नीचे लिखें",
      typePlaceholder: "यहाँ अपने लक्षण लिखें...",
      confirmBtn: "पुष्टि करें और आगे बढ़ें",
      understoodTitle: "मैंने यह लक्षण दर्ज किए",
      understoodSubtitle: "कृपया जांचें कि क्या यह आपकी स्थिति से मेल खाता है:",
      choiceTitle: "अनुवर्ती स्वास्थ्य प्रश्न",
      choiceSubtitle: "क्या आपको खांसी या सीने में जकड़न महसूस हो रही है?",
      choiceYes: "हाँ",
      choiceNo: "नहीं",
      redFlagTitle: "त्वरित चिकित्सीय ध्यान आवश्यक",
      redFlagSubtitle: "आपातकालीन कर्मचारियों को तुरंत आपके पास भेजा जा रहा है।",
    },
    vitals: {
      badge: "शारीरिक परीक्षण",
      title: "त्वरित स्वास्थ्य परीक्षण",
      subtitle: "परामर्श के लिए स्वचालित रक्तचाप और ऑक्सीजन परीक्षण।",
      skippedTitle: "परीक्षण की आवश्यकता नहीं है",
      skippedDesc: "आपके लक्षणों (सर्दी-ज़ुकाम) के आधार पर नियमित रक्तचाप नापना आवश्यक नहीं है।",
      bpTitle: "रक्तचाप (ब्लड प्रेशर)",
      bpDesc: "स्वचालित कफ द्वारा रक्तचाप मापन",
      spo2Title: "पल्स एवं ऑक्सीजन (SpO2)",
      spo2Desc: "उंगली सेंसर द्वारा ऑक्सीजन जांच",
      beginBtn: "परीक्षण शुरू करें",
      instructionsTitle: "रक्तचाप परीक्षण निर्देश",
      instructionsSubtitle: "अपना बायां हाथ कफ में डालें और मेज पर सीधा रखें।",
      measuringTitle: "रक्तचाप नापा जा रहा है...",
      measuringSubtitle: "कृपया परीक्षण के दौरान शांत और स्थिर रहें।",
      secondsLeft: "सेकंड शेष",
      bpResultTitle: "रक्तचाप परिणाम",
      normalTag: "सामान्य स्तर",
      continueBtn: "आगे बढ़ें",
    },
    documents: {
      badge: "चिकित्सा दस्तावेज़",
      title: "पुराने चिकित्सा दस्तावेज़ स्कैन करें",
      subtitle: "पुराने डॉक्टर के पर्चे, लैब रिपोर्ट या ईसीजी रिकॉर्ड डालें।",
      prescriptionsTitle: "चिकित्सक के पर्चे",
      prescriptionsDesc: "वर्तमान एवं पूर्व दवाइयों का विवरण",
      labReportsTitle: "लैब एवं जांच रिपोर्ट",
      labReportsDesc: "रक्त परीक्षण, लिपिड प्रोफाइल, ईसीजी",
      insertGuideTitle: "दस्तावेज़ स्कैनर में डालें",
      insertGuideSubtitle: "कागज़ को ऊपर की ओर रखते हुए नीचे की स्लॉट में डालें।",
      scanNowBtn: "दस्तावेज़ स्कैन करें",
      skipBtn: "छोड़ें / कोई दस्तावेज़ नहीं",
      scanningTitle: "दस्तावेज़ स्कैन हो रहा है...",
      ocrTitle: "जेमिनी एआई दस्तावेज़ विश्लेषण",
      ocrSubtitle: "पर्चे से दवाइयां और विवरण निकाला जा रहा है...",
      completeTitle: "दस्तावेज़ सफलतापूर्वक चार्ट से जुड़ा",
      nextBtn: "आगे बढ़ें",
    },
    completion: {
      badge: "परामर्श तैयार",
      preparingTitle: "केस सारांश तैयार किया जा रहा है...",
      preparingSubtitle: "आपके लक्षणों का संकलन करके डॉक्टर अंजलि वर्मा को भेजा जा रहा है।",
      qrTitle: "आपका परामर्श टोकन तैयार है!",
      qrSubtitle: "यह क्यूआर कोड काउंटर पर दिखाएं या टोकन पुकारे जाने की प्रतीक्षा करें।",
      wristbandTitle: "मरीज़ रिस्टबैंड निकल रहा है",
      wristbandSubtitle: "कृपया नीचे के स्लॉट से अपना रिस्टबैंड प्राप्त करें।",
      allSetTitle: "सब तैयार है!",
      allSetSubtitle: "कृपया परामर्श कक्ष 4 में जाएं। डॉक्टर अंजलि वर्मा आपका इंतज़ार कर रही हैं।",
      finishBtn: "समाप्त करें",
    }
  }
};

export const getBilingualPrompt = (
  screenId: ScreenId,
  lang: 'en' | 'hi',
  patientData?: PatientData,
  typedComplaint?: string,
  presenceDetected?: boolean,
  bpCountdown?: number,
  phoneInput?: string,
  skipMeasurements?: boolean
): ScreenPrompt => {
  const isHi = lang === 'hi';
  const token = patientData?.token || 'A1044';
  const complaint = typedComplaint || patientData?.chiefComplaint || (isHi ? 'सर्दी और ज़ुकाम' : 'Cold and runny nose');

  switch (screenId) {
    case '00_IDLE':
      return {
        mascotSpeech: isHi
          ? (presenceDetected ? "नमस्ते! कृपया पास आएं या 'शुरू करें' बोलें।" : "चिकित्सक से मिलना चाहते हैं? पास आएं।")
          : (presenceDetected ? "Hello! Step closer or say 'Start' to begin." : "Need to see the doctor? Step closer to begin."),
        medikioskCaption: isHi ? "कियोस्क के पास आएं..." : "Step closer to begin.",
        youCaption: isHi ? "सुन रहा हूँ..." : "Listening..."
      };

    case '01_WELCOME':
      return {
        mascotSpeech: isHi
          ? "मेडीकियोस्क में आपका स्वागत है! कृपया बताएं, आप किस भाषा में बात करना चाहते हैं? हिंदी या अंग्रेज़ी।"
          : "Welcome to MediKiosk! Please tell me, what language do you prefer? Say Hindi or English.",
        medikioskCaption: isHi ? "मेडीकियोस्क में स्वागत है। भाषा चुनें।" : "Welcome to MediKiosk! Say your language.",
        youCaption: isHi ? "'हिंदी' या 'अंग्रेज़ी' कहें" : "Say 'Hindi' or 'English'"
      };

    case '02_LANGUAGE':
      return {
        mascotSpeech: isHi
          ? "कृपया अपनी भाषा चुनें। हिंदी या अंग्रेज़ी कहें।"
          : "Which language would you like to use? Say Hindi or English.",
        medikioskCaption: isHi ? "अपनी भाषा चुनें: हिंदी या अंग्रेज़ी।" : "Select language: Hindi or English.",
        youCaption: isHi ? "'हिंदी' चुनी गई" : "Say 'Hindi' or 'English'"
      };

    case '03_CONSENT':
      return {
        mascotSpeech: isHi
          ? "क्या आप डॉक्टर अंजलि वर्मा के लिए अपने स्वास्थ्य विवरण दर्ज करने की अनुमति देते हैं? हाँ या ना कहें।"
          : "Do you agree to record your health details for Dr. Anjali Verma? Say Yes or No.",
        medikioskCaption: isHi ? "स्वास्थ्य विवरण दर्ज करने की सहमति दें। हाँ या ना कहें।" : "Confirm consent to record health details.",
        youCaption: isHi ? "'हाँ' या 'ना' कहें" : "Say 'Yes' or 'No'"
      };

    case '04_EXISTING_NEW':
      return {
        mascotSpeech: isHi
          ? "क्या आप इस अस्पताल में नए मरीज़ हैं या पुराने मरीज़? नया या पुराना कहें।"
          : "Are you an existing patient or a new patient at this hospital? Say New or Existing.",
        medikioskCaption: isHi ? "नए मरीज़ या पुराने मरीज़? बोलकर बताएं।" : "New patient or existing patient?",
        youCaption: isHi ? "'नया' या 'पुराना' कहें" : "Say 'New' or 'Existing'"
      };

    case '06B_ENTER_PHONE':
      return {
        mascotSpeech: isHi
          ? "कृपया अपना 10 अंकों का मोबाइल नंबर बोलें या कीपैड पर दर्ज करें।"
          : "Please say or enter your 10-digit mobile number on the keypad.",
        medikioskCaption: isHi ? "अपना 10 अंकों का मोबाइल नंबर दर्ज करें।" : "Enter 10-digit mobile number.",
        youCaption: phoneInput || (isHi ? "नंबर बोलें..." : "Say number...")
      };

    case '07_EXISTING_FOUND':
      return {
        mascotSpeech: isHi
          ? "आपका रिकॉर्ड मिल गया है! कृपया अपने विवरण जांचें, और पुष्टि के लिए 'हाँ' कहें।"
          : "I found your record! Please check if your details match, and say 'Yes' to confirm.",
        medikioskCaption: isHi ? "मरीज़ रिकॉर्ड मिल गया। पुष्टि के लिए 'हाँ' कहें।" : "Patient record found! Say 'Yes' to confirm.",
        youCaption: isHi ? "'हाँ' बोलकर पुष्टि करें" : "Say 'Yes' to confirm"
      };

    case '14_PHOTO_CAPTURE':
      return {
        mascotSpeech: isHi
          ? "कृपया कैमरे की ओर सीधे देखें। अपनी फोटो लेने के लिए 'तैयार' कहें।"
          : "Please look straight into the camera. Say 'Ready' to take your visit photo.",
        medikioskCaption: isHi ? "कैमरे में देखें। 'तैयार' बोलें।" : "Look at the camera. Say 'Ready'.",
        youCaption: isHi ? "'तैयार' कहें" : "Say 'Ready'"
      };

    case '15_CLINICAL_CONVERSATION':
      return {
        mascotSpeech: isHi
          ? "कृपया बताएं आज आपको क्या तकलीफ या बीमारी महसूस हो रही है? अपनी स्वाभाविक आवाज़ में बताएं।"
          : "Please tell me what symptoms or health problems you are experiencing today. Speak naturally in your own words.",
        medikioskCaption: isHi ? "अपनी तकलीफ या लक्षण बताएं।" : "Describe what brings you here today.",
        youCaption: isHi ? "बोलना शुरू करें..." : "Speak now..."
      };

    case '16_LISTENING':
      return {
        mascotSpeech: isHi
          ? "मैं आपको ध्यान से सुन रहा हूँ... कृपया बताएं आपको कैसा लग रहा है।"
          : "I am listening to you... Take your time and describe what you are feeling.",
        medikioskCaption: isHi ? "आपकी आवाज़ सुनी जा रही है..." : "Listening to your voice...",
        youCaption: complaint
      };

    case '17_PROCESSING':
      return {
        mascotSpeech: isHi
          ? "धन्यवाद! आपके लक्षणों का विश्लेषण किया जा रहा है।"
          : "Thank you! I am now analyzing and structuring your clinical information.",
        medikioskCaption: isHi ? "लक्षणों का विश्लेषण जारी है..." : "Structuring clinical symptoms...",
        youCaption: isHi ? "विश्लेषण जारी..." : "Analyzing..."
      };

    case '18_I_HEARD_CONFIRM':
      if (skipMeasurements) {
        return {
          mascotSpeech: isHi
            ? `मैंने यह समझा: "${complaint}"। आपके लक्षणों (सर्दी-ज़ुकाम) के लिए रक्तचाप नापने की आवश्यकता नहीं है। पुष्टि के लिए 'हाँ' कहें।`
            : `I understood: "${complaint}". Based on your cold symptoms, routine blood pressure measurement is not needed today. Say 'Yes' to proceed.`,
          medikioskCaption: isHi ? `समझ आया: "${complaint}" (रक्तचाप जांच आवश्यक नहीं)` : `Understood: "${complaint}" (Vitals not needed)`,
          youCaption: isHi ? "'हाँ' बोलकर पुष्टि करें" : "Say 'Yes' to confirm"
        };
      }
      return {
        mascotSpeech: isHi
          ? `मैंने यह समझा: "${complaint}"। क्या यह सही है? 'हाँ' कहें।`
          : `Here is what I understood: "${complaint}". Please check if this is accurate, and say 'Yes' to proceed.`,
        medikioskCaption: isHi ? `समझ आया: "${complaint}"` : `I understood: "${complaint}"`,
        youCaption: isHi ? "'हाँ' बोलकर पुष्टि करें" : "Say 'Yes' to confirm"
      };

    case '20_CHOICE_QUESTION':
      return {
        mascotSpeech: isHi
          ? "क्या आपको खांसी या सीने में जकड़न महसूस हो रही है? हाँ या ना कहें।"
          : "Do you currently have a cough or chest discomfort? Say Yes or No.",
        medikioskCaption: isHi ? "क्या खांसी या सीने में दर्द है? हाँ या ना कहें।" : "Do you have cough or chest tightness?",
        youCaption: isHi ? "'हाँ' या 'ना' कहें" : "Say 'Yes' or 'No'"
      };

    case '23_RED_FLAG':
      return {
        mascotSpeech: isHi
          ? "आपके लक्षणों पर तुरंत चिकित्सक का ध्यान आवश्यक है। आपातकालीन कर्मचारियों को सूचित कर दिया गया है।"
          : "Your symptoms need prompt attention. The triage staff has been notified.",
        medikioskCaption: isHi ? "आपातकालीन अलर्ट! मेडिकल स्टाफ सूचित।" : "Red-flag alert! Triage staff notified.",
        youCaption: isHi ? "स्टाफ आ रहा है" : "Staff alerted"
      };

    case '24_MEASUREMENTS_INTRO':
      return {
        mascotSpeech: isHi
          ? "अब हम आपके कुछ सरल शारीरिक परीक्षण करेंगे। तैयार होने पर 'शुरू करें' कहें।"
          : "Now let's take a few quick, painless measurements. Say 'Start' when you are seated.",
        medikioskCaption: isHi ? "शारीरिक परीक्षण निर्देश। 'शुरू करें' बोलें।" : "Vitals measurement guide.",
        youCaption: isHi ? "'शुरू करें' कहें" : "Say 'Start'"
      };

    case '25_BP_INSTRUCTIONS':
      return {
        mascotSpeech: isHi
          ? "आइए आपका रक्तचाप नापें। तैयार होने पर 'शुरू करें' कहें।"
          : "Let's check your blood pressure. Say 'Start' when ready.",
        medikioskCaption: isHi ? "रक्तचाप जांच निर्देश। 'शुरू करें' बोलें।" : "BP instructions. Say 'Start'.",
        youCaption: isHi ? "'शुरू करें' कहें" : "Say 'Start'"
      };

    case '26_BP_POSITIONING':
      return {
        mascotSpeech: isHi
          ? "चित्र के अनुसार अपना हाथ कफ में डालें, और 'नापें' कहें।"
          : "Slide your arm into the desk cuff as shown in the diagram, and say 'Measure'.",
        medikioskCaption: isHi ? "कफ में हाथ डालें और 'नापें' बोलें।" : "Slide arm in cuff. Say 'Measure'.",
        youCaption: isHi ? "'नापें' कहें" : "Say 'Measure'"
      };

    case '27_BP_MEASURING':
      return {
        mascotSpeech: isHi
          ? "आपका रक्तचाप नापा जा रहा है... कृपया शांत और स्थिर रहें।"
          : "Measuring your blood pressure... Please remain quiet and relaxed.",
        medikioskCaption: isHi ? `रक्तचाप मापन जारी... ${bpCountdown ?? 24} सेकंड शेष` : `Reading BP... ${bpCountdown ?? 24}s left`,
        youCaption: isHi ? "शांत रहें..." : "Measuring..."
      };

    case '28_BP_RESULT':
      return {
        mascotSpeech: isHi
          ? "आपका रक्तचाप सामान्य है, 118 और 76। आगे बढ़ने के लिए 'आगे' कहें।"
          : "Your blood pressure is normal at 118 over 76. Say 'Next' to continue.",
        medikioskCaption: isHi ? "रक्तचाप परिणाम: 118/76 mmHg (सामान्य)" : "BP result: 118/76 mmHg (Normal)",
        youCaption: isHi ? "'आगे' कहें" : "Say 'Next'"
      };

    case '29_SPO2_MEASUREMENT':
      return {
        mascotSpeech: isHi
          ? "आपका ऑक्सीजन स्तर 98 प्रतिशत है, जो उत्तम है। आगे बढ़ने के लिए 'आगे' कहें।"
          : "Your oxygen saturation is optimal at 98 percent. Say 'Next' to proceed.",
        medikioskCaption: isHi ? "ऑक्सीजन स्तर: 98% · नाड़ी: 72 bpm" : "SpO2: 98% · Pulse: 72 bpm",
        youCaption: isHi ? "'आगे' कहें" : "Say 'Next'"
      };

    case '30_DOCUMENT_INTRO':
      return {
        mascotSpeech: isHi
          ? "यदि आपके पास पुराने डॉक्टर के पर्चे या जांच रिपोर्ट हैं, तो 'स्कैन' कहें, या 'छोड़ें' कहें।"
          : "If you brought previous doctor prescriptions or lab reports, say 'Scan', or say 'Skip'.",
        medikioskCaption: isHi ? "पुराने पर्चे या टेस्ट रिपोर्ट स्कैन करें। 'स्कैन' या 'छोड़ें' कहें।" : "Scan past prescriptions or reports.",
        youCaption: isHi ? "'स्कैन' या 'छोड़ें' कहें" : "Say 'Scan' or 'Skip'"
      };

    case '31_PLACE_DOCUMENT':
      return {
        mascotSpeech: isHi
          ? "कृपया दस्तावेज़ को स्कैनर स्लॉट में रखें और 'स्कैन' कहें।"
          : "Please slide your document face-up into the scanner slot and say 'Scan'.",
        medikioskCaption: isHi ? "दस्तावेज़ स्कैनर में रखें और 'स्कैन' कहें।" : "Place document in slot. Say 'Scan'.",
        youCaption: isHi ? "'स्कैन' कहें" : "Say 'Scan'"
      };

    case '32_SCANNING_BACKGROUND':
      return {
        mascotSpeech: isHi
          ? "दस्तावेज़ की स्कैनिंग चल रही है।"
          : "Scanning your document in the background. Optical capture active.",
        medikioskCaption: isHi ? "दस्तावेज़ स्कैनिंग जारी..." : "Document scanning in progress...",
        youCaption: isHi ? "स्कैन हो रहा है..." : "Scanning..."
      };

    case '34_OCR_PROCESSING':
      return {
        mascotSpeech: isHi
          ? "जेमिनी एआई पर्चे से दवाइयों और जांच का विवरण निकाल रहा है।"
          : "Gemini AI is parsing your document and extracting medications.",
        medikioskCaption: isHi ? "जेमिनी एआई दवाइयों का विवरण निकाल रहा है..." : "Gemini OCR extracting clinical data...",
        youCaption: isHi ? "विवरण निकाला जा रहा है..." : "Processing..."
      };

    case '36_DOCUMENT_COMPLETE':
      return {
        mascotSpeech: isHi
          ? "आपके दस्तावेज़ सफलतापूर्वक स्कैन हो गए हैं! आगे बढ़ने के लिए 'आगे' कहें।"
          : "All documents have been scanned and attached to your chart! Say 'Next'.",
        medikioskCaption: isHi ? "दस्तावेज़ सफलतापूर्वक चार्ट में जुड़ गए।" : "Documents attached to medical chart.",
        youCaption: isHi ? "'आगे' कहें" : "Say 'Next'"
      };

    case '37_PREPARING_CASE':
      return {
        mascotSpeech: isHi
          ? "आपकी पूरी रिपोर्ट तैयार करके डॉक्टर अंजलि वर्मा को भेजी जा रही है।"
          : "Synthesizing your consultation summary and sending it to Dr. Anjali Verma.",
        medikioskCaption: isHi ? "केस समरी तैयार करके डॉक्टर को भेजी जा रही है..." : "Sending summary to Dr. Anjali Verma...",
        youCaption: isHi ? "भेजा जा रहा है..." : "Sending..."
      };

    case '38_CASE_READY':
      return {
        mascotSpeech: isHi ? "आपकी फाइल पूरी तरह तैयार है!" : "Your clinical intake is ready!",
        medikioskCaption: isHi ? "केस फाइल तैयार है।" : "Case file ready.",
        youCaption: isHi ? "तैयार" : "Ready"
      };

    case '39_VISIT_QR':
      return {
        mascotSpeech: isHi
          ? `आपका परामर्श टोकन नंबर ${token} के साथ तैयार है!`
          : `Your visit QR code is created with token #${token}!`,
        medikioskCaption: isHi ? `टोकन नंबर #${token}` : `Queue Token #${token}`,
        youCaption: isHi ? "टोकन जनरेट हुआ" : "Token generated"
      };

    case '40_WRISTBAND_PRINTING':
    case '41_COLLECT_WRISTBAND':
      return {
        mascotSpeech: isHi
          ? "आपका मेडिकल रिस्टबैंड निकल रहा है। कृपया नीचे के स्लॉट से इसे ले लें।"
          : "Dispensing your triage wristband. Please collect it from the slot below.",
        medikioskCaption: isHi ? "स्लॉट से अपना रिस्टबैंड प्राप्त करें।" : "Collect your printed wristband.",
        youCaption: isHi ? "रिस्टबैंड ले लें" : "Collect wristband"
      };

    case '42_ALL_SET':
      return {
        mascotSpeech: isHi
          ? "सब तैयार है! कृपया परामर्श कक्ष 4 में जाएं। डॉक्टर अंजलि वर्मा आपका इंतज़ार कर रही हैं।"
          : "You're all set! Please proceed to Consultation Room 4.",
        medikioskCaption: isHi ? "परामर्श कक्ष 4 में जाएं।" : "Proceed to Consultation Room 4.",
        youCaption: isHi ? "कक्ष 4 जाएं" : "Room 4"
      };

    case '43_SESSION_COMPLETE':
      return {
        mascotSpeech: isHi
          ? "मेडीकियोस्क का उपयोग करने के लिए धन्यवाद! हम आपके शीघ्र स्वस्थ होने की कामना करते हैं।"
          : "Thank you for using MediKiosk! Wishing you a speedy recovery.",
        medikioskCaption: isHi ? "धन्यवाद! जल्द स्वस्थ हों।" : "Thank you! Get well soon.",
        youCaption: isHi ? "पूर्ण" : "Complete"
      };

    default:
      return {
        mascotSpeech: isHi
          ? "मैं डॉक्टर अंजलि वर्मा के लिए आपकी तैयारी में मदद कर रहा हूँ।"
          : "I am here to help you get ready for Dr. Anjali Verma.",
        medikioskCaption: isHi ? "मेडीकियोस्क आपकी सेवा में तैयार है।" : "MediKiosk assistant is ready to help.",
        youCaption: isHi ? "सुन रहा हूँ..." : "Listening..."
      };
  }
};
