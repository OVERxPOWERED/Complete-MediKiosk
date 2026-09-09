import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  Printer, 
  Check, 
  ArrowRight, 
  Heart 
} from 'lucide-react';
import { ScreenId, PatientData } from '../../types';

interface CompletionScreenProps {
  currentScreen: ScreenId;
  patientData: PatientData;
  hisPushStatus: 'idle' | 'pushing' | 'synced';
  goTo: (screen: ScreenId) => void;
  onSubmitIntake?: () => Promise<void>;
  langCode?: 'en' | 'hi';
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  currentScreen,
  patientData,
  hisPushStatus,
  goTo,
  onSubmitIntake,
  langCode = 'en',
}) => {
  const isHi = langCode === 'hi';

  return (
    <>
      {/* SCREEN 37: PREPARING YOUR CASE */}
      {currentScreen === '37_PREPARING_CASE' && (
        <motion.div 
          key="37_PREPARING_CASE"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <Sparkles size={34} color="#0e6c38" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">
            {isHi ? "केस सारांश तैयार किया जा रहा है..." : "Assembling Consultation Summary..."}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "लक्षण, परीक्षण और पुराने पर्चे डॉक्टर अंजलि वर्मा को भेजे जा रहे हैं।" : "Synthesizing verbal history, sensor vitals, and reports for Dr. Anjali Verma."}
          </p>

          <div style={{
            width: '80%',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '999px',
            margin: '14px auto 0 auto',
            overflow: 'hidden'
          }}>
            <motion.div 
              style={{ height: '100%', background: '#16a34a' }}
              animate={{ width: ['15%', '75%', '100%'] }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              onAnimationComplete={() => {
                if (onSubmitIntake) {
                  onSubmitIntake();
                }
                setTimeout(() => goTo('38_CASE_READY'), 600);
              }}
            />
          </div>
        </motion.div>
      )}

      {/* SCREEN 38: CASE READY */}
      {currentScreen === '38_CASE_READY' && (
        <motion.div 
          key="38_CASE_READY"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">
            {isHi ? "आपकी केस फाइल पूरी तरह तैयार है!" : "Your Clinical Case is Ready!"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "लक्षण, परीक्षण और सभी विवरण संकलित कर लिए गए हैं।" : "Combined chief complaints, vitals, AYUSH parameters, and documents."}
          </p>

          <div style={{ marginTop: '14px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('39_VISIT_QR')}>
              <span>{isHi ? "परामर्श टोकन देखें" : "Generate Visit QR"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 39: VISIT QR CREATED */}
      {currentScreen === '39_VISIT_QR' && (
        <motion.div 
          key="39_VISIT_QR"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center' }}
        >
          <h2 className="card-main-title">
            {isHi ? "आपका परामर्श टोकन तैयार है!" : "Your Visit QR Code is Ready!"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "यह क्यूआर कोड काउंटर पर दिखाएं या अपना रिस्टबैंड प्राप्त करें।" : "Scan this code at Dr. Anjali's door or print your triage wristband."}
          </p>

          <div style={{
            background: '#ffffff',
            border: '1.5px solid var(--color-mint-border)',
            borderRadius: '16px',
            padding: '10px',
            width: 'fit-content',
            margin: '8px auto',
            boxShadow: '0 4px 14px rgba(14, 108, 56, 0.08)'
          }}>
            <QrCode size={80} color="#0e6c38" />
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0e6c38', marginTop: '3px' }}>
              {isHi ? `टोकन #${patientData.token}` : `Token #${patientData.token}`}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>
              {patientData.name} · {patientData.uhid}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('40_WRISTBAND_PRINTING')}>
              <span>{isHi ? "कलाई का बैंड प्रिंट करें" : "Print Wristband"}</span>
              <Printer size={15} />
            </button>
            <button className="btn-secondary-pill" onClick={() => goTo('42_ALL_SET')}>
              {isHi ? "सीधे कक्ष में जाएं" : "Skip to Room"}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 40: WRISTBAND PRINTING INTRO */}
      {currentScreen === '40_WRISTBAND_PRINTING' && (
        <motion.div 
          key="40_WRISTBAND_PRINTING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <h2 className="card-main-title">
            {isHi ? "मरीज़ रिस्टबैंड निकल रहा है..." : "Dispensing Thermal Wristband..."}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "टोकन और बायोमेट्रिक विवरण रिस्टबैंड पर मुद्रित हो रहा है।" : "Encoding patient token and biometric identifier onto wristband."}
          </p>

          {/* Wristband Animation */}
          <div className="wristband-dispenser-tray">
            <div className="wristband-band">
              <span>🎟 {isHi ? `मेडीकियोस्क #${patientData.token}` : `MEDIKIOSK #${patientData.token}`}</span>
            </div>
          </div>

          <button className="btn-primary-pill" onClick={() => goTo('41_COLLECT_WRISTBAND')}>
            <span>{isHi ? "रिस्टबैंड प्राप्त करें" : "Collect Wristband"}</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* SCREEN 41: COLLECT WRISTBAND */}
      {currentScreen === '41_COLLECT_WRISTBAND' && (
        <motion.div 
          key="41_COLLECT_WRISTBAND"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <h2 className="card-main-title">
            {isHi ? "अपना रिस्टबैंड ले लें" : "Take Your Wristband"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "इसे अपनी कलाई पर बांधें। चिकित्सक इसे तुरंत स्कैन कर सकते हैं।" : "Fasten around your wrist. The doctor can scan it instantly."}
          </p>

          <div style={{
            background: '#f4faf6',
            border: '1.5px solid var(--color-mint-border)',
            borderRadius: '12px',
            padding: '8px 16px',
            margin: '10px auto',
            width: 'fit-content',
            fontSize: '13px',
            fontWeight: 700,
            color: '#0e6c38'
          }}>
            🎟 {isHi ? `टोकन #${patientData.token}` : `Token #${patientData.token}`} · {patientData.name}
          </div>

          <button className="btn-primary-pill" onClick={() => goTo('42_ALL_SET')}>
            <span>{isHi ? "मैंने रिस्टबैंड ले लिया" : "I Collected My Wristband"}</span>
            <Check size={16} />
          </button>
        </motion.div>
      )}

      {/* SCREEN 42: YOU'RE ALL SET */}
      {currentScreen === '42_ALL_SET' && (
        <motion.div 
          key="42_ALL_SET"
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
              <h2 className="card-main-title">
                {isHi ? "सब तैयार है! परामर्श कक्ष 4 में जाएं" : "You're All Set! Proceed to Room 4"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "आपकी केस फाइल डॉक्टर अंजलि वर्मा के वर्कस्टेशन पर लाइव है।" : "Your case record is live in Dr. Anjali Verma's workstation."}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '8px 0' }}>
            <img 
              src="/assets/doctor_avatar.png" 
              alt="Dr. Anjali Verma" 
              style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #16a34a', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0e6c38' }}>
                {isHi ? "डॉ. अंजलि वर्मा, एमडी" : "Dr. Anjali Verma, MD"}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {isHi ? "सामान्य चिकित्सा · परामर्श कक्ष 4" : "General Medicine · Consultation Room 4"}
              </div>
              <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>
                {isHi ? `कतार में अगला क्रम · टोकन #${patientData.token}` : `Next in line · Queue Token #${patientData.token}`}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('43_SESSION_COMPLETE')}>
              <span>{isHi ? "चेक-इन समाप्त करें" : "Finish Check-In"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 43: SESSION COMPLETE */}
      {currentScreen === '43_SESSION_COMPLETE' && (
        <motion.div 
          key="43_SESSION_COMPLETE"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <Heart size={34} color="#0e6c38" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title" style={{ fontSize: '22px' }}>
            {isHi ? "धन्यवाद!" : "Thank You!"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "आपका चेक-इन बिना किसी कागज़ी कार्रवाई के पूरा हो गया है।\nहम आपके शीघ्र स्वस्थ होने की कामना करते हैं!" : "Your intake is completed without manual paperwork.\nWishing you a speedy recovery!"}
          </p>

          <div style={{ marginTop: '14px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('00_IDLE')}>
              <span>{isHi ? "होम स्क्रीन पर लौटें" : "Return to Kiosk Home"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
