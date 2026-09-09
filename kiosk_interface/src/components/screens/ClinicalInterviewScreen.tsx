import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mic, 
  Edit3, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  HelpCircle,
  Volume2
} from 'lucide-react';
import { ScreenId } from '../../types';
import { UI_STRINGS } from '../../utils/languagePrompts';

interface ClinicalInterviewScreenProps {
  currentScreen: ScreenId;
  typedComplaint: string;
  setTypedComplaint: (val: string) => void;
  coughSeverity: string;
  setCoughSeverity: (val: string) => void;
  goTo: (screen: ScreenId) => void;
  isListening?: boolean;
  langCode?: 'en' | 'hi';
  skipMeasurements?: boolean;
}

export const ClinicalInterviewScreen: React.FC<ClinicalInterviewScreenProps> = ({
  currentScreen,
  typedComplaint,
  setTypedComplaint,
  coughSeverity,
  setCoughSeverity,
  goTo,
  isListening = false,
  langCode = 'en',
  skipMeasurements = false,
}) => {
  const isHi = langCode === 'hi';
  const strings = UI_STRINGS[langCode].clinical;

  return (
    <>
      {/* SCREEN 15: MAIN CLINICAL CONVERSATION */}
      {currentScreen === '15_CLINICAL_CONVERSATION' && (
        <motion.div 
          key="15_CLINICAL_CONVERSATION"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="card-header-block" style={{ marginBottom: '4px' }}>
            <div className="card-speech-wave-icon">
              <div className="sound-bar" />
              <div className="sound-bar" />
              <div className="sound-bar" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{strings.exampleSay}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0e6c38' }}>
                {strings.example1}
              </div>
            </div>
          </div>

          {/* Quick symptom chips in Pure Hindi or English */}
          <div style={{ display: 'flex', gap: '6px', margin: '6px 0', flexWrap: 'wrap' }}>
            {strings.chips.map(chip => (
              <div 
                key={chip}
                style={{
                  background: '#f4faf6',
                  border: '1px solid var(--color-mint-border)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0e6c38',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setTypedComplaint(chip);
                  goTo('17_PROCESSING');
                }}
              >
                {chip}
              </div>
            ))}
          </div>

          {/* Centered Large Voice Recording Button */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <motion.div 
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#16a34a',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)'
              }}
              onClick={() => goTo('16_LISTENING')}
            >
              <Mic size={26} />
            </motion.div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0e6c38', marginTop: '4px' }}>
              {strings.tapToSpeakBtn}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              {isHi ? "अपनी स्वाभाविक आवाज़ में हिंदी में बोलें" : "Speak naturally in Hindi or English"}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('19_TOUCH_INPUT')}>
              {isHi ? "लिखकर बताना चाहते हैं?" : "Prefer to type?"}
            </button>
            <button 
              onClick={() => goTo('23_RED_FLAG')}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              {isHi ? "आपातकालीन चेतावनी" : "Test Red-Flag Alert"}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 16: VOICE LISTENING STATE */}
      {currentScreen === '16_LISTENING' && (
        <motion.div 
          key="16_LISTENING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <div className="audio-waves-meter" style={{ justifyContent: 'center', marginBottom: '10px' }}>
            <div className="wave-line" style={{ animationDelay: '0s' }} />
            <div className="wave-line" style={{ animationDelay: '0.2s' }} />
            <div className="wave-line" style={{ animationDelay: '0.4s' }} />
            <div className="wave-line" style={{ animationDelay: '0.1s' }} />
            <div className="wave-line" style={{ animationDelay: '0.3s' }} />
          </div>
          <h2 className="card-main-title">{isHi ? "मैं आपको ध्यान से सुन रहा हूँ..." : "I'm listening to you..."}</h2>
          <p className="card-main-subtitle">{isHi ? "आराम से बताएं आपको क्या तकलीफ महसूस हो रही है।" : "Take your time. Explain what you're experiencing."}</p>

          <div style={{
            margin: '12px auto',
            padding: '10px 14px',
            background: '#f8fafc',
            border: '1.5px dashed var(--color-mint-border)',
            borderRadius: '12px',
            maxWidth: '320px',
            minHeight: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            color: typedComplaint ? '#0e6c38' : '#94a3b8',
            fontWeight: typedComplaint ? 600 : 400,
            fontStyle: typedComplaint ? 'normal' : 'italic'
          }}>
            {typedComplaint || (isHi ? "अपनी स्वाभाविक आवाज़ में बोलें..." : "Speak now in your own words...")}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('17_PROCESSING')}>
              <span>{isHi ? "बोलना समाप्त" : "Done Speaking"}</span>
              <Check size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 17: AI CLINICAL PROCESSING */}
      {currentScreen === '17_PROCESSING' && (
        <motion.div 
          key="17_PROCESSING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <Sparkles size={32} color="#0e6c38" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">{isHi ? "लक्षणों का विश्लेषण जारी है..." : "Understanding your symptoms..."}</h2>
          <p className="card-main-subtitle">{isHi ? "मुख्य तकलीफ, अवधि और संदर्भ निकाला जा रहा है।" : "Extracting chief complaint, duration, and clinical context."}</p>

          <div style={{ maxWidth: '280px', margin: '10px auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
            <div style={{ color: '#16a34a', fontWeight: 600 }}>{isHi ? "✔ आवाज़ से लक्षण पाठ में रूपांतरित" : "✔ Speech converted to clinical text"}</div>
            <div style={{ color: '#16a34a', fontWeight: 600 }}>{isHi ? `✔ दर्ज लक्षण: ${typedComplaint || 'सर्दी और ज़ुकाम'}` : `✔ Elicited chief complaint: ${typedComplaint || 'Cold'}`}</div>
            <div style={{ color: '#0e6c38', fontWeight: 700 }}>{isHi ? "✔ आयुष एवं प्राथमिक ट्राइएज मूल्यांकन सक्रिय..." : "✔ AYUSH assessment active..."}</div>
          </div>

          <button className="btn-primary-pill" onClick={() => goTo('18_I_HEARD_CONFIRM')}>
            <span>{isHi ? "आगे बढ़ें" : "Next"}</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* SCREEN 18: "I HEARD..." CONFIRMATION -> ADAPTIVE CLINICAL BRANCH */}
      {currentScreen === '18_I_HEARD_CONFIRM' && (
        <motion.div 
          key="18_I_HEARD_CONFIRM"
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
              <h2 className="card-main-title">{strings.understoodTitle}</h2>
              <p className="card-main-subtitle">{strings.understoodSubtitle}</p>
            </div>
          </div>

          <div style={{
            background: '#f4faf6',
            border: '1.5px solid var(--color-mint-border)',
            borderRadius: '14px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#0e6c38',
            fontStyle: 'italic',
            margin: '8px 0'
          }}>
            "{typedComplaint || (isHi ? 'मुझे कल से सर्दी और ज़ुकाम है।' : 'I have a cold and runny nose since yesterday.')}"
          </div>

          {skipMeasurements && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '8px 12px',
              margin: '6px 0',
              fontSize: '11px',
              color: '#065f46',
              fontWeight: 600
            }}>
              {isHi 
                ? "💡 चिकित्सीय ट्राइएज: इन लक्षणों (सर्दी-ज़ुकाम) के लिए रक्तचाप नापने की आवश्यकता नहीं है। सीधे परामर्श पर्चे पर जाएं।" 
                : "💡 Clinical Triage: Based on cold symptoms, routine BP measurement is not required. Advancing directly to case preparation."}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('19_TOUCH_INPUT')}>
              <Edit3 size={13} /> {isHi ? "सुधारें" : "Edit response"}
            </button>
            <button 
              className="btn-primary-pill" 
              onClick={() => {
                // Adaptive routing: skip vitals for cold!
                if (skipMeasurements) {
                  goTo('30_DOCUMENT_INTRO');
                } else {
                  goTo('20_CHOICE_QUESTION');
                }
              }}
            >
              <Check size={16} /> {isHi ? "हाँ, यह सही है" : "Yes, that's right"}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 19: TOUCH KEYPAD FALLBACK */}
      {currentScreen === '19_TOUCH_INPUT' && (
        <motion.div 
          key="19_TOUCH_INPUT"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <h2 className="card-main-title">{strings.orType}</h2>
          <p className="card-main-subtitle">{isHi ? "आज अस्पताल किस तकलीफ से आए हैं? अपनी भाषा में लिखें।" : "What brings you here today? Type in your own words."}</p>

          <textarea 
            value={typedComplaint}
            onChange={(e) => setTypedComplaint(e.target.value)}
            placeholder={strings.typePlaceholder}
            style={{
              width: '100%',
              height: '68px',
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1.5px solid var(--color-mint-border)',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              marginTop: '6px'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('15_CLINICAL_CONVERSATION')}>
              {isHi ? "रद्द करें" : "Cancel"}
            </button>
            <button 
              className="btn-primary-pill" 
              onClick={() => {
                if (skipMeasurements) {
                  goTo('30_DOCUMENT_INTRO');
                } else {
                  goTo('20_CHOICE_QUESTION');
                }
              }}
            >
              {strings.confirmBtn}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 20: CHOICE QUESTION */}
      {currentScreen === '20_CHOICE_QUESTION' && (
        <motion.div 
          key="20_CHOICE_QUESTION"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="card-header-block" style={{ marginBottom: '4px' }}>
            <div className="card-speech-wave-icon">
              <div className="sound-bar" />
              <div className="sound-bar" />
              <div className="sound-bar" />
            </div>
            <div>
              <h2 className="card-main-title">{strings.choiceTitle}</h2>
              <p className="card-main-subtitle">{strings.choiceSubtitle}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '6px 0' }}>
            {[
              { 
                title: isHi ? 'कोई खांसी नहीं है' : 'No cough', 
                desc: isHi ? 'सांस लेने में कोई खांसी नहीं' : 'No respiratory coughing symptoms' 
              },
              { 
                title: isHi ? 'हल्की सूखी खांसी' : 'Mild cough', 
                desc: isHi ? 'गले में हल्की खराश या छींक' : 'Occasional, dry or mild throat tickle' 
              },
              { 
                title: isHi ? 'मध्यम खांसी' : 'Moderate cough', 
                desc: isHi ? 'बार-बार बलगम के साथ खांसी' : 'Frequent cough with phlegm' 
              },
              { 
                title: isHi ? 'तीव्र खांसी' : 'Severe cough', 
                desc: isHi ? 'सीने में खिंचाव पैदा करने वाली खांसी' : 'Persistent cough causing chest strain' 
              }
            ].map(opt => (
              <div 
                key={opt.title}
                className={`selection-card ${coughSeverity === opt.title ? 'selected' : ''}`}
                style={{ padding: '7px 12px' }}
                onClick={() => setCoughSeverity(opt.title)}
              >
                <div style={{
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  border: coughSeverity === opt.title ? '5px solid #16a34a' : '2px solid #cbd5e1',
                  background: '#fff'
                }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0e6c38' }}>{opt.title}</div>
                  <div style={{ fontSize: '9.5px', color: '#64748b' }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('22_UNKNOWN_NOT_SURE')}>
              {isHi ? "पता नहीं है" : "I'm not sure"}
            </button>
            <button 
              className="btn-primary-pill" 
              onClick={() => {
                if (skipMeasurements) {
                  goTo('30_DOCUMENT_INTRO');
                } else {
                  goTo('24_MEASUREMENTS_INTRO');
                }
              }}
            >
              <span>{isHi ? "आगे बढ़ें" : "Next"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 21: RETRY UNCLEAR */}
      {currentScreen === '21_RETRY_UNCLEAR' && (
        <motion.div 
          key="21_RETRY_UNCLEAR"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <Volume2 size={32} color="#f59e0b" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">{isHi ? "मैं ठीक से सुन नहीं पाया" : "I didn't quite catch that"}</h2>
          <p className="card-main-subtitle">{isHi ? "कृपया थोड़ा जोर से बोलें या नीचे दिए गए विकल्प चुनें।" : "Please speak a bit louder or choose an option below."}</p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('19_TOUCH_INPUT')}>
              {isHi ? "स्क्रीन पर लिखें" : "Type on Screen"}
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('16_LISTENING')}>
              {isHi ? "दोबारा बोलें" : "Try Speaking Again"}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 22: UNKNOWN / NOT SURE */}
      {currentScreen === '22_UNKNOWN_NOT_SURE' && (
        <motion.div 
          key="22_UNKNOWN_NOT_SURE"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <HelpCircle size={32} color="#0e6c38" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">{isHi ? "कोई चिंता की बात नहीं!" : "No worries at all!"}</h2>
          <p className="card-main-subtitle">{isHi ? "यदि आप निश्चित नहीं हैं तो कोई बात नहीं। डॉक्टर अंजलि वर्मा आपसे सीधे बात करेंगी।" : "It's completely fine if you're not sure. Dr. Anjali Verma will discuss this with you directly."}</p>

          <div style={{ marginTop: '14px' }}>
            <button 
              className="btn-primary-pill" 
              onClick={() => {
                if (skipMeasurements) {
                  goTo('30_DOCUMENT_INTRO');
                } else {
                  goTo('24_MEASUREMENTS_INTRO');
                }
              }}
            >
              <span>{skipMeasurements ? (isHi ? "पर्चा स्कैन की ओर बढ़ें" : "Proceed to Documents") : (isHi ? "परीक्षण जारी रखें" : "Continue to Measurements")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 23: RED FLAG ALERT */}
      {currentScreen === '23_RED_FLAG' && (
        <motion.div 
          key="23_RED_FLAG"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ border: '1.5px solid #ef4444', borderRadius: '18px', padding: '12px', background: '#fff5f5' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
            <AlertTriangle size={22} />
            <h2 style={{ fontSize: '15px', fontWeight: 800 }}>{strings.redFlagTitle}</h2>
          </div>
          <p style={{ fontSize: '11px', color: '#991b1b', marginTop: '3px' }}>
            {strings.redFlagSubtitle}
          </p>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '8px 12px', margin: '8px 0', border: '1px solid #fecaca', fontSize: '10.5px', color: '#7f1d1d' }}>
            <strong>{isHi ? "सुरक्षा निर्देश:" : "Safety Action Steps:"}</strong>
            <ul style={{ paddingLeft: '14px', marginTop: '3px', lineHeight: 1.4 }}>
              <li>{isHi ? "डॉक्टर अंजलि की कतार में आपातकालीन नर्स को सूचित कर दिया गया है।" : "The triage nurse has been notified in Dr. Anjali's queue."}</li>
              <li>{isHi ? "यदि अत्यधिक बेचैनी हो तो सहायक को तुरंत सूचित करें।" : "Please inform the facility assistant if feeling acute distress."}</li>
            </ul>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button className="btn-primary-pill" style={{ background: '#dc2626' }} onClick={() => goTo('24_MEASUREMENTS_INTRO')}>
              {isHi ? "समझ गया → आगे बढ़ें" : "I understand → Proceed"}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
