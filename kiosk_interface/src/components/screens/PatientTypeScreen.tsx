import React from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  User, 
  ArrowRight, 
  Smartphone, 
  FileText, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  X, 
  Camera, 
  AlertTriangle 
} from 'lucide-react';
import { ScreenId, PatientData } from '../../types';

interface PatientTypeScreenProps {
  currentScreen: ScreenId;
  phoneInput: string;
  setPhoneInput: React.Dispatch<React.SetStateAction<string>>;
  patientData: PatientData;
  hasWebcam: boolean;
  setVideoElement?: (el: HTMLVideoElement | null) => void;
  goTo: (screen: ScreenId) => void;
  langCode?: 'en' | 'hi';
}

export const PatientTypeScreen: React.FC<PatientTypeScreenProps> = ({
  currentScreen,
  phoneInput,
  setPhoneInput,
  patientData,
  hasWebcam,
  setVideoElement,
  goTo,
  langCode = 'en'
}) => {
  const isHi = langCode === 'hi';
  const handleKeyPress = (num: string) => {
    if (phoneInput.length < 10) setPhoneInput(prev => prev + num);
  };
  const handleKeyDelete = () => setPhoneInput(prev => prev.slice(0, -1));
  const handleKeySubmit = () => {
    if (phoneInput.length >= 10) goTo('06C_SEARCHING');
  };

  return (
    <>
      {/* SCREEN 04: EXISTING VS NEW PATIENT */}
      {currentScreen === '04_EXISTING_NEW' && (
        <motion.div 
          key="04_EXISTING_NEW"
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
                {isHi ? "क्या आप पहले इस अस्पताल आ चुके हैं?" : "Are you an existing patient or a new patient?"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "बोलकर बताएं या नीचे दिए गए विकल्प चुनें।" : "You can say it or tap an option below."}
              </p>
            </div>
          </div>

          <div className="grid-2-cards" style={{ margin: 'clamp(8px, 1.6vh, 16px) 0' }}>
            <div 
              className="selection-card"
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'clamp(14px, 2vh, 20px)', position: 'relative' }}
              onClick={() => goTo('06A_IDENTIFY_EXISTING')}
            >
              <div style={{ color: '#0e6c38' }}><RotateCw size={26} /></div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 2vw, 18px)', color: '#0e6c38', marginTop: '8px' }}>
                {isHi ? "पुराने मरीज़" : "I am an existing patient"}
              </div>
              <div style={{ fontSize: 'clamp(11px, 1.4vw, 12.5px)', color: '#64748b', marginTop: '2px' }}>
                {isHi ? "मैं पहले इस अस्पताल आ चुका हूँ।" : "I have already visited this hospital before."}
              </div>
              <ul style={{ fontSize: 'clamp(10.5px, 1.3vw, 12px)', color: '#16a34a', fontWeight: 600, marginTop: '8px', paddingLeft: '14px', lineHeight: 1.4 }}>
                <li>{isHi ? "फोन या आईडी द्वारा खोजें" : "Lookup via Phone or UHID"}</li>
                <li>{isHi ? "त्वरित प्रोफ़ाइल सत्यापन" : "Quick profile verification"}</li>
                <li>{isHi ? "पूर्व इतिहास सुरक्षित" : "Preserves historical records"}</li>
              </ul>
              <div style={{ position: 'absolute', bottom: '14px', right: '14px', color: '#0e6c38' }}>
                <ArrowRight size={20} />
              </div>
            </div>

            <div 
              className="selection-card"
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'clamp(14px, 2vh, 20px)', position: 'relative' }}
              onClick={() => goTo('05_NEW_PATIENT_RECORD')}
            >
              <div style={{ color: '#0e6c38' }}><User size={26} /></div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 2vw, 18px)', color: '#0e6c38', marginTop: '8px' }}>
                {isHi ? "नए मरीज़" : "I am a new patient"}
              </div>
              <div style={{ fontSize: 'clamp(11px, 1.4vw, 12.5px)', color: '#64748b', marginTop: '2px' }}>
                {isHi ? "यह मेरी इस अस्पताल में पहली यात्रा है।" : "This is my first visit to this hospital."}
              </div>
              <ul style={{ fontSize: 'clamp(10.5px, 1.3vw, 12px)', color: '#16a34a', fontWeight: 600, marginTop: '8px', paddingLeft: '14px', lineHeight: 1.4 }}>
                <li>{isHi ? "नई प्रोफ़ाइल बनाएं" : "Register new profile"}</li>
                <li>{isHi ? "त्वरित परामर्श विवरण" : "Basic check-in details"}</li>
                <li>{isHi ? "तुरंत टोकन प्राप्त करें" : "Instant queue token"}</li>
              </ul>
              <div style={{ position: 'absolute', bottom: '14px', right: '14px', color: '#0e6c38' }}>
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SCREEN 05: NEW PATIENT RECORD CHOICE */}
      {currentScreen === '05_NEW_PATIENT_RECORD' && (
        <motion.div 
          key="05_NEW_PATIENT_RECORD"
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
              <h2 className="card-main-title">Since this is your first time here,</h2>
              <p className="card-main-subtitle">would you like me to create your permanent hospital profile?</p>
            </div>
          </div>

          <div className="grid-2-cards" style={{ margin: '8px 0' }}>
            <div 
              className="selection-card"
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}
              onClick={() => goTo('06B_ENTER_PHONE')}
            >
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>Create my patient record</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Keep your information for future visits.</div>
              <div style={{ fontSize: '10.5px', color: '#16a34a', marginTop: '6px' }}>✔ Faster check-in next time</div>
              <div style={{ fontSize: '10.5px', color: '#16a34a' }}>✔ Past records in one place</div>
            </div>

            <div 
              className="selection-card"
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}
              onClick={() => goTo('14_PHOTO_CAPTURE')}
            >
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>Continue for this visit only</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Prepare information for today's consultation only.</div>
              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>• Fast intake for urgent visit</div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>• Full data handed to doctor</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SCREEN 06A: SELECT IDENTIFIER */}
      {currentScreen === '06A_IDENTIFY_EXISTING' && (
        <motion.div 
          key="06A_IDENTIFY_EXISTING"
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
              <h2 className="card-main-title">Let's find your existing record</h2>
              <p className="card-main-subtitle">Choose how you'd like to identify yourself.</p>
            </div>
          </div>

          <div className="grid-3-cards" style={{ margin: '10px 0' }}>
            <div 
              className="selection-card selected"
              style={{ flexDirection: 'column', textAlign: 'center' }}
              onClick={() => goTo('06B_ENTER_PHONE')}
            >
              <Smartphone size={24} color="#0e6c38" />
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38', marginTop: '4px' }}>Phone Number</div>
              <div style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 700 }}>Recommended</div>
            </div>

            <div className="selection-card" style={{ opacity: 0.7, flexDirection: 'column', textAlign: 'center' }} onClick={() => goTo('06B_ENTER_PHONE')}>
              <User size={24} color="#0e6c38" />
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0e6c38', marginTop: '4px' }}>ABHA ID</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Ayushman Bharat</div>
            </div>

            <div className="selection-card" style={{ opacity: 0.7, flexDirection: 'column', textAlign: 'center' }} onClick={() => goTo('06B_ENTER_PHONE')}>
              <FileText size={24} color="#0e6c38" />
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0e6c38', marginTop: '4px' }}>Hospital UHID</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>HSP123456</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('06B_ENTER_PHONE')}>
              <span>Enter Phone Number</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 06B: ENTER PHONE NUMBER */}
      {currentScreen === '06B_ENTER_PHONE' && (
        <motion.div 
          key="06B_ENTER_PHONE"
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
              <h2 className="card-main-title">Enter your 10-digit phone number</h2>
              <p className="card-main-subtitle">Say it aloud or type using the keypad below.</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '4px auto',
            padding: '6px 14px',
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            width: 'fit-content',
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: '#0e6c38'
          }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>+91</span>
            <span>{phoneInput ? phoneInput : 'XXXXX-XXXXX'}</span>
          </div>

          <div className="keypad-matrix">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
              <button key={n} className="keypad-cell" onClick={() => handleKeyPress(n)}>{n}</button>
            ))}
            <button className="keypad-cell" onClick={handleKeyDelete}>⌫</button>
            <button className="keypad-cell" onClick={() => handleKeyPress('0')}>0</button>
            <button className="keypad-cell keypad-cell-action" onClick={handleKeySubmit}>
              <Check size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button className="btn-secondary-pill" onClick={() => setPhoneInput('9876543210')}>
              <Sparkles size={13} /> Speak "98765 43210"
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 06C: SEARCHING */}
      {currentScreen === '06C_SEARCHING' && (
        <motion.div 
          key="06C_SEARCHING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            style={{ display: 'inline-block', marginBottom: '8px' }}
          >
            <RotateCw size={32} color="#0e6c38" />
          </motion.div>
          <h2 className="card-main-title">Searching hospital database...</h2>
          <p className="card-main-subtitle">Verifying phone number +91 {phoneInput || '98765 43210'}</p>

          <div style={{ maxWidth: '280px', margin: '12px auto 0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Connected to hospital backend
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Found registered record: HSP123456
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0e6c38', fontWeight: 700 }}>
              <Activity size={13} /> Loading patient summary...
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('07_EXISTING_FOUND')}>
              <span>View Record</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 07: RECORD FOUND */}
      {currentScreen === '07_EXISTING_FOUND' && (
        <motion.div 
          key="07_EXISTING_FOUND"
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
              <h2 className="card-main-title">Record found! Please confirm:</h2>
              <p className="card-main-subtitle">Check if these details match you.</p>
            </div>
          </div>

          <div style={{
            background: '#f4faf6',
            border: '1.5px solid var(--color-mint-border)',
            borderRadius: '16px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            margin: '8px 0'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Full Name</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0e6c38' }}>{patientData.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Hospital UHID</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0e6c38' }}>{patientData.uhid}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Age / Gender</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>{patientData.age} yrs · {patientData.gender}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Phone Number</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>{patientData.phone}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('08_IDENTIFICATION_FAILED')}>
              <X size={14} /> Not me
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('15_CLINICAL_CONVERSATION')}>
              <Check size={16} /> Yes, this is me / Continue
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 08: NOT FOUND FALLBACK */}
      {currentScreen === '08_IDENTIFICATION_FAILED' && (
        <motion.div 
          key="08_IDENTIFICATION_FAILED"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 8px auto' }} />
          <h2 className="card-main-title">Record not found</h2>
          <p className="card-main-subtitle">We couldn't locate a profile matching that phone number.</p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('06B_ENTER_PHONE')}>
              Try another phone
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('05_NEW_PATIENT_RECORD')}>
              Register as New Patient
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 14: PHOTO CAPTURE */}
      {currentScreen === '14_PHOTO_CAPTURE' && (
        <motion.div 
          key="14_PHOTO_CAPTURE"
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
                {isHi ? "कैमरे की ओर सीधे देखें" : "Look at the camera"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "चेहरा फ्रेम के बीच में रखें और स्थिर रहें।" : "Position your face inside the frame and hold still."}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '8px 0' }}>
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '16px',
              border: '2.5px solid #16a34a',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0
            }}>
              {hasWebcam && setVideoElement ? (
                <video ref={setVideoElement} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              ) : (
                <img src="/assets/patient_viewfinder.jpg" alt="Webcam face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                fontSize: '8.5px',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                {isHi ? "चेहरा फ्रेम में रखें" : "Center face in frame"}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ fontWeight: 700, color: '#0e6c38' }}>
                {isHi ? "अच्छी फोटो के लिए सुझाव:" : "Tips for a good photo:"}
              </div>
              <div>{isHi ? "👤 कैमरे में सीधे देखें" : "👤 Look straight into camera"}</div>
              <div>{isHi ? "💡 पर्याप्त प्रकाश रखें" : "💡 Ensure adequate room lighting"}</div>
              <div>{isHi ? "👁 स्थिर और शांत रहें" : "👁 Keep a neutral expression"}</div>
              <div>{isHi ? "👓 चश्मा या टोपी न पहनें" : "👓 Avoid sunglasses or heavy hats"}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('15_CLINICAL_CONVERSATION')}>
              <Camera size={16} /> {isHi ? "फोटो लें और आगे बढ़ें" : "Tap to capture & continue"}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
