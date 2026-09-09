import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Globe, 
  Accessibility, 
  FileText, 
  Activity, 
  Heart, 
  Sparkles, 
  Mic, 
  ShieldCheck, 
  User, 
  HelpCircle, 
  Check 
} from 'lucide-react';
import { ScreenId } from '../../types';
import { UI_STRINGS } from '../../utils/languagePrompts';

interface WelcomeScreenProps {
  currentScreen: ScreenId;
  presenceDetected: boolean;
  idleScene: number;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  goTo: (screen: ScreenId) => void;
  langCode?: 'en' | 'hi';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentScreen,
  presenceDetected,
  idleScene,
  selectedLanguage,
  setSelectedLanguage,
  goTo,
  langCode = 'en'
}) => {
  const isHi = langCode === 'hi';
  const strings = UI_STRINGS[langCode];

  return (
    <>
      {/* SCREEN 00: IDLE & STANDBY */}
      {currentScreen === '00_IDLE' && (
        <motion.div 
          key="00_IDLE"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          {!presenceDetected ? (
            <div>
              <div className="card-main-title" style={{ fontSize: 'clamp(20px, 2.5vw, 24px)' }}>
                {idleScene === 1 && strings.welcome.title1}
                {idleScene === 2 && strings.welcome.title2}
                {idleScene === 3 && strings.welcome.title3}
                {idleScene === 4 && strings.welcome.title4}
                {idleScene === 5 && strings.welcome.title5}
                {idleScene === 6 && strings.welcome.title6}
              </div>
              <div className="card-main-subtitle" style={{ fontSize: '14px', marginTop: '6px' }}>
                {idleScene === 1 && strings.welcome.subtitle1}
                {idleScene === 2 && strings.welcome.subtitle2}
                {idleScene === 3 && strings.welcome.subtitle3}
                {idleScene === 4 && strings.welcome.subtitle4}
                {idleScene === 5 && strings.welcome.subtitle5}
                {idleScene === 6 && strings.welcome.subtitle6}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn-primary-pill" onClick={() => goTo('01_WELCOME')}>
                  <span>{strings.welcome.touchToStart}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="card-main-title" style={{ fontSize: 'clamp(22px, 2.8vw, 26px)' }}>
                {isHi ? "नमस्ते! 👋" : "Hello! 👋"}
              </div>
              <div className="card-main-subtitle" style={{ fontSize: '15px', marginTop: '6px' }}>
                {isHi ? "मैं डॉक्टर से परामर्श के लिए आपकी तैयारी में मदद कर सकता हूँ।" : "I can help you prepare for your doctor visit."}
              </div>
              <div style={{ marginTop: '20px' }}>
                <button className="btn-primary-pill" onClick={() => goTo('01_WELCOME')}>
                  <span>{strings.welcome.startPreparation}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* SCREEN 01: WELCOME SCREEN */}
      {currentScreen === '01_WELCOME' && (
        <motion.div 
          key="01_WELCOME"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
        >
          <div className="card-header-block">
            <div className="card-speech-wave-icon">
              <div className="sound-bar" />
              <div className="sound-bar" />
              <div className="sound-bar" />
            </div>
            <div>
              <h2 className="card-main-title">{isHi ? "मेडीकियोस्क में आपका स्वागत है!" : "Welcome to MediKiosk!"}</h2>
              <p className="card-main-subtitle">{isHi ? "मैं डॉक्टर परामर्श के लिए आपकी तैयारी में सहायता करूँगा।" : "I'll help you get ready for your doctor consultation."}</p>
            </div>
          </div>

          {/* 4 Feature Callouts in Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(8px, 1.4vw, 12px)', margin: 'clamp(8px, 1.6vh, 16px) 0' }}>
            {[
              { icon: <FileText size={20} />, title: isHi ? 'लक्षण बताएं' : 'Share your health story' },
              { icon: <Activity size={20} />, title: isHi ? 'स्वास्थ्य परीक्षण' : 'Record your vitals' },
              { icon: <Heart size={20} />, title: isHi ? 'पुराने पर्चे' : 'Scan previous reports' },
              { icon: <Sparkles size={20} />, title: isHi ? 'डॉक्टर के लिए तैयार' : 'Ready for Dr. Anjali' }
            ].map(f => (
              <div key={f.title} style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: 'clamp(10px, 1.6vh, 14px) clamp(6px, 1vw, 10px)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ color: '#0e6c38' }}>{f.icon}</div>
                <span style={{ fontSize: 'clamp(10.5px, 1.2vw, 12px)', fontWeight: 700, color: '#334155', lineHeight: 1.25 }}>{f.title}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', margin: 'clamp(6px, 1.2vh, 14px) 0' }}>
            <button 
              className="btn-primary-pill" 
              onClick={() => goTo('02_LANGUAGE')} 
              style={{ padding: 'clamp(10px, 1.5vh, 14px) clamp(32px, 4.5vw, 48px)', fontSize: 'clamp(16px, 2vw, 19px)' }}
            >
              <span>{isHi ? "शुरू करें" : "Start"}</span>
              <ArrowRight size={20} />
            </button>
            <div style={{ fontSize: 'clamp(11px, 1.4vw, 12.5px)', color: '#64748b', marginTop: '6px' }}>
              {isHi ? "आप स्वाभाविक आवाज़ में बोल सकते हैं या स्क्रीन छू सकते हैं।" : "You can speak naturally or touch the screen to begin."}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: 'clamp(11.5px, 1.4vw, 13px)' }}>
            <button 
              onClick={() => goTo('02_LANGUAGE')}
              style={{ background: 'none', border: 'none', color: '#0e6c38', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
            >
              <Globe size={14} /> {strings.welcome.changeLanguage}
            </button>
            <button 
              onClick={() => alert(isHi ? 'सुलभता मोड: उच्च कंट्रास्ट और स्पष्ट मौखिक मार्गदर्शन सक्षम।' : 'Accessibility mode: High contrast & enhanced verbal guidance enabled.')}
              style={{ background: 'none', border: 'none', color: '#0e6c38', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
            >
              <Accessibility size={14} /> {strings.welcome.accessibility}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 02: LANGUAGE */}
      {currentScreen === '02_LANGUAGE' && (
        <motion.div 
          key="02_LANGUAGE"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="card-header-block">
            <div className="card-speech-wave-icon">
              <div className="sound-bar" />
              <div className="sound-bar" />
              <div className="sound-bar" />
            </div>
            <div>
              <h2 className="card-main-title">{strings.welcome.languageTitle}</h2>
              <p className="card-main-subtitle">{strings.welcome.languageSubtitle}</p>
            </div>
          </div>

          <div className="grid-3-cards" style={{ margin: 'clamp(8px, 1.4vh, 16px) 0' }}>
            {[
              { code: 'A', name: 'English', sub: 'English' },
              { code: 'अ', name: 'हिन्दी', sub: 'Hindi' },
              { code: 'অ', name: 'বাংলা', sub: 'Bengali' },
              { code: 'अ', name: 'मराठी', sub: 'Marathi' },
              { code: 'அ', name: 'தமிழ்', sub: 'Tamil' },
              { code: 'అ', name: 'తెలుగు', sub: 'Telugu' }
            ].map(l => (
              <div 
                key={l.sub}
                className={`selection-card ${(selectedLanguage === l.sub || (l.sub === 'Hindi' && isHi)) ? 'selected' : ''}`}
                style={{ flexDirection: 'column', textAlign: 'center', padding: 'clamp(12px, 1.8vh, 18px) clamp(6px, 1.2vw, 12px)' }}
                onClick={() => {
                  setSelectedLanguage(l.sub);
                  goTo('03_CONSENT');
                }}
              >
                <div style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#0e6c38' }}>{l.code}</div>
                <div style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', fontWeight: 700, color: '#0e6c38', marginTop: '2px' }}>{l.name}</div>
                <div style={{ fontSize: 'clamp(10.5px, 1.3vw, 12px)', color: '#64748b' }}>{l.sub}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: 'clamp(11.5px, 1.4vw, 13px)',
            color: '#0e6c38',
            fontWeight: 600,
            margin: '6px auto 0 auto',
            background: '#f4faf6',
            padding: '6px 16px',
            borderRadius: '999px',
            width: 'fit-content'
          }}>
            <Mic size={14} />
            <span>{isHi ? "उदाहरण के लिए, आप 'हिंदी' या 'अंग्रेज़ी' कह सकते हैं।" : "For example, you can say 'Hindi' or 'English'."}</span>
          </div>
        </motion.div>
      )}

      {/* SCREEN 03: CONSENT */}
      {currentScreen === '03_CONSENT' && (
        <motion.div 
          key="03_CONSENT"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="card-header-block">
            <div className="card-speech-wave-icon">
              <div className="sound-bar" />
              <div className="sound-bar" />
              <div className="sound-bar" />
            </div>
            <div>
              <h2 className="card-main-title">{strings.consent.title}</h2>
              <p className="card-main-subtitle">{strings.consent.subtitle}</p>
            </div>
          </div>

          <div style={{ fontSize: 'clamp(11.5px, 1.4vw, 13px)', fontWeight: 700, color: '#0e6c38', marginBottom: '6px' }}>
            {isHi ? "हम यह जानकारी क्यों एकत्र करते हैं:" : "Why we collect this information:"}
          </div>

          <div className="grid-2-cards" style={{ gap: 'clamp(8px, 1.3vw, 12px)' }}>
            {[
              { icon: <FileText size={18} />, title: strings.consent.card1Title, desc: strings.consent.card1Desc },
              { icon: <Heart size={18} />, title: strings.consent.card2Title, desc: strings.consent.card2Desc },
              { icon: <User size={18} />, title: strings.consent.card3Title, desc: strings.consent.card3Desc },
              { icon: <ShieldCheck size={18} />, title: strings.consent.card4Title, desc: strings.consent.card4Desc }
            ].map(c => (
              <div key={c.title} className="selection-card" style={{ padding: 'clamp(8px, 1.4vh, 12px) clamp(10px, 1.6vw, 14px)' }}>
                <div style={{ color: '#0e6c38' }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: 700, color: '#0e6c38' }}>{c.title}</div>
                  <div style={{ fontSize: 'clamp(10px, 1.2vw, 11.5px)', color: '#64748b', marginTop: '1px' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(10px, 1.6vh, 16px)' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('22_UNKNOWN_NOT_SURE')}>
              <HelpCircle size={15} />
              <span>{strings.consent.btnQuestion}</span>
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('04_EXISTING_NEW')}>
              <Check size={17} />
              <span>{strings.consent.btnAgree}</span>
            </button>
            <button 
              onClick={() => goTo('00_IDLE')}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 'clamp(11px, 1.3vw, 12.5px)', fontWeight: 600, cursor: 'pointer' }}
            >
              {strings.consent.btnDisagree}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
