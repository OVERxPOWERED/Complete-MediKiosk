import React from 'react';
import { 
  ClipboardList, 
  Heart, 
  FileText, 
  Users, 
  Radio, 
  ArrowRight, 
  Globe, 
  Accessibility, 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Mic
} from 'lucide-react';

interface ScreenGroup1to4Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  onLanguageSelect: (lang: 'en' | 'hi') => void;
  onConsentGiven: (agree: boolean) => void;
  selectedLanguage: 'en' | 'hi';
}

export const ScreenGroup1to4: React.FC<ScreenGroup1to4Props> = ({
  screenNum,
  onNavigate,
  onLanguageSelect,
  onConsentGiven,
  selectedLanguage,
}) => {
  const isHi = selectedLanguage === 'hi';

  // SCREEN 1: Idle Screen (s1.png)
  if (screenNum === 1) {
    return (
      <div className="screen-container s1-idle-screen">
        <div className="s1-content-wrapper">
          {/* Main 4 features card */}
          <div className="white-surface-card s1-features-card">
            <div className="s1-features-grid">
              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-green">
                  <ClipboardList size={26} color="#059669" />
                </div>
                <span className="feature-title">
                  {isHi ? 'स्वास्थ्य जानकारी साझा करें' : 'Share your health information'}
                </span>
              </div>

              <div className="col-divider" />

              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-pink">
                  <Heart size={26} color="#E11D48" />
                </div>
                <span className="feature-title">
                  {isHi ? 'सामान्य जांच कराएं' : 'Get your measurements'}
                </span>
              </div>

              <div className="col-divider" />

              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-blue">
                  <FileText size={26} color="#2563EB" />
                </div>
                <span className="feature-title">
                  {isHi ? 'मेडिकल रिपोर्ट्स अपलोड करें' : 'Upload your medical reports'}
                </span>
              </div>

              <div className="col-divider" />

              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-yellow">
                  <Users size={26} color="#D97706" />
                </div>
                <span className="feature-title">
                  {isHi ? 'तेज़ और सुगम परामर्श' : 'A faster, smoother consultation'}
                </span>
              </div>
            </div>
          </div>

          {/* Step closer to begin radar card */}
          <div 
            className="step-closer-card"
            onClick={() => onNavigate(2)}
            role="button"
            tabIndex={0}
          >
            <div className="radar-icon-wrap">
              <Radio size={28} color="#00796B" />
            </div>
            <div className="radar-texts">
              <h3 className="radar-title">
                {isHi ? 'शुरू करने के लिए पास आएं' : 'Step closer to begin'}
              </h3>
              <p className="radar-subtitle">
                {isHi ? 'आप "Start" भी बोल सकते हैं या स्क्रीन को छू सकते हैं' : 'You can also say "Start" or touch the screen'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: Welcome Screen (s2.png)
  if (screenNum === 2) {
    return (
      <div className="screen-container s2-welcome-screen">
        <div className="s2-content-wrapper">
          {/* Main 4 features card */}
          <div className="white-surface-card s2-features-card">
            <div className="s1-features-grid">
              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-green">
                  <ClipboardList size={26} color="#059669" />
                </div>
                <span className="feature-title">
                  {isHi ? 'स्वास्थ्य जानकारी साझा करें' : 'Share your health information'}
                </span>
              </div>

              <div className="col-divider" />

              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-green">
                  <Heart size={26} color="#059669" />
                </div>
                <span className="feature-title">
                  {isHi ? 'चेक-अप तैयार कराएं' : 'Get your check-up ready'}
                </span>
              </div>

              <div className="col-divider" />

              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-green">
                  <FileText size={26} color="#059669" />
                </div>
                <span className="feature-title">
                  {isHi ? 'मेडिकल रिपोर्ट्स अपलोड करें' : 'Upload your medical reports'}
                </span>
              </div>

              <div className="col-divider" />

              <div className="feature-col">
                <div className="feature-icon-circle icon-bg-green">
                  <Users size={26} color="#059669" />
                </div>
                <span className="feature-title">
                  {isHi ? 'तेज़ और सुगम परामर्श' : 'A faster, smoother consultation'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Start Button */}
          <button 
            className="s2-start-pill-btn"
            onClick={() => onNavigate(3)}
          >
            <span>{isHi ? 'शुरू करें' : 'Start'}</span>
            <ArrowRight size={22} />
          </button>

          <p className="s2-voice-hint">
            {isHi ? 'आप आगे बढ़ने के लिए बोल सकते हैं या स्क्रीन को छू सकते हैं।' : 'You can speak or touch the screen to continue.'}
          </p>

          {/* Bottom language & accessibility buttons */}
          <div className="s2-bottom-actions">
            <button 
              className="bottom-pill-btn"
              onClick={() => onNavigate(3)}
            >
              <Globe size={18} />
              <span>{isHi ? 'भाषा बदलें' : 'Change language'}</span>
            </button>

            <button className="bottom-pill-btn">
              <Accessibility size={18} />
              <span>{isHi ? 'सुगमता' : 'Accessibility'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 3: Language Selection (s3.png)
  if (screenNum === 3) {
    const languages = [
      { id: 'en', script: 'A', name: 'English', sub: 'English', color: '#00796B', bg: '#E0F2F1' },
      { id: 'hi', script: 'अ', name: 'हिन्दी', sub: 'Hindi', color: '#E11D48', bg: '#FFE4E6' },
      { id: 'bn', script: 'অ', name: 'বাংলা', sub: 'Bengali', color: '#2563EB', bg: '#DBEAFE' },
      { id: 'mr', script: 'अ', name: 'मराठी', sub: 'Marathi', color: '#D97706', bg: '#FEF3C7' },
      { id: 'ta', script: 'அ', name: 'தமிழ்', sub: 'Tamil', color: '#7C3AED', bg: '#EDE9FE' },
      { id: 'te', script: 'అ', name: 'తెలుగు', sub: 'Telugu', color: '#059669', bg: '#D1FAE5' },
    ];

    return (
      <div className="screen-container s3-language-screen">
        <div className="s3-cards-grid">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className={`language-card ${(selectedLanguage === lang.id) ? 'selected' : ''}`}
              onClick={() => {
                onLanguageSelect(lang.id === 'hi' ? 'hi' : 'en');
              }}
              role="button"
              tabIndex={0}
            >
              <div 
                className="lang-script-badge" 
                style={{ backgroundColor: lang.bg, color: lang.color }}
              >
                {lang.script}
              </div>
              <h3 className="lang-name">{lang.name}</h3>
              <span className="lang-sub">{lang.sub}</span>
            </div>
          ))}
        </div>

        {/* Voice helper hint pill */}
        <div className="voice-helper-pill">
          <div className="mic-badge-small">
            <Mic size={14} color="#ffffff" />
          </div>
          <span>
            {isHi ? 'उदाहरण के लिए, आप "Hindi" या "English" बोल सकते हैं।' : 'For example, you can say "Hindi" or "English".'}
          </span>
        </div>
      </div>
    );
  }

  // SCREEN 4: Digital Health Consent (s4.png)
  if (screenNum === 4) {
    return (
      <div className="screen-container s4-consent-screen">
        <div className="white-surface-card consent-card">
          <h3 className="consent-card-title">
            {isHi ? 'हम यह जानकारी क्यों एकत्र करते हैं?' : 'Why we collect this information?'}
          </h3>
          <p className="consent-card-sub">
            {isHi 
              ? 'आपकी जानकारी हमें डॉक्टर के लिए आपकी फाइल तैयार करने और आपके अनुभव को बेहतर बनाने में मदद करती है।'
              : 'Your information helps us prepare your case for the doctor and improve your experience.'}
          </p>

          <div className="consent-reasons-grid">
            <div className="consent-reason-item">
              <div className="reason-icon-wrap icon-bg-green">
                <ClipboardList size={22} color="#059669" />
              </div>
              <h4 className="reason-title">
                {isHi ? 'सेहत की स्थिति समझना' : 'Understand your health condition'}
              </h4>
              <p className="reason-desc">
                {isHi 
                  ? 'हम आपके लक्षण, मेडिकल इतिहास और माप एकत्र करते हैं।' 
                  : 'We collect your symptoms, medical history and measurements.'}
              </p>
            </div>

            <div className="consent-reason-item">
              <div className="reason-icon-wrap icon-bg-blue">
                <FileText size={22} color="#2563EB" />
              </div>
              <h4 className="reason-title">
                {isHi ? 'मेडिकल रिपोर्ट्स का उपयोग' : 'Use your medical reports'}
              </h4>
              <p className="reason-desc">
                {isHi 
                  ? 'हम आपकी पिछली रिपोर्ट्स स्कैन और पढ़ सकते हैं।' 
                  : 'We may scan and read your previous reports (if available).'}
              </p>
            </div>

            <div className="consent-reason-item">
              <div className="reason-icon-wrap icon-bg-yellow">
                <Users size={22} color="#D97706" />
              </div>
              <h4 className="reason-title">
                {isHi ? 'केवल डॉक्टर के साथ साझा' : 'Share with your doctor only'}
              </h4>
              <p className="reason-desc">
                {isHi 
                  ? 'आपकी जानकारी केवल आपकी हेल्थकेयर टीम के साथ साझा की जाती है।' 
                  : 'Your information is shared only with your healthcare team.'}
              </p>
            </div>

            <div className="consent-reason-item">
              <div className="reason-icon-wrap icon-bg-pink">
                <ShieldCheck size={22} color="#E11D48" />
              </div>
              <h4 className="reason-title">
                {isHi ? 'डेटा पूरी तरह सुरक्षित' : 'Keep your data safe'}
              </h4>
              <p className="reason-desc">
                {isHi 
                  ? 'अस्पताल नियमों और गोपनीयता कानूनों के अनुसार डेटा सुरक्षित रहता है।' 
                  : 'Your information is stored securely and confidentially as per laws.'}
              </p>
            </div>
          </div>

          <div className="consent-info-pill">
            <span className="info-badge-icon">i</span>
            <span>
              {isHi 
                ? 'आप मुझसे पूछ सकते हैं कि आपकी जानकारी का उपयोग कैसे किया जाता है।' 
                : 'You can ask me any questions about how your information is used.'}
            </span>
          </div>
        </div>

        {/* 3 action buttons matching s4.png */}
        <div className="s4-actions-row">
          <button className="s4-action-btn secondary">
            <HelpCircle size={20} color="#00796B" />
            <div className="btn-text-col">
              <span className="btn-main-text">{isHi ? 'सवाल पूछें' : 'I have a question'}</span>
              <span className="btn-sub-text">{isHi ? 'और जानें' : 'Ask me more'}</span>
            </div>
          </button>

          <button 
            className="s4-action-btn primary"
            onClick={() => {
              onConsentGiven(true);
              onNavigate(5);
            }}
          >
            <Check size={22} color="#ffffff" strokeWidth={3} />
            <div className="btn-text-col">
              <span className="btn-main-text">{isHi ? 'मैं सहमत हूँ' : 'I agree'}</span>
              <span className="btn-sub-text">{isHi ? 'आगे बढ़ें' : 'Continue'}</span>
            </div>
          </button>

          <button 
            className="s4-action-btn danger"
            onClick={() => onConsentGiven(false)}
          >
            <X size={20} color="#6B7280" />
            <div className="btn-text-col">
              <span className="btn-main-text">{isHi ? 'सहमत नहीं' : 'Do not agree'}</span>
              <span className="btn-sub-text">{isHi ? 'कियोस्क छोड़ें' : 'Exit the kiosk'}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
