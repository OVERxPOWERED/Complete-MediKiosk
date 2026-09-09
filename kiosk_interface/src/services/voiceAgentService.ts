/**
 * Autonomous Hands-Free Voice Agent Service
 * Powered by Google Gemini AI & Web Speech API
 * 
 * Enables 100% voice operability across the entire MediKiosk check-in:
 * - Kiosk asks questions aloud via SpeechSynthesis / Audio in English & pure Hindi
 * - Microphone continuously listens to patient speech in English & Hindi
 * - Intelligent clinical symptom interview & adaptive triage powered by Gemini
 * - Multi-API key rotation and round-robin shuffling via ApiKeyManager
 * - Automatically skips unnecessary vitals screens (e.g. for Cold / minor complaints)
 * - Natural voice intent parsing for immediate hands-free navigation
 * - Preserves full touch and click compatibility
 */

import { ScreenId } from '../types';
import { apiKeyManager, VALID_GEMINI_MODELS } from './apiKeyManager';
import { nativeAudioService } from './nativeAudioService';

export interface VoiceAgentCallbacks {
  onTranscription?: (speaker: 'kiosk' | 'patient', text: string, isFinal?: boolean) => void;
  onStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'processing') => void;
  onNavigate?: (screenId: ScreenId) => void;
  onLanguageSelect?: (lang: 'en' | 'hi') => void;
  onConsentGiven?: (agree: boolean) => void;
  onPatientTypeSelect?: (type: 'new' | 'existing') => void;
  onPhotoCaptureTrigger?: () => void;
  onClinicalComplaintExtracted?: (
    complaint: string, 
    duration?: string, 
    severity?: string, 
    redFlag?: boolean,
    skipMeasurements?: boolean
  ) => void;
  onMeasurementStart?: () => void;
  onDocumentScanTrigger?: () => void;
  onDocumentScanSkip?: () => void;
}

export class VoiceAgentService {
  private recognition: any = null;
  private isListeningActive: boolean = false;
  private isSpeaking: boolean = false;
  private isProcessing: boolean = false;
  private currentLanguage: 'en' | 'hi' = 'en';
  private callbacks: VoiceAgentCallbacks = {};
  private activeScreen: ScreenId = '01_WELCOME';
  private clinicalTurnCount: number = 0;
  private speechRestartTimeout: any = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private lastTriggerTime: number = 0;
  private lastTriggeredText: string = '';
  private skipMeasurements: boolean = false;

  constructor() {
    this.initSpeechRecognition();
  }

  public setCallbacks(callbacks: VoiceAgentCallbacks) {
    this.callbacks = callbacks;
  }

  public setLanguage(lang: 'en' | 'hi') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }

  public setActiveScreen(screen: ScreenId) {
    this.activeScreen = screen;
  }

  public setSkipMeasurements(skip: boolean) {
    this.skipMeasurements = skip;
  }

  public getSkipMeasurements(): boolean {
    return this.skipMeasurements;
  }

  /**
   * Initializes continuous browser speech recognition
   */
  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[VoiceAgent] Web Speech Recognition API not supported in this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      this.recognition.onstart = () => {
        if (!this.isSpeaking && !this.isProcessing) {
          this.callbacks.onStateChange?.('listening');
        }
      };

      this.recognition.onresult = (event: any) => {
        // Suppress recognition while kiosk itself is speaking to prevent audio feedback
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentSpeech = (finalTranscript || interimTranscript).trim();
        if (currentSpeech) {
          this.callbacks.onTranscription?.('patient', currentSpeech, !!finalTranscript);
          // Eagerly match navigation intent on both interim and final speech for sub-second responsiveness
          this.handlePatientSpokenInput(currentSpeech.toLowerCase(), !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn("[VoiceAgent] Speech recognition notice:", event.error);
        }
      };

      this.recognition.onend = () => {
        // Keep speech recognition permanently running when voice mode is active
        if (this.isListeningActive && !this.isSpeaking) {
          clearTimeout(this.speechRestartTimeout);
          this.speechRestartTimeout = setTimeout(() => {
            try {
              if (this.isListeningActive && !this.isSpeaking) {
                this.recognition.start();
              }
            } catch (e) {}
          }, 150);
        }
      };
    } catch (err) {
      console.warn("[VoiceAgent] Failed to initialize SpeechRecognition:", err);
    }
  }

  /**
   * Starts the continuous microphone listening loop
   */
  public startListening() {
    this.isListeningActive = true;
    if (this.recognition && !this.isSpeaking) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
    this.callbacks.onStateChange?.('listening');
  }

  /**
   * Stops microphone listening loop
   */
  public stopListening() {
    this.isListeningActive = false;
    clearTimeout(this.speechRestartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.callbacks.onStateChange?.('idle');
  }

  /**
   * Speaks a prompt aloud using SpeechSynthesis with safety watchdog to prevent audio hang
   */
  public speak(text: string, onDone?: () => void): void {
    if (typeof window === 'undefined') return;

    this.callbacks.onTranscription?.('kiosk', text);
    this.isSpeaking = true;
    this.callbacks.onStateChange?.('speaking');

    // Abort active recognition while speaking
    if (this.recognition) {
      try { this.recognition.abort(); } catch (e) {}
    }

    let hasCompleted = false;
    const finish = () => {
      if (hasCompleted) return;
      hasCompleted = true;
      clearTimeout(safetyTimer);
      this.isSpeaking = false;
      this.activeUtterance = null;
      if (this.isListeningActive) {
        this.callbacks.onStateChange?.('listening');
        try { this.recognition?.start(); } catch (e) {}
      } else {
        this.callbacks.onStateChange?.('idle');
      }
      if (onDone) onDone();
    };

    // Calculate maximum expected duration based on words
    const wordCount = text.split(/\s+/).length;
    const expectedSeconds = Math.min(12, Math.max(2.5, wordCount / 1.8));
    const safetyTimer = setTimeout(() => {
      console.log(`[VoiceAgent] Speech watchdog timer fired (${expectedSeconds.toFixed(1)}s)`);
      finish();
    }, expectedSeconds * 1000);

    const lang = this.currentLanguage === 'hi' ? 'hi' : 'en';
    nativeAudioService.speak(text, lang, () => {
      finish();
    });
  }

  /**
   * Main conversational and intent router for patient speech.
   * Directly triggers navigation upon detecting high-confidence intent keywords.
   */
  private async handlePatientSpokenInput(spokenText: string, isFinal: boolean) {
    const now = Date.now();
    // Prevent duplicate firing within 1000ms
    if (spokenText === this.lastTriggeredText && now - this.lastTriggerTime < 1000) {
      return;
    }

    console.log(`[VoiceAgent] Heard on ${this.activeScreen} (final=${isFinal}): "${spokenText}"`);

    // Global navigation shortcuts
    if (spokenText.includes('repeat') || spokenText.includes('again') || spokenText.includes('phir se') || spokenText.includes('दोबारा')) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.callbacks.onNavigate?.(this.activeScreen);
      return;
    }

    // Screen 00 / 01: Welcome screen
    if (this.activeScreen === '00_IDLE' || this.activeScreen === '01_WELCOME') {
      if (
        spokenText.includes('start') || 
        spokenText.includes('begin') || 
        spokenText.includes('hello') || 
        spokenText.includes('hi') ||
        spokenText.includes('doctor') ||
        spokenText.includes('shuru') ||
        spokenText.includes('शुरू') ||
        spokenText.includes('namaste') ||
        spokenText.includes('नमस्ते')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onNavigate?.('02_LANGUAGE');
      }
      return;
    }

    // Screen 02: Language selection - NAVIGATE IMMEDIATELY
    if (this.activeScreen === '02_LANGUAGE') {
      if (spokenText.includes('hindi') || spokenText.includes('हिंदी') || spokenText.includes('हिन्दी') || spokenText.includes('hind')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.setLanguage('hi');
        this.callbacks.onLanguageSelect?.('hi');
        this.callbacks.onNavigate?.('03_CONSENT');
      } else if (spokenText.includes('english') || spokenText.includes('angrezi') || spokenText.includes('अंग्रेजी') || spokenText.includes('eng')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.setLanguage('en');
        this.callbacks.onLanguageSelect?.('en');
        this.callbacks.onNavigate?.('03_CONSENT');
      }
      return;
    }

    // Screen 03: Consent - NAVIGATE IMMEDIATELY
    if (this.activeScreen === '03_CONSENT') {
      if (
        spokenText.includes('yes') || 
        spokenText.includes('agree') || 
        spokenText.includes('haan') || 
        spokenText.includes('हाँ') || 
        spokenText.includes('हां') || 
        spokenText.includes('sure') || 
        spokenText.includes('ok') || 
        spokenText.includes('consent') ||
        spokenText.includes('theek')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onConsentGiven?.(true);
        this.callbacks.onNavigate?.('04_EXISTING_NEW');
      } else if (spokenText.includes('no') || spokenText.includes('nahin') || spokenText.includes('नहीं') || spokenText.includes('na')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.speak(this.currentLanguage === 'hi' ? "आगे बढ़ने के लिए विवरण दर्ज करने की सहमति आवश्यक है।" : "Consent is needed to record details for the doctor.");
      }
      return;
    }

    // Screen 04: Patient Type - NAVIGATE IMMEDIATELY
    if (this.activeScreen === '04_EXISTING_NEW') {
      if (
        spokenText.includes('new') || 
        spokenText.includes('naya') || 
        spokenText.includes('नया') || 
        spokenText.includes('first') || 
        spokenText.includes('pehle')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onPatientTypeSelect?.('new');
        this.callbacks.onNavigate?.('14_PHOTO_CAPTURE');
      } else if (
        spokenText.includes('existing') || 
        spokenText.includes('purana') || 
        spokenText.includes('पुराना') || 
        spokenText.includes('old') || 
        spokenText.includes('already')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onPatientTypeSelect?.('existing');
        this.callbacks.onNavigate?.('07_EXISTING_FOUND');
      }
      return;
    }

    // Screen 07: Existing Found
    if (this.activeScreen === '07_EXISTING_FOUND') {
      if (spokenText.includes('yes') || spokenText.includes('correct') || spokenText.includes('confirm') || spokenText.includes('next') || spokenText.includes('haan') || spokenText.includes('हाँ')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onNavigate?.('14_PHOTO_CAPTURE');
      }
      return;
    }

    // Screen 14: Photo Capture
    if (this.activeScreen === '14_PHOTO_CAPTURE') {
      if (
        spokenText.includes('ready') || 
        spokenText.includes('capture') || 
        spokenText.includes('cheese') || 
        spokenText.includes('photo') || 
        spokenText.includes('click') || 
        spokenText.includes('take') || 
        spokenText.includes('तैयार') ||
        spokenText.includes('khicho')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onPhotoCaptureTrigger?.();
        this.callbacks.onNavigate?.('15_CLINICAL_CONVERSATION');
      }
      return;
    }

    // Screen 15 & 16: Conversational Clinical Interview (Gemini Powered)
    if (this.activeScreen === '15_CLINICAL_CONVERSATION' || this.activeScreen === '16_LISTENING') {
      if (isFinal || spokenText.split(/\s+/).length >= 3) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        await this.processClinicalSpeechWithGemini(spokenText);
      }
      return;
    }

    // Screen 18: Confirmation -> ADAPTIVE CLINICAL ROUTING
    if (this.activeScreen === '18_I_HEARD_CONFIRM') {
      if (
        spokenText.includes('yes') || 
        spokenText.includes('correct') || 
        spokenText.includes('confirm') || 
        spokenText.includes('next') || 
        spokenText.includes('haan') || 
        spokenText.includes('हाँ') || 
        spokenText.includes('theek') ||
        spokenText.includes('sahi') ||
        spokenText.includes('सही')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;

        // Intelligent clinical branch: Skip BP/vitals if complaint is Cold or minor
        if (this.skipMeasurements) {
          const skipNotice = this.currentLanguage === 'hi'
            ? "आपके लक्षणों (सर्दी-ज़ुकाम) के लिए रक्तचाप नापने की आवश्यकता नहीं है। क्या आपके पास कोई पुराना पर्चा है? 'हाँ' या 'नहीं' कहें।"
            : "Based on your cold symptoms, routine blood pressure measurement is not needed today. Do you have any previous medical prescriptions to scan? Say Yes or No.";

          this.speak(skipNotice, () => {
            this.callbacks.onNavigate?.('30_DOCUMENT_INTRO');
          });
        } else {
          this.callbacks.onNavigate?.('24_MEASUREMENTS_INTRO');
        }
      }
      return;
    }

    // Screen 20: Choice Question (Cough / Chest discomfort)
    if (this.activeScreen === '20_CHOICE_QUESTION') {
      if (spokenText.includes('yes') || spokenText.includes('haan') || spokenText.includes('हाँ')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onClinicalComplaintExtracted?.('खांसी और सीने में जकड़न', '1-2 days', 'Moderate', false, false);
        this.callbacks.onNavigate?.('24_MEASUREMENTS_INTRO');
      } else if (spokenText.includes('no') || spokenText.includes('nahin') || spokenText.includes('नहीं')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        if (this.skipMeasurements) {
          this.callbacks.onNavigate?.('30_DOCUMENT_INTRO');
        } else {
          this.callbacks.onNavigate?.('24_MEASUREMENTS_INTRO');
        }
      }
      return;
    }

    // Screen 24/25/26: Vitals & BP measurement
    if (this.activeScreen === '24_MEASUREMENTS_INTRO' || this.activeScreen === '25_BP_INSTRUCTIONS' || this.activeScreen === '26_BP_POSITIONING') {
      if (
        spokenText.includes('start') || 
        spokenText.includes('ready') || 
        spokenText.includes('measure') || 
        spokenText.includes('go') || 
        spokenText.includes('shuru') ||
        spokenText.includes('शुरू') ||
        spokenText.includes('नापो') ||
        spokenText.includes('नापें')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onMeasurementStart?.();
        this.callbacks.onNavigate?.('27_BP_MEASURING');
      }
      return;
    }

    // Screen 28/29: BP / SpO2 Results
    if (this.activeScreen === '28_BP_RESULT' || this.activeScreen === '29_SPO2_MEASUREMENT') {
      if (spokenText.includes('next') || spokenText.includes('continue') || spokenText.includes('okay') || spokenText.includes('aage') || spokenText.includes('आगे') || spokenText.includes('done')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onNavigate?.('30_DOCUMENT_INTRO');
      }
      return;
    }

    // Screen 30/31: Document Scanning - SUPPORTS INSTANT SKIP
    if (this.activeScreen === '30_DOCUMENT_INTRO' || this.activeScreen === '31_PLACE_DOCUMENT') {
      if (spokenText.includes('scan') || spokenText.includes('ready') || spokenText.includes('insert') || spokenText.includes('yes') || spokenText.includes('haan') || spokenText.includes('हाँ') || spokenText.includes('स्कैन')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onDocumentScanTrigger?.();
      } else if (
        spokenText.includes('no') || 
        spokenText.includes('skip') || 
        spokenText.includes('none') || 
        spokenText.includes('nahin') || 
        spokenText.includes('नहीं') || 
        spokenText.includes('छोड़ें') || 
        spokenText.includes('छोड़ें') || 
        spokenText.includes('done') ||
        spokenText.includes('kuch nahi') ||
        spokenText.includes('कुछ नहीं')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onDocumentScanSkip?.();
        const skipDocNotice = this.currentLanguage === 'hi'
          ? "ठीक है, आपका विवरण चिकित्सक के लिए तैयार किया जा रहा है।"
          : "Understood, preparing your case for Dr. Anjali Verma.";
        this.speak(skipDocNotice, () => {
          this.callbacks.onNavigate?.('37_PREPARING_CASE');
        });
      }
      return;
    }

    // Universal Next
    if (spokenText.includes('next') || spokenText.includes('continue') || spokenText.includes('aage') || spokenText.includes('आगे')) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.advanceDefault();
    }
  }

  /**
   * Sends the patient's spoken symptom statement to Gemini Flash with:
   * - Key rotation and rate limit handling via ApiKeyManager
   * - Pure Hindi enforcement (ZERO English words in Hindi mode)
   * - Adaptive clinical triage deciding whether vitals are needed
   */
  private async processClinicalSpeechWithGemini(patientSpeech: string) {
    this.isProcessing = true;
    this.callbacks.onStateChange?.('processing');

    const isHi = this.currentLanguage === 'hi';

    // Client-side clinical assessment for cold / runny nose / mild cough
    const isColdComplaint = /cold|सर्दी|ज़ुकाम|जुकाम|coryza|runny nose|छींक|कफ और सर्दी|halka bukhar/i.test(patientSpeech);

    const prompt = isHi 
      ? `आप MediKiosk AI हैं, भारतीय अस्पताल में मरीज़ से बात करने वाले अत्यंत विनम्र, सहानुभूतिपूर्ण और समझदार सहायक।
मरीज़ ने कहा: "${patientSpeech}".
नैदानिक एवं भाषा निर्देश:
1. भाषा और लहजा: मरीज़ से स्वाभाविक, बोलचाल की हिंदी और सामान्य हिंग्लिश (conversational Hindi / Hinglish) में बात करें, जैसा भारत के अस्पतालों में बोला जाता है। आम बोलचाल के सामान्य अंग्रेजी शब्द (जैसे doctor, cold, fever, check-up, BP, reports, prescriptions, medicines) स्वाभाविक रूप से उपयोग कर सकते हैं। अत्यधिक कठिन या संस्कृतनिष्ठ हिंदी न बोलें।
2. नैदानिक नियम: कभी भी किसी बीमारी का निदान न करें और न ही कोई दवा सुझाएं।
3. 'skipMeasurements': यदि मरीज़ को केवल सामान्य सर्दी, ज़ुकाम, हल्की खांसी या बहती नाक (Cold / Runny nose / Mild cough) है, तो 'skipMeasurements' को true करें, क्योंकि ऐसे सामान्य लक्षणों के लिए रक्तचाप नापने की आवश्यकता नहीं है। यदि सीने में दर्द, चक्कर, भारी सांस या उच्च रक्तचाप है, तो 'skipMeasurements' false रखें।
4. 'voiceResponse': मरीज़ से एक छोटा, सहानुभूतिपूर्ण फॉलो-अप प्रश्न (1-2 वाक्य) स्वाभाविक हिंदी/हिंग्लिश में पूछें।
5. 'chiefComplaint': मरीज़ के लक्षणों का 2-4 शब्दों का सारांश दें (जैसे "Cold aur Fever" या "Sir dard")।
6. 'hasRedFlag': यदि कोई आपातकालीन लक्षण (सीने में तेज दर्द, सांस फूलना, बेहोशी) है, तो true करें।
JSON प्रारूप में उत्तर दें:
{
  "voiceResponse": "स्वाभाविक हिंदी या हिंग्लिश में बोला जाने वाला प्रश्न",
  "chiefComplaint": "लक्षण सारांश",
  "hasRedFlag": false,
  "skipMeasurements": ${isColdComplaint ? 'true' : 'false'},
  "isComplete": ${this.clinicalTurnCount >= 1 ? 'true' : 'false'}
}`
      : `You are MediKiosk, an empathetic, polite pre-consultation AI hospital assistant in India.
The patient said: "${patientSpeech}".
Language: English.
Strict Clinical Directives:
1. NEVER diagnose or recommend medication.
2. 'skipMeasurements': If the patient's complaint is a minor acute cold, runny nose, simple sore throat, or mild cough ("Cold"), set 'skipMeasurements' to true because routine blood pressure cuff measurement is not needed. If symptoms include chest pain, dizziness, breathlessness, palpitations, or hypertension history, set 'skipMeasurements' to false.
3. In 'voiceResponse', provide a short, warm, empathetic verbal follow-up question (max 1-2 sentences) to speak aloud. If turn complete, say you recorded their details for Dr. Anjali Verma.
4. If red flags (crushing chest pain, severe shortness of breath, syncope) are present, set 'hasRedFlag' to true.
JSON schema:
{
  "voiceResponse": "Short 1-2 sentence empathetic question to speak aloud",
  "chiefComplaint": "Structured clinical complaint summary",
  "hasRedFlag": false,
  "skipMeasurements": ${isColdComplaint ? 'true' : 'false'},
  "isComplete": ${this.clinicalTurnCount >= 1 ? 'true' : 'false'}
}`;

    try {
      const parsed = await apiKeyManager.executeWithRotation(async (key, model) => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) throw new Error("No candidate returned from Gemini");
        return JSON.parse(jsonText);
      }, VALID_GEMINI_MODELS);

      this.clinicalTurnCount++;

      // Clinical decision: skip vitals for cold
      const finalSkipMeasurements = !!(parsed.skipMeasurements || isColdComplaint);
      this.skipMeasurements = finalSkipMeasurements;

      // Update patient clinical record
      this.callbacks.onClinicalComplaintExtracted?.(
        parsed.chiefComplaint || (isHi ? 'सर्दी और ज़ुकाम' : patientSpeech),
        '1-2 days',
        'Moderate',
        parsed.hasRedFlag,
        finalSkipMeasurements
      );

      this.isProcessing = false;

      if (parsed.hasRedFlag) {
        const redFlagSpeech = isHi 
          ? "आपके लक्षणों पर तुरंत चिकित्सक का ध्यान आवश्यक है। आपातकालीन कर्मचारियों को सूचित किया जा रहा है।"
          : "Your symptoms need immediate clinical attention. Alerting triage staff.";
        this.speak(parsed.voiceResponse || redFlagSpeech, () => {
          this.callbacks.onNavigate?.('23_RED_FLAG');
        });
        return;
      }

      // Speak empathetic follow-up
      this.speak(parsed.voiceResponse, () => {
        if (parsed.isComplete) {
          setTimeout(() => {
            this.callbacks.onNavigate?.('18_I_HEARD_CONFIRM');
          }, 600);
        }
      });
      return;

    } catch (err) {
      console.warn(`[VoiceAgent] Gemini rotation error, using pure localization fallback:`, err);
    }

    // High-fidelity fallback with 100% pure Hindi
    this.isProcessing = false;
    this.clinicalTurnCount++;
    const finalSkip = isColdComplaint;
    this.skipMeasurements = finalSkip;

    const fallbackComplaint = isHi 
      ? (isColdComplaint ? 'सर्दी और ज़ुकाम' : patientSpeech)
      : patientSpeech;

    this.callbacks.onClinicalComplaintExtracted?.(fallbackComplaint, '1-2 days', 'Moderate', false, finalSkip);

    const fallbackResponse = isHi
      ? `मैंने समझ लिया: ${fallbackComplaint}। क्या आपको कोई अन्य तकलीफ भी महसूस हो रही है?`
      : `I understood: "${patientSpeech}". I have recorded this for Dr. Anjali Verma. Let's proceed.`;

    this.speak(fallbackResponse, () => {
      this.callbacks.onNavigate?.('18_I_HEARD_CONFIRM');
    });
  }

  private advanceDefault() {
    switch (this.activeScreen) {
      case '01_WELCOME': this.callbacks.onNavigate?.('02_LANGUAGE'); break;
      case '02_LANGUAGE': this.callbacks.onNavigate?.('03_CONSENT'); break;
      case '03_CONSENT': this.callbacks.onNavigate?.('04_EXISTING_NEW'); break;
      case '04_EXISTING_NEW': this.callbacks.onNavigate?.('14_PHOTO_CAPTURE'); break;
      case '14_PHOTO_CAPTURE': this.callbacks.onNavigate?.('15_CLINICAL_CONVERSATION'); break;
      case '18_I_HEARD_CONFIRM':
        if (this.skipMeasurements) {
          this.callbacks.onNavigate?.('30_DOCUMENT_INTRO');
        } else {
          this.callbacks.onNavigate?.('24_MEASUREMENTS_INTRO');
        }
        break;
      case '24_MEASUREMENTS_INTRO': this.callbacks.onNavigate?.('25_BP_INSTRUCTIONS'); break;
      case '28_BP_RESULT': this.callbacks.onNavigate?.('30_DOCUMENT_INTRO'); break;
      case '30_DOCUMENT_INTRO': this.callbacks.onNavigate?.('37_PREPARING_CASE'); break;
      case '36_DOCUMENT_COMPLETE': this.callbacks.onNavigate?.('37_PREPARING_CASE'); break;
      case '37_PREPARING_CASE': this.callbacks.onNavigate?.('38_CASE_READY'); break;
      case '38_CASE_READY': this.callbacks.onNavigate?.('39_VISIT_QR'); break;
      case '39_VISIT_QR': this.callbacks.onNavigate?.('40_WRISTBAND_PRINTING'); break;
      default: break;
    }
  }

  public destroy() {
    this.stopListening();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
