import React, { useState } from 'react';
import { 
  Mic, 
  Brain, 
  Check, 
  Edit3, 
  Keyboard, 
  Volume2, 
  AlertTriangle, 
  Heart, 
  Wind, 
  HelpCircle, 
  Droplet, 
  ArrowRight, 
  Lightbulb 
} from 'lucide-react';

interface ScreenGroup19to27Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  selectedLanguage: 'en' | 'hi';
  patientName?: string;
  chiefComplaint: string;
  onComplaintExtracted?: (complaint: string, skipVitals?: boolean) => void;
  onPlaySpeechAloud?: (text: string) => void;
}

export const ScreenGroup19to27: React.FC<ScreenGroup19to27Props> = ({
  screenNum,
  onNavigate,
  selectedLanguage,
  patientName,
  chiefComplaint = 'Cold and runny nose',
  onComplaintExtracted,
  onPlaySpeechAloud,
}) => {
  const isHi = selectedLanguage === 'hi';
  const [selectedDuration, setSelectedDuration] = useState('1-2 days');
  const [selectedSeverity, setSelectedSeverity] = useState('Moderate');
  const [selectedUnsureOption, setSelectedUnsureOption] = useState<number>(0);

  const symptomChips = [
    { en: 'Cold / Runny nose', hi: 'सर्दी / ज़ुकाम', isCold: true },
    { en: 'Fever', hi: 'बुखार', isCold: false },
    { en: 'Cough', hi: 'खांसी', isCold: true },
    { en: 'Headache', hi: 'सिरदर्द', isCold: false },
    { en: 'Stomach ache', hi: 'पेट दर्द', isCold: false },
    { en: 'Chest pain', hi: 'छाती में दर्द', isCold: false, redFlag: true },
    { en: 'Body ache', hi: 'बदन दर्द', isCold: false },
  ];

  // SCREEN 19: Start Clinical Interview (s19.png)
  if (screenNum === 19) {
    return (
      <div className="screen-container s19-clinical-start-screen">
        <div className="white-surface-card clinical-intro-card">
          <h3 className="clinical-intro-title">
            {isHi ? 'आज अस्पताल आने का मुख्य कारण क्या है?' : 'What brings you to the hospital today?'}
          </h3>
          <p className="clinical-intro-sub">
            {isHi 
              ? 'अपनी परेशानी या लक्षण अपने शब्दों में सहजता से बताएं या नीचे चुनें।' 
              : 'Please tell me your symptoms in your own words or select from below.'}
          </p>

          <div className="symptom-chips-wrap">
            {symptomChips.map((chip, idx) => (
              <button
                key={idx}
                className={`symptom-chip-btn ${chip.en === chiefComplaint ? 'selected' : ''}`}
                onClick={() => {
                  if (chip.redFlag) {
                    onNavigate(27); // Red Flag Screen
                  } else {
                    onComplaintExtracted?.(chip.en, chip.isCold);
                    onNavigate(20); // Voice listening / confirmation
                  }
                }}
              >
                <span>{isHi ? chip.hi : chip.en}</span>
              </button>
            ))}
          </div>

          <div 
            className="big-mic-start-cta"
            onClick={() => onNavigate(20)}
            role="button"
            tabIndex={0}
          >
            <div className="cta-mic-circle">
              <Mic size={28} color="#ffffff" />
            </div>
            <div className="cta-mic-texts">
              <h4>{isHi ? 'बोलने के लिए टैप करें' : 'Tap to speak'}</h4>
              <p>{isHi ? 'अपनी परेशानी विस्तार से बताएं...' : 'Describe your symptoms...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 20: Voice Listening Active (s20.png)
  if (screenNum === 20) {
    return (
      <div className="screen-container s20-listening-screen">
        <div className="white-surface-card listening-hero-card">
          {/* Animated Central Microphone with Audio Waves */}
          <div className="listening-visual-stage">
            <div className="soundwave-bar-group left">
              <span className="wave-bar bar-1" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-3" />
            </div>

            <div 
              className="listening-mic-orb-circle pulse-active"
              onClick={() => onNavigate(21)}
            >
              <Mic size={42} color="#ffffff" />
            </div>

            <div className="soundwave-bar-group right">
              <span className="wave-bar bar-3" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-1" />
            </div>
          </div>

          <h3 className="listening-state-heading">
            {isHi ? 'मैं सुन रहा हूँ...' : "I'm listening..."}
          </h3>
          <p className="listening-state-sub">
            {isHi ? 'आप बोल सकते हैं।' : 'You can speak now.'}
          </p>

          {/* Tips Box matching s20.png */}
          <div className="listening-tips-box">
            <div className="tips-box-header">
              <Lightbulb size={18} color="#00796B" />
              <span>{isHi ? 'कुछ सुझाव:' : 'Some tips:'}</span>
            </div>

            <div className="tips-items-row">
              <div className="tip-item">
                <span className="tip-item-icon">💬</span>
                <span className="tip-item-text">{isHi ? 'अपने शब्दों में बोलें' : 'Speak in your own words'}</span>
              </div>
              <div className="tip-divider" />
              <div className="tip-item">
                <span className="tip-item-icon">⏳</span>
                <span className="tip-item-text">{isHi ? 'आराम से समय लें' : 'You can take your time'}</span>
              </div>
              <div className="tip-divider" />
              <div className="tip-item">
                <span className="tip-item-icon">🛑</span>
                <span className="tip-item-text">{isHi ? '"Stop" कहें जब पूरा हो' : 'Say "stop" when done'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 21: AI Thinking & Structuring (s21.png)
  if (screenNum === 21) {
    return (
      <div className="screen-container s21-thinking-screen">
        <div className="white-surface-card thinking-card">
          <div className="thinking-card-header">
            <div className="thinking-icon-badge">
              <Brain size={28} color="#00796B" />
            </div>
            <div className="thinking-header-texts">
              <h3 className="thinking-title">
                {isHi ? 'आपकी बात समझी जा रही है...' : 'Thinking about what you said...'}
              </h3>
              <p className="thinking-sub">
                {isHi 
                  ? 'एआई द्वारा आपकी बात से महत्वपूर्ण नैदानिक विवरण संकलित किए जा रहे हैं।' 
                  : "I'm using AI to understand your response and extract the important details."}
              </p>
            </div>
          </div>

          <div className="thinking-body-split">
            {/* Left: Progress ring with brain icon */}
            <div className="thinking-ring-wrapper">
              <div className="segmented-progress-ring">
                <Brain size={42} color="#00796B" />
              </div>
            </div>

            {/* Right: Checklist matching s21.png */}
            <div className="thinking-checklist">
              <div className="checklist-item done">
                <Check size={18} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'ध्वनि को टेक्स्ट में बदला गया' : 'Converting speech to text'}</span>
              </div>

              <div className="checklist-item active">
                <span className="spinner-dot" />
                <span>{isHi ? 'अर्थ और संदर्भ समझा जा रहा है' : 'Understanding meaning'}</span>
              </div>

              <div className="checklist-item pending">
                <span className="pending-circle" />
                <span>{isHi ? 'मुख्य लक्षणों की पहचान' : 'Identifying key details'}</span>
              </div>

              <div className="checklist-item pending">
                <span className="pending-circle" />
                <span>{isHi ? 'डॉक्टर समरी तैयार करना' : 'Preparing summary'}</span>
              </div>
            </div>
          </div>

          <div className="consent-info-pill" style={{ marginTop: '20px' }}>
            <span className="info-badge-icon">💡</span>
            <span>
              {isHi ? 'त्वरित नोट: थोड़ा समय लें, हम बस तैयार कर रहे हैं!' : "Quick note: Take your time. I'm almost there!"}
            </span>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ marginTop: '16px' }}
            onClick={() => onNavigate(22)}
          >
            <span>{isHi ? 'परिणाम देखें' : 'View Result'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 22: Confirm Chief Complaint (s22.png)
  if (screenNum === 22) {
    const quoteText = chiefComplaint 
      ? (isHi 
          ? `${patientName ? `${patientName} जी, ` : ''}आपको ${chiefComplaint} की समस्या है।` 
          : `${patientName ? `${patientName}, ` : ''}you reported: ${chiefComplaint}.`)
      : (isHi ? 'आपको सिरदर्द और बुखार की शिकायत है।' : 'You reported fever and headache since yesterday.');

    return (
      <div className="screen-container s22-confirm-screen">
        <div className="white-surface-card confirm-complaint-card">
          <h3 className="confirm-card-heading">
            {patientName 
              ? (isHi ? `${patientName} जी, मैंने यह समझा...` : `${patientName}, I heard that...`)
              : (isHi ? 'मैंने यह समझा...' : 'I heard that...')}
          </h3>
          <p className="confirm-card-sub">
            {isHi ? 'कृपया पुष्टि करें कि क्या यह सही है।' : 'Please confirm if this is correct.'}
          </p>

          {/* Green Quote Box matching s22.png */}
          <div className="green-quote-box">
            <span className="quote-mark left">“</span>
            <p className="quote-content">
              {quoteText}
            </p>
            <span className="quote-mark right">”</span>
          </div>

          {/* Soundwave + Play Again button */}
          <div className="quote-audio-bar-row">
            <div className="mini-audio-wave-bars">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="mini-bar" style={{ height: `${8 + (i % 5) * 4}px` }} />
              ))}
            </div>

            <button 
              className="play-again-pill-btn"
              onClick={() => onPlaySpeechAloud?.(quoteText)}
            >
              <Volume2 size={16} />
              <span>{isHi ? 'दोबारा सुनें' : 'Play again'}</span>
            </button>
          </div>

          {/* 3 Action Buttons matching s22.png */}
          <div className="s22-actions-row">
            <button 
              className="s22-btn success"
              onClick={() => onNavigate(44)}
            >
              <Check size={20} />
              <div className="btn-label-col">
                <span className="btn-head">{isHi ? 'हाँ, यह सही है' : "Yes, that's right"}</span>
                <span className="btn-sub">{isHi ? 'विज़िट टोकन प्राप्त करें' : 'Proceed to Visit Token'}</span>
              </div>
            </button>

            <button 
              className="s22-btn edit"
              onClick={() => onNavigate(20)}
            >
              <Edit3 size={18} />
              <div className="btn-label-col">
                <span className="btn-head">{isHi ? 'नहीं, सुधारना है' : 'No, let me correct it'}</span>
                <span className="btn-sub">{isHi ? 'दोबारा बोलें' : "I'll say it again"}</span>
              </div>
            </button>

            <button 
              className="s22-btn keyboard"
              onClick={() => onNavigate(26)}
            >
              <Keyboard size={18} />
              <div className="btn-label-col">
                <span className="btn-head">{isHi ? 'टाइप करें' : 'Type instead'}</span>
                <span className="btn-sub">{isHi ? 'कीपैड से दर्ज करें' : 'Enter my response'}</span>
              </div>
            </button>
          </div>

          <div className="consent-info-pill" style={{ marginTop: '16px' }}>
            <span className="info-badge-icon">💡</span>
            <span>
              {isHi 
                ? 'सुझाव: यदि कुछ गलत है, तो बस अपने शब्दों में दोबारा बता दें।' 
                : 'Tip: If something is not correct, just tell me again in your own words.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 23: Duration & Severity Follow-up (s23.png)
  if (screenNum === 23) {
    const durations = ['Since today', '1-2 days', '3-5 days', 'More than a week'];
    const severities = ['Mild', 'Moderate', 'Severe'];

    return (
      <div className="screen-container s23-duration-screen">
        <div className="white-surface-card duration-card">
          <h3 className="section-mini-header">
            {isHi ? 'यह परेशानी कितने समय से है?' : 'How long have you had this?'}
          </h3>
          <div className="choice-pills-row">
            {durations.map((d) => (
              <button
                key={d}
                className={`choice-select-pill ${selectedDuration === d ? 'active' : ''}`}
                onClick={() => setSelectedDuration(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <h3 className="section-mini-header" style={{ marginTop: '24px' }}>
            {isHi ? 'यह कितनी तीव्र या कष्टदायक है?' : 'How severe does it feel?'}
          </h3>
          <div className="choice-pills-row">
            {severities.map((s) => (
              <button
                key={s}
                className={`choice-select-pill ${selectedSeverity === s ? 'active' : ''}`}
                onClick={() => setSelectedSeverity(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ marginTop: '24px', width: '100%' }}
            onClick={() => onNavigate(24)}
          >
            <span>{isHi ? 'अगला सवाल' : 'Next question'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 24: Review of Systems / Secondary Symptoms (s24.png)
  if (screenNum === 24) {
    return (
      <div className="screen-container s24-ros-screen">
        <div className="white-surface-card ros-card">
          <h3 className="ros-question-title">
            {isHi ? 'क्या आपको खांसी या सीने में जकड़न है?' : 'Do you currently have a cough?'}
          </h3>
          <p className="ros-question-sub">
            {isHi ? 'कृपया नीचे दिए गए विकल्पों में से चुनें या बोलकर बताएं।' : 'Please choose an option or speak your response.'}
          </p>

          <div className="ros-choices-stack">
            {['No cough', 'Dry cough', 'Wet cough with phlegm', 'Sore throat with cough'].map((opt, i) => (
              <button 
                key={i} 
                className="ros-choice-item-btn"
                onClick={() => {
                  // If cold/minor, skip directly to documents (Screen 34)
                  onNavigate(34);
                }}
              >
                <span>{opt}</span>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 25: Unclear Speech Clarification (s25.png)
  if (screenNum === 25) {
    return (
      <div className="screen-container s25-unclear-screen">
        <div className="white-surface-card unclear-card">
          <div className="unclear-icon-wrap">
            <HelpCircle size={38} color="#D97706" />
          </div>
          <h3 className="unclear-title">
            {isHi ? 'माफ कीजिए, मैं ठीक से समझ नहीं पाया' : "I didn't quite catch that"}
          </h3>
          <p className="unclear-sub">
            {isHi ? 'कृपया अपनी बात दोबारा दोहराएं या नीचे दिए गए विकल्पों में से चुनें।' : 'Could you please repeat your answer or tap one of the options below?'}
          </p>

          <div className="unclear-actions">
            <button 
              className="footer-primary-pill full-width"
              onClick={() => onNavigate(20)}
            >
              <Mic size={20} />
              <span>{isHi ? 'दोबारा बोलें' : 'Speak again'}</span>
            </button>

            <button 
              className="bottom-pill-btn full-width"
              onClick={() => onNavigate(26)}
            >
              <span>{isHi ? 'विकल्प चुनें' : 'Choose option'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 26: Option Unsure / Radio Choices (s26.png)
  if (screenNum === 26) {
    const unsureOptions = [
      { title: "I don't know", sub: "I'm not sure about this." },
      { title: 'Not applicable', sub: 'This does not apply to me.' },
      { title: "I'm not able to recall right now", sub: 'I may know this later.' },
      { title: 'Prefer not to say', sub: "I don't want to answer this question." },
    ];

    return (
      <div className="screen-container s26-unsure-screen">
        <div className="white-surface-card unsure-card">
          <h3 className="unsure-card-title">
            {isHi ? 'इनमें से कौन सा विकल्प आपके लिए सही है?' : 'Which option applies to you?'}
          </h3>
          <p className="unsure-card-sub">
            {isHi ? 'कृपया नीचे एक विकल्प चुनें।' : 'Please select one option below.'}
          </p>

          <div className="unsure-radio-list">
            {unsureOptions.map((opt, idx) => (
              <div
                key={idx}
                className={`unsure-radio-item ${selectedUnsureOption === idx ? 'selected' : ''}`}
                onClick={() => setSelectedUnsureOption(idx)}
                role="button"
                tabIndex={0}
              >
                <span className={`radio-circle ${selectedUnsureOption === idx ? 'checked' : ''}`} />
                <div className="radio-texts">
                  <h4 className="radio-main">{opt.title}</h4>
                  <p className="radio-sub">{opt.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="consent-info-pill" style={{ marginTop: '16px' }}>
            <span className="info-badge-icon">💡</span>
            <span>
              {isHi ? 'आप यह जानकारी बाद में डॉक्टर से भी साझा कर सकते हैं।' : 'You can always share this information later with your doctor.'}
            </span>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(28)}
          >
            <span>{isHi ? 'आगे बढ़ें' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 27: Red Flag Alert Warning (s27.png)
  if (screenNum === 27) {
    return (
      <div className="screen-container s27-red-flag-screen">
        <div className="white-surface-card red-flag-card">
          <div className="red-flag-header-banner">
            <div className="red-flag-icon-wrap">
              <AlertTriangle size={36} color="#E11D48" />
            </div>
            <div className="red-flag-header-texts">
              <h3 className="rf-headline">
                {isHi ? 'यह एक गंभीर लक्षण हो सकता है' : 'This may be a serious symptom.'}
              </h3>
              <p className="rf-subline">
                {isHi 
                  ? 'तुरंत उचित देखभाल प्राप्त करना महत्वपूर्ण है।' 
                  : "It's important to get the right care as soon as possible."}
              </p>
            </div>
          </div>

          {/* 4 Red Cards matching s27.png */}
          <div className="rf-reasons-box">
            <h4 className="rf-reasons-title">
              {isHi ? 'आपातकालीन देखभाल के सामान्य कारण:' : 'Common reasons to seek urgent care include:'}
            </h4>

            <div className="rf-reasons-grid">
              <div className="rf-reason-card">
                <Heart size={24} color="#E11D48" />
                <span>{isHi ? 'सीने में दर्द या दबाव' : 'Chest pain or pressure'}</span>
              </div>

              <div className="rf-reason-card">
                <Wind size={24} color="#E11D48" />
                <span>{isHi ? 'सांस लेने में भारी तकलीफ' : 'Severe breathlessness'}</span>
              </div>

              <div className="rf-reason-card">
                <HelpCircle size={24} color="#E11D48" />
                <span>{isHi ? 'अचानक चक्कर या बेहोशी' : 'Sudden dizziness or fainting'}</span>
              </div>

              <div className="rf-reason-card">
                <Droplet size={24} color="#E11D48" />
                <span>{isHi ? 'अत्यधिक रक्तस्राव' : 'Severe or uncontrolled bleeding'}</span>
              </div>
            </div>
          </div>

          {/* Blue Guidance Box */}
          <div className="rf-guidance-box">
            <h4>{isHi ? 'अब आपको क्या करना चाहिए?' : 'What should you do now?'}</h4>
            <ul>
              <li>{isHi ? 'कृपया अस्पताल स्टाफ को तत्काल सूचित करें।' : 'Please inform the staff at the facility immediately.'}</li>
              <li>{isHi ? 'वे आपको तुरंत उचित चिकित्सा सहायता दिलाएंगे।' : 'They will help you get the appropriate care.'}</li>
              <li>{isHi ? 'यदि आपात स्थिति है तो आपातकालीन नंबर (108) पर संपर्क करें।' : 'If you feel this is a medical emergency, call 108 or seek immediate help.'}</li>
            </ul>
          </div>

          <button 
            className="footer-primary-pill"
            style={{ width: '100%', marginTop: '20px', backgroundColor: '#059669' }}
            onClick={() => onNavigate(28)}
          >
            <span>{isHi ? 'मैं समझ गया / समझ गई' : 'I understand'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
