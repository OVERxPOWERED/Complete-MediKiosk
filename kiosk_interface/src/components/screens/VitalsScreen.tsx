import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  ArrowRight, 
  Check, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { ScreenId, PatientVitals } from '../../types';

interface VitalsScreenProps {
  currentScreen: ScreenId;
  bpCountdown: number;
  setBpCountdown: React.Dispatch<React.SetStateAction<number>>;
  vitals: PatientVitals;
  goTo: (screen: ScreenId) => void;
  langCode?: 'en' | 'hi';
}

export const VitalsScreen: React.FC<VitalsScreenProps> = ({
  currentScreen,
  bpCountdown,
  setBpCountdown,
  vitals,
  goTo,
  langCode = 'en'
}) => {
  const isHi = langCode === 'hi';

  // Countdown timer for BP measuring screen
  useEffect(() => {
    let timer: any;
    if (currentScreen === '27_BP_MEASURING') {
      timer = setInterval(() => {
        setBpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            goTo('28_BP_RESULT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBpCountdown(24);
    }
    return () => clearInterval(timer);
  }, [currentScreen, goTo, setBpCountdown]);

  return (
    <>
      {/* SCREEN 24: MEASUREMENTS INTRO */}
      {currentScreen === '24_MEASUREMENTS_INTRO' && (
        <motion.div 
          key="24_MEASUREMENTS_INTRO"
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
                {isHi ? "त्वरित स्वास्थ्य परीक्षण" : "We'll now take quick health measurements"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "ये एकीकृत परीक्षण डॉक्टर अंजलि को सटीक परामर्श देने में मदद करते हैं।" : "These integrated sensors help Dr. Anjali evaluate you accurately."}
              </p>
            </div>
          </div>

          <div className="grid-2-cards" style={{ margin: 'clamp(8px, 1.5vh, 14px) 0' }}>
            <div className="selection-card">
              <Heart size={22} color="#0e6c38" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0e6c38' }}>
                  {isHi ? "रक्तचाप (ब्लड प्रेशर)" : "Blood Pressure"}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {isHi ? "स्वचालित डेस्क कफ द्वारा मापन" : "Automated desktop cuff measurement"}
                </div>
              </div>
            </div>
            <div className="selection-card">
              <Activity size={22} color="#0e6c38" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0e6c38' }}>
                  {isHi ? "पल्स एवं ऑक्सीजन (SpO2)" : "Pulse & Oxygen (SpO2)"}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {isHi ? "उंगली सेंसर द्वारा त्वरित रीडिंग" : "Infrared finger sensor reading"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('25_BP_INSTRUCTIONS')}>
              <span>{isHi ? "परीक्षण शुरू करें" : "Begin Measurements"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 25: BP INSTRUCTIONS */}
      {currentScreen === '25_BP_INSTRUCTIONS' && (
        <motion.div 
          key="25_BP_INSTRUCTIONS"
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
                {isHi ? "रक्तचाप मापन निर्देश" : "Blood Pressure Measurement Guide"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "सटीक रीडिंग के लिए इन 3 आसान चरणों का पालन करें।" : "Follow these 3 easy steps for an accurate reading."}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#334155', margin: '6px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eaf6f0', color: '#0e6c38', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
              <span>{isHi ? "आराम से बैठें और दोनों पैर फर्श पर सीधे रखें।" : "Sit back comfortably with your feet resting flat on the floor."}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eaf6f0', color: '#0e6c38', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
              <span>{isHi ? "अपना हाथ अंतर्निर्मित डेस्क कफ स्लॉट में डालें।" : "Slide your left or right arm into the built-in desk cuff slot."}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eaf6f0', color: '#0e6c38', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
              <span>{isHi ? "कफ फूलने के दौरान लगभग 30 सेकंड शांत और स्थिर रहें।" : "Relax and remain silent for ~30 seconds while the cuff inflates."}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('26_BP_POSITIONING')}>
              <span>{isHi ? "हाथ की स्थिति जांचें" : "Check Arm Position"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 26: BP POSITIONING WITH REFERENCE GRAPHIC */}
      {currentScreen === '26_BP_POSITIONING' && (
        <motion.div 
          key="26_BP_POSITIONING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center' }}
        >
          <h2 className="card-main-title">
            {isHi ? "हाथ कफ में डालें" : "Insert Arm Into the Cuff"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "चित्र के अनुसार अपनी कोहनी को हृदय के स्तर पर रखें।" : "Align your elbow at heart level as shown in the diagram."}
          </p>

          <div className="graphic-illustration-container">
            <img 
              src="/assets/bp_graphic.png" 
              alt="Blood Pressure Cuff Positioning Graphic" 
              className="graphic-illustration-img"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('25_BP_INSTRUCTIONS')}>
              {isHi ? "पीछे जाएं" : "Back"}
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('27_BP_MEASURING')}>
              <span>{isHi ? "रीडिंग शुरू करें" : "Start 30s Reading"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 27: BP MEASURING COUNTDOWN */}
      {currentScreen === '27_BP_MEASURING' && (
        <motion.div 
          key="27_BP_MEASURING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <h2 className="card-main-title">
            {isHi ? "रक्तचाप नापा जा रहा है..." : "Measuring Your Blood Pressure..."}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "कृपया शांत और स्थिर रहें। कफ स्वतः खुल जाएगा।" : "Please remain relaxed and still. The cuff will release automatically."}
          </p>

          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '4px solid #22c55e',
            borderTopColor: '#0e6c38',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '10px auto',
            animation: 'spin 4s linear infinite'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0e6c38' }}>{bpCountdown}</span>
            <span style={{ fontSize: '8.5px', color: '#64748b' }}>{isHi ? "सेकंड" : "sec"}</span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0e6c38' }}>
            {isHi ? "सिस्टोलिक और डायस्टोलिक तरंगों का विश्लेषण जारी..." : "Detecting systolic and diastolic pulse waves..."}
          </div>

          <div style={{ marginTop: '8px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('28_BP_RESULT')}>
              {isHi ? "सीधे परिणाम देखें" : "Skip to result"}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 28: BP RESULT */}
      {currentScreen === '28_BP_RESULT' && (
        <motion.div 
          key="28_BP_RESULT"
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
                {isHi ? "रक्तचाप परिणाम दर्ज" : "Blood Pressure Reading Recorded"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "मेडीकियोस्क डिवाइस द्वारा सत्यापित और डिजिटल हस्ताक्षरित।" : "Measured and digitally signed by the MediKiosk device."}
              </p>
            </div>
          </div>

          <div className="grid-2-cards" style={{ margin: '8px 0' }}>
            <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '16px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {isHi ? "सिस्टोलिक (ऊपरी)" : "Systolic (Upper)"}
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#0e6c38' }}>118</div>
              <div style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 700 }}>
                {isHi ? "सामान्य स्तर (<120)" : "Normal Range (<120)"}
              </div>
            </div>
            <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '16px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {isHi ? "डायस्टोलिक (निचला)" : "Diastolic (Lower)"}
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#0e6c38' }}>76</div>
              <div style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 700 }}>
                {isHi ? "सामान्य स्तर (<80)" : "Normal Range (<80)"}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} color="#16a34a" /> {isHi ? "हार्डवेयर सत्यापित: कफ_सेंसर" : "Hardware verified: kiosk_device"}
            </span>
            <button className="btn-primary-pill" onClick={() => goTo('29_SPO2_MEASUREMENT')}>
              <span>{isHi ? "अगला: ऑक्सीजन जांच" : "Next: Pulse & Oxygen"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 29: SPO2 MEASUREMENT */}
      {currentScreen === '29_SPO2_MEASUREMENT' && (
        <motion.div 
          key="29_SPO2_MEASUREMENT"
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
                {isHi ? "पल्स एवं ऑक्सीजन (SpO2) दर्ज" : "Pulse & Oxygen (SpO2) Recorded"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "उंगली सेंसर द्वारा मापा गया।" : "Measured via desktop fingertip pulse oximeter."}
              </p>
            </div>
          </div>

          <div className="grid-2-cards" style={{ margin: '8px 0' }}>
            <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {isHi ? "ऑक्सीजन संतृप्ति (SpO2)" : "Oxygen Saturation (SpO2)"}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0e6c38' }}>98%</div>
              <div style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 700 }}>
                {isHi ? "उत्तम स्तर (95-100%)" : "Optimal (95-100%)"}
              </div>
            </div>
            <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {isHi ? "नाड़ी दर (पल्स)" : "Pulse Rate"}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0e6c38' }}>72 <span style={{ fontSize: '13px' }}>bpm</span></div>
              <div style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 700 }}>
                {isHi ? "सामान्य दर (60-100 bpm)" : "Normal Resting (60-100)"}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '6px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('30_DOCUMENT_INTRO')}>
              <span>{isHi ? "दस्तावेज़ की ओर बढ़ें" : "Proceed to Documents"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
