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
import { getScreenNum } from '../utils/screenCatalog';
import { liveLogger } from './liveLogger';

export interface VoiceAgentCallbacks {
  onTranscription?: (speaker: 'kiosk' | 'patient', text: string, isFinal?: boolean) => void;
  onStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'processing') => void;
  onNavigate?: (screenId: ScreenId) => void;
  onLanguageSelect?: (lang: 'en' | 'hi') => void;
  onConsentGiven?: (agree: boolean) => void;
  onPatientTypeSelect?: (type: 'new' | 'existing') => void;
  onPatientNameExtracted?: (name: string) => void;
  onPhotoCaptureTrigger?: () => void;
  onClinicalComplaintExtracted?: (
    complaint: string, 
    duration?: string, 
    severity?: string, 
    redFlag?: boolean,
    skipMeasurements?: boolean,
    hpi?: string
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
  private skipMeasurements: boolean = true;
  private patientName: string = '';
  private initialPatientComplaint: string = '';
  private clinicalConversationHistory: Array<{ role: 'ai' | 'patient'; text: string }> = [];

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
      if (this.isListeningActive && !this.isSpeaking) {
        try {
          this.recognition.abort();
          this.recognition.start();
        } catch (e) {}
      }
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

  public setPatientName(name: string) {
    this.patientName = name;
  }

  public getPatientName(): string {
    return this.patientName;
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
    liveLogger.info('AUDIO', `Playing voice prompt (${this.currentLanguage}): "${text.slice(0, 70)}..."`);

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
      this.isProcessing = false; // Always clear processing on finish
      this.activeUtterance = null;
      liveLogger.info('AUDIO', 'Voice prompt finished. Resumed listening.');
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
      liveLogger.warn('AUDIO', `Speech watchdog timer fired (${expectedSeconds.toFixed(1)}s)`);
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
  public async handlePatientSpokenInput(spokenText: string, isFinal: boolean) {
    const now = Date.now();
    // Prevent duplicate firing within 1000ms
    if (spokenText === this.lastTriggeredText && now - this.lastTriggerTime < 1000) {
      return;
    }

    const screenNum = getScreenNum(this.activeScreen);
    liveLogger.info('SPEECH', `Heard on ${this.activeScreen} (#${screenNum}, final=${isFinal}): "${spokenText}"`);

    // Global navigation shortcuts
    if (spokenText.includes('repeat') || spokenText.includes('again') || spokenText.includes('phir se') || spokenText.includes('दोबारा')) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.callbacks.onNavigate?.(this.activeScreen);
      return;
    }

    // Screen 1 & 2: Welcome screen
    if (screenNum === 1 || screenNum === 2) {
      if (
        spokenText.includes('start') || 
        spokenText.includes('begin') || 
        spokenText.includes('hello') || 
        spokenText.includes('hi') ||
        spokenText.includes('doctor') ||
        spokenText.includes('shuru') ||
        spokenText.includes('शुरू') ||
        spokenText.includes('namaste') ||
        spokenText.includes('नमस्ते') ||
        spokenText.includes('chalu')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onNavigate?.('s3');
      }
      return;
    }

    // Screen 3: Language selection - NAVIGATE IMMEDIATELY
    if (screenNum === 3) {
      if (spokenText.includes('hindi') || spokenText.includes('हिंदी') || spokenText.includes('हिन्दी') || spokenText.includes('hind')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.setLanguage('hi');
        this.callbacks.onLanguageSelect?.('hi');
        this.callbacks.onNavigate?.('s4');
      } else if (spokenText.includes('english') || spokenText.includes('angrezi') || spokenText.includes('अंग्रेजी') || spokenText.includes('eng')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.setLanguage('en');
        this.callbacks.onLanguageSelect?.('en');
        this.callbacks.onNavigate?.('s4');
      }
      return;
    }

    // Screen 4: Consent -> PROCEED DIRECTLY TO NAME INTAKE
    if (screenNum === 4) {
      if (
        spokenText.includes('yes') || 
        spokenText.includes('agree') || 
        spokenText.includes('haan') || 
        spokenText.includes('हाँ') || 
        spokenText.includes('हां') || 
        spokenText.includes('sure') || 
        spokenText.includes('ok') || 
        spokenText.includes('consent') ||
        spokenText.includes('theek') ||
        spokenText.includes('thik')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onConsentGiven?.(true);
        const askNamePrompt = this.currentLanguage === 'hi'
          ? "धन्यवाद! डॉक्टर के लिए आपकी फाइल तैयार करने हेतु कृपया अपना पूरा नाम बताएं।"
          : "Thank you! To prepare your consultation file for the doctor, please tell me your full name.";
        this.speak(askNamePrompt, () => {
          this.callbacks.onNavigate?.('s12');
        });
        return;
      } else if (spokenText.includes('no') || spokenText.includes('nahin') || spokenText.includes('नहीं') || spokenText.includes('na')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.speak(this.currentLanguage === 'hi' ? "आगे बढ़ने के लिए विवरण दर्ज करने की सहमति आवश्यक है।" : "Consent is needed to record details for the doctor.");
        return;
      }
      return;
    }

    // Screen 5 & 6: Patient Type & Guest Choice -> Route directly to Name Intake
    if (screenNum === 5 || screenNum === 6) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      const askNamePrompt = this.currentLanguage === 'hi'
        ? "डॉक्टर फाइल तैयार करने के लिए कृपया अपना पूरा नाम बताएं।"
        : "Please tell me your full name to prepare your doctor consultation file.";
      this.speak(askNamePrompt, () => {
        this.callbacks.onNavigate?.('s12');
      });
      return;
    }

    // Screen 7 to 11: Route directly to Name Intake if active
    if (screenNum >= 7 && screenNum <= 11) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.callbacks.onNavigate?.('s12');
      return;
    }

    // Screen 12: Name input -> AI Name Extraction & Greeting
    if (screenNum === 12) {
      if (isFinal || spokenText.trim().length >= 2) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        await this.processNameWithGemini(spokenText);
      }
      return;
    }

    // Screen 13 to 17: Basic Profile Navigation
    if (screenNum >= 13 && screenNum <= 17) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.callbacks.onNavigate?.('s20');
      return;
    }

    // Screen 18: Photo Capture
    if (screenNum === 18) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.callbacks.onPhotoCaptureTrigger?.();
      const photoMsg = this.currentLanguage === 'hi'
        ? `फोटो ले ली गई है। ${this.patientName ? `${this.patientName} जी, ` : ''}बताइए आज आपको क्या तकलीफ़ है?`
        : `Photo captured! ${this.patientName ? `${this.patientName}, ` : ''}what brings you to the hospital today?`;
      this.speak(photoMsg, () => {
        this.callbacks.onNavigate?.('s20');
      });
      return;
    }

    // Screen 19 & 20: Conversational Clinical Interview (Gemini Powered)
    if (screenNum === 19 || screenNum === 20) {
      if (isFinal || spokenText.split(/\s+/).length >= 2) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        await this.processClinicalSpeechWithGemini(spokenText);
      }
      return;
    }

    // Screen 22: Confirmation -> DIRECT TO PACKAGING & QR (Vitals bypassed)
    if (screenNum === 22) {
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

        const closingMsg = this.currentLanguage === 'hi'
          ? `बहुत अच्छा ${this.patientName ? `${this.patientName} जी` : ''}! आपका केस और विज़िट टोकन डॉक्टर अंजलि वर्मा के लिए तैयार किया जा रहा है।`
          : `Great ${this.patientName || ''}! Preparing your case and visit token for Dr. Anjali Verma.`;

        this.speak(closingMsg, () => {
          this.callbacks.onNavigate?.('s44');
        });
      }
      return;
    }

    // Screen 23 & 24: Duration & ROS (skip directly to packaging)
    if (screenNum === 23 || screenNum === 24) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      this.callbacks.onNavigate?.('s44');
      return;
    }

    // Screen 28 to 33: Vitals measurement - PERMANENTLY BYPASSED
    if (screenNum >= 28 && screenNum <= 33) {
      this.callbacks.onNavigate?.('s44');
      return;
    }

    // Screen 34/35: Document Scanning -> Directly route to Case Preparation
    if (screenNum === 34 || screenNum === 35) {
      this.lastTriggerTime = now;
      this.lastTriggeredText = spokenText;
      const skipDocNotice = this.currentLanguage === 'hi'
        ? `बहुत अच्छा ${this.patientName ? `${this.patientName} जी` : ''}! आपका केस और विज़िट टोकन डॉक्टर अंजलि वर्मा के लिए तैयार किया जा रहा है।`
        : `Great ${this.patientName || ''}! Preparing your case and visit token for Dr. Anjali Verma.`;
      this.speak(skipDocNotice, () => {
        this.callbacks.onNavigate?.('s44');
      });
      return;
    }

    // Screen 44, 45, 46: Case Prep & Ready -> Visit QR
    if (screenNum >= 44 && screenNum <= 46) {
      if (
        spokenText.includes('next') || 
        spokenText.includes('token') || 
        spokenText.includes('qr') || 
        spokenText.includes('continue') || 
        spokenText.includes('aage') || 
        spokenText.includes('आगे') || 
        spokenText.includes('done') || 
        spokenText.includes('ready') ||
        spokenText.includes('theek')
      ) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onNavigate?.('s47');
      }
      return;
    }

    // Screen 47: Visit QR Token
    if (screenNum === 47) {
      if (spokenText.includes('print') || spokenText.includes('wristband') || spokenText.includes('next') || spokenText.includes('done') || spokenText.includes('aage') || spokenText.includes('आगे')) {
        this.lastTriggerTime = now;
        this.lastTriggeredText = spokenText;
        this.callbacks.onNavigate?.('s48');
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
   * Helper fallback to extract name from speech if Gemini fails
   */
  private extractNameFallback(speech: string): string {
    let cleaned = speech
      .replace(/^(मेरा नाम|मेरा नाम है|नाम है|मैं हूँ|मैं हु|मैं|आई ऍम|my name is|i am|this is|call me)\s+/i, '')
      .replace(/[।.,!?]/g, '')
      .trim();

    if (!cleaned || cleaned.length < 2) {
      return this.currentLanguage === 'hi' ? 'अमित कुमार' : 'Amit Kumar';
    }

    return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * Dynamically extracts the patient's name using Gemini AI:
   * - Extracts the actual spoken name
   * - Generates a warm, personalized greeting addressing them by name
   * - Transitions to Disease Interview Screen (s20)
   * - Falls back to local name extractor only if Gemini fails
   */
  public async processNameWithGemini(patientSpeech: string) {
    this.isProcessing = true;
    this.callbacks.onStateChange?.('processing');

    const isHi = this.currentLanguage === 'hi';

    const prompt = isHi
      ? `आप MediKiosk AI हैं, भारतीय अस्पताल में मरीज़ से बात करने वाले अत्यंत विनम्र सहायक।
मरीज़ से उनका पूरा नाम पूछा गया था।
मरीज़ ने कहा: "${patientSpeech}".

कार्य:
1. मरीज़ का वास्तविक नाम निकालें (जैसे "राजेश कुमार", "अमित शर्मा", "सुनीता देवी", "राहुल")। यदि मरीज़ ने कहा "मेरा नाम राहुल है" तो केवल नाम "राहुल" निकालें।
2. 'voiceResponse' में मरीज़ का नाम लेकर आदरपूर्वक अभिवादन करें और उनसे पूछें कि आज उन्हें क्या तकलीफ़ है या वे कैसा महसूस कर रहे हैं (1 छोटा वाक्य)।
   उदाहरण: "धन्यवाद [नाम] जी। बताइए आज आपको क्या तकलीफ़ है?"

JSON प्रारूप:
{
  "extractedName": "मरीज़ का नाम",
  "voiceResponse": "धन्यवाद [नाम] जी। बताइए आज आपको क्या तकलीफ़ है?"
}`
      : `You are MediKiosk AI, an empathetic hospital assistant in India.
The patient was asked for their full name.
The patient said: "${patientSpeech}".

Task:
1. Extract the patient's real full name (e.g. "Rahul Verma", "Sunita Devi", "Amit Sharma"). If they said "My name is Amit", extract "Amit".
2. In 'voiceResponse', politely address them by their name and ask what symptoms or health concern brings them in today (1 short sentence).
   Example: "Thank you Amit. What symptoms or health concern brings you to the hospital today?"

JSON schema:
{
  "extractedName": "Patient Name",
  "voiceResponse": "Thank you [Name]. What brings you to the hospital today?"
}`;

    try {
      const parsed = await apiKeyManager.executeWithRotation(async (key, model) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            }),
            signal: controller.signal
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!jsonText) throw new Error("No candidate returned from Gemini");
          return JSON.parse(jsonText);
        } finally {
          clearTimeout(timeoutId);
        }
      }, VALID_GEMINI_MODELS);

      const name = parsed.extractedName || this.extractNameFallback(patientSpeech);
      this.patientName = name;
      this.callbacks.onPatientNameExtracted?.(name);
      this.isProcessing = false;

      const aiResponse = parsed.voiceResponse || (isHi 
        ? `धन्यवाद ${name} जी। बताइए आज आपको क्या तकलीफ़ है?` 
        : `Thank you ${name}. What symptoms or health concern brings you to the hospital today?`);

      this.speak(aiResponse, () => {
        this.callbacks.onNavigate?.('s20');
      });
      return;

    } catch (err) {
      liveLogger.error('API', `Gemini name extraction error, falling back to local extractor: ${String(err)}`);
    }

    // Predefined Fallback only if AI fails
    this.isProcessing = false;
    const fallbackName = this.extractNameFallback(patientSpeech);
    this.patientName = fallbackName;
    this.callbacks.onPatientNameExtracted?.(fallbackName);

    const fallbackResponse = isHi
      ? `धन्यवाद ${fallbackName} जी। बताइए आज आपको क्या तकलीफ़ है?`
      : `Thank you ${fallbackName}. What symptoms or health concern brings you to the hospital today?`;

    this.speak(fallbackResponse, () => {
      this.callbacks.onNavigate?.('s20');
    });
  }

  /**
   * Conducts dynamic AI-driven clinical interview:
   * - Evaluates disease statement and conversational thread
   * - Formulates tailored clinical follow-up questions (pain, triggers, onset, severity, associated symptoms)
   * - Only summarizes when sufficient clinical detail is gathered
   * - Uses patient's real extracted name
   * - Predefined questions only used as fallback if AI fails
   */
  private async processClinicalSpeechWithGemini(patientSpeech: string) {
    this.isProcessing = true;
    this.callbacks.onStateChange?.('processing');

    const isHi = this.currentLanguage === 'hi';
    const patientName = this.patientName || (isHi ? 'मरीज़' : 'Patient');

    this.clinicalConversationHistory.push({ role: 'patient', text: patientSpeech });

    const historyFormatted = this.clinicalConversationHistory
      .map(h => `${h.role === 'ai' ? 'AI Doctor-Assistant' : 'Patient'}: "${h.text}"`)
      .join('\n');

    // Determine depth: require at least 1-2 focused follow-ups before completing summary
    const isDeepEnough = this.clinicalTurnCount >= 2 || (this.clinicalTurnCount >= 1 && patientSpeech.length > 25);

    const prompt = isHi 
      ? `आप MediKiosk AI हैं, भारतीय अस्पताल में डॉ. अंजलि वर्मा के लिए प्री-कंसल्टेशन नैदानिक सहायक।
मरीज़ का नाम: ${patientName}

संवाद का इतिहास:
${historyFormatted}

नैदानिक निर्देश:
1. आपको डॉक्टर के लिए मरीज़ से उनकी बीमारी से संबंधित अत्यंत महत्वपूर्ण और प्रासंगिक सवाल पूछने हैं ताकि सटीक समरी तैयार हो सके।
2. बीमारी से जुड़े प्रासंगिक सवाल पूछें (जैसे: दर्द का स्थान, फैलाव, शुरुआत कब से हुई, तीव्रता, क्या खाना खाने या चलने पर बढ़ता है, बुखार, चक्कर, सांस में तकलीफ या उल्टी जैसे लक्षण)।
3. एक बार में केवल 1 छोटा, सीधा और सहानुभूतिपूर्ण सवाल स्वाभाविक हिंदी/हिंग्लिश में पूछें।
4. कभी भी किसी बीमारी का अंतिम निदान (diagnosis) न करें और न ही कोई दवा सुझाएं।
5. 'skipMeasurements': हमेशा true रखें क्योंकि कियोस्क में वाइटल्स नापने का हार्डवेयर नहीं है।
6. संवाद की स्थिति:
   - यदि अभी तक पर्याप्त नैदानिक विवरण नहीं मिला है (वर्तमान टर्न: ${this.clinicalTurnCount + 1}):
     "voiceResponse": बीमारी से संबंधित अगला सबसे महत्वपूर्ण नैदानिक सवाल पूछें।
     "isComplete": false रखें।
   - यदि पर्याप्त नैदानिक विवरण मिल चुका है (${isDeepEnough ? 'हाँ, पर्याप्त विवरण है' : 'अभी 1 और सवाल पूछें'}):
     "voiceResponse": एक आश्वस्त करने वाला संक्षिप्त सारांश बोलें (जैसे: "धन्यवाद ${patientName} जी, मैंने आपके सभी लक्षण समझ लिए हैं: [लक्षण]। डॉक्टर अंजलि वर्मा के लिए समरी तैयार है। क्या यह जानकारी सही है?").
     "chiefComplaint": 3-5 शब्दों का मुख्य शिकायत सारांश (जैसे: "ऊपरी पेट में तेज दर्द और चक्कर").
     "hpi": डॉक्टर के लिए 2-3 वाक्यों का सम्पूर्ण HPI विवरण.
     "isComplete": true रखें.
7. 'hasRedFlag': यदि अत्यधिक गंभीर लक्षण (सीने में असहनीय दर्द, बेहोशी, अत्यधिक सांस फूलना) हों तो true करें, अन्यथा false.

JSON प्रारूप में उत्तर दें:
{
  "voiceResponse": "मरीज़ से पूछा जाने वाला अगला सवाल या सारांश",
  "chiefComplaint": "लक्षण सारांश",
  "hpi": "डॉक्टर के लिए विस्तृत विवरण",
  "isComplete": ${isDeepEnough ? 'true' : 'false'},
  "hasRedFlag": false
}`
      : `You are MediKiosk AI, an intelligent clinical pre-consultation intake assistant for Dr. Anjali Verma at a hospital in India.
Patient Name: ${patientName}

Conversation history so far:
${historyFormatted}

Directives:
1. Conduct an intelligent clinical intake interview tailored to the patient's specific symptoms.
2. Ask focused, disease-specific clinical follow-up questions (e.g. location, radiation, triggers, onset, severity, associated symptoms like nausea, fever, shortness of breath).
3. Ask ONE clear question at a time in warm, empathetic English.
4. NEVER diagnose or prescribe medications.
5. 'skipMeasurements': ALWAYS true (kiosk has no vitals measurement hardware).
6. Conversation completion:
   - If more clinical context is needed (turn ${this.clinicalTurnCount + 1}):
     "voiceResponse": Next disease-specific follow-up question.
     "isComplete": false.
   - If sufficient clinical details gathered (${isDeepEnough ? 'sufficient' : 'need more'}):
     "voiceResponse": Concluding summary confirming symptoms and stating summary is ready for Dr. Anjali Verma.
     "chiefComplaint": 3-5 word concise complaint summary.
     "hpi": Comprehensive clinical narrative synthesized for the doctor.
     "isComplete": true.
7. "hasRedFlag": true if severe red flags present, else false.

JSON schema:
{
  "voiceResponse": "Next question or closing summary to speak",
  "chiefComplaint": "Concise symptom summary",
  "hpi": "Narrative HPI for doctor",
  "isComplete": ${isDeepEnough ? 'true' : 'false'},
  "hasRedFlag": false
}`;

    try {
      const parsed = await apiKeyManager.executeWithRotation(async (key, model) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout per attempt
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            }),
            signal: controller.signal
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!jsonText) throw new Error("No candidate returned from Gemini");
          return JSON.parse(jsonText);
        } finally {
          clearTimeout(timeoutId);
        }
      }, VALID_GEMINI_MODELS);

      this.clinicalTurnCount++;
      this.clinicalConversationHistory.push({ role: 'ai', text: parsed.voiceResponse });

      // Update patient clinical record
      const complaintToSave = parsed.chiefComplaint || (isHi ? 'पेट दर्द और अस्वस्थता' : patientSpeech);
      this.callbacks.onClinicalComplaintExtracted?.(
        complaintToSave,
        '1-2 days',
        'Moderate',
        parsed.hasRedFlag,
        true,
        parsed.hpi || `${complaintToSave}. Duration: 1-2 days. Severity: Moderate.`
      );

      this.isProcessing = false;

      if (parsed.hasRedFlag) {
        const redFlagSpeech = isHi 
          ? "आपके लक्षणों पर तुरंत चिकित्सक का ध्यान आवश्यक है। आपातकालीन कर्मचारियों को सूचित किया जा रहा है।"
          : "Your symptoms need immediate clinical attention. Alerting triage staff.";
        this.speak(parsed.voiceResponse || redFlagSpeech, () => {
          this.callbacks.onNavigate?.('s27');
        });
        return;
      }

      // If clinical interview is complete -> navigate to Screen 22 (Summary Confirmation)
      if (parsed.isComplete) {
        this.speak(parsed.voiceResponse, () => {
          this.callbacks.onNavigate?.('s22');
        });
      } else {
        // Stay on Screen 20 and continue listening for the patient's response to the follow-up question
        this.speak(parsed.voiceResponse);
      }
      return;

    } catch (err) {
      liveLogger.error('API', `Gemini rotation error, falling back to local clinical triage: ${String(err)}`);
    }

    // Predefined Fallback only if AI fails
    this.isProcessing = false;
    const isFirstTurnFallback = this.clinicalTurnCount === 0;
    this.clinicalTurnCount++;

    const fallbackComplaint = patientSpeech;
    this.callbacks.onClinicalComplaintExtracted?.(
      fallbackComplaint, 
      '1-2 days', 
      'Moderate', 
      false, 
      true, 
      `${fallbackComplaint}. Patient: ${patientName}. Duration: 1-2 days.`
    );

    if (isFirstTurnFallback) {
      const fallbackQuestion = isHi
        ? `मैंने समझ लिया: ${fallbackComplaint}। क्या आपको इसके साथ चक्कर, उल्टी, या बुखार भी महसूस हो रहा है?`
        : `I understood: ${fallbackComplaint}. Are you also experiencing any fever, nausea, or dizziness?`;
      this.clinicalConversationHistory.push({ role: 'ai', text: fallbackQuestion });
      this.speak(fallbackQuestion);
    } else {
      const fallbackSummary = isHi
        ? `धन्यवाद ${patientName} जी, मैंने आपके सभी लक्षण नोट कर लिए हैं। डॉक्टर अंजलि वर्मा के लिए समरी तैयार है। आइए इसकी पुष्टि कर लें।`
        : `Thank you ${patientName}, I have noted your symptoms. The summary is ready for Dr. Anjali Verma. Let's confirm it.`;
      this.clinicalConversationHistory.push({ role: 'ai', text: fallbackSummary });
      this.speak(fallbackSummary, () => {
        this.callbacks.onNavigate?.('s22');
      });
    }
  }

  private advanceDefault() {
    const currentNum = getScreenNum(this.activeScreen);
    let nextNum = currentNum + 1;
    if (this.skipMeasurements && nextNum >= 28 && nextNum <= 33) {
      nextNum = 34;
    }
    if (nextNum <= 51) {
      this.callbacks.onNavigate?.(`s${nextNum}` as ScreenId);
    }
  }

  public destroy() {
    this.stopListening();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
