import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Wind, 
  Activity, 
  Thermometer, 
  ArrowRight, 
  Check, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Lightbulb 
} from 'lucide-react';

interface ScreenGroup28to33Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  selectedLanguage: 'en' | 'hi';
  onVitalsRecorded?: (bp: string, pulse: string, spo2: string) => void;
}

export const ScreenGroup28to33: React.FC<ScreenGroup28to33Props> = ({
  screenNum,
  onNavigate,
  selectedLanguage,
  onVitalsRecorded,
}) => {
  const isHi = selectedLanguage === 'hi';
  const [countdown, setCountdown] = useState(24);

  useEffect(() => {
    if (screenNum === 31) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onVitalsRecorded?.('118/78', '72', '98%');
            onNavigate(32);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screenNum]);

  // SCREEN 28: Measurements Overview (s28.png)
  if (screenNum === 28) {
    return (
      <div className="screen-container s28-measurements-screen">
        <div className="white-surface-card measurements-overview-card">
          <div className="vitals-types-grid">
            <div className="vital-type-item">
              <div className="vital-icon-wrap icon-bg-pink">
                <Heart size={26} color="#E11D48" />
              </div>
              <h4 className="vital-type-name">{isHi ? 'रक्तचाप (Blood Pressure)' : 'Blood Pressure'}</h4>
              <p className="vital-type-desc">
                {isHi ? 'धमनियों में रक्त के दबाव की जांच' : 'Checks the pressure of your blood in your arteries'}
              </p>
            </div>

            <div className="vital-type-item">
              <div className="vital-icon-wrap icon-bg-blue">
                <Wind size={26} color="#2563EB" />
              </div>
              <h4 className="vital-type-name">{isHi ? 'ऑक्सीजन स्तर (SpO2)' : 'Oxygen Saturation'}</h4>
              <p className="vital-type-desc">
                {isHi ? 'खून में ऑक्सीजन की मात्रा' : 'Shows how well your blood is carrying oxygen'}
              </p>
            </div>

            <div className="vital-type-item">
              <div className="vital-icon-wrap icon-bg-purple">
                <Activity size={26} color="#7C3AED" />
              </div>
              <h4 className="vital-type-name">{isHi ? 'हृदय गति (Pulse Rate)' : 'Heart Rate'}</h4>
              <p className="vital-type-desc">
                {isHi ? 'प्रति मिनट दिल की धड़कन' : 'Measures how many times your heart beats per minute'}
              </p>
            </div>

            <div className="vital-type-item">
              <div className="vital-icon-wrap icon-bg-green">
                <Thermometer size={26} color="#059669" />
              </div>
              <h4 className="vital-type-name">{isHi ? 'शरीर का तापमान' : 'Body Temperature'}</h4>
              <p className="vital-type-desc">
                {isHi ? 'बुखार या सामान्य तापमान' : 'Checks if you have a fever or higher temperature'}
              </p>
            </div>
          </div>

          <div className="vitals-safety-box">
            <ShieldCheck size={22} color="#059669" />
            <div className="safety-texts">
              <h4>{isHi ? 'आपकी सुरक्षा और आराम सर्वोपरि' : 'Your comfort and safety matter'}</h4>
              <p>
                {isHi 
                  ? 'ये जांच पूरी तरह दर्दरहित और सुरक्षित हैं। किसी भी सहायता के लिए स्टाफ उपस्थित है।' 
                  : 'These measurements are safe, non-invasive and take only a few minutes.'}
              </p>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(29)}
          >
            <span>{isHi ? 'जांच शुरू करें' : "Let's begin"}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 29: BP Instructions (s29.png)
  if (screenNum === 29) {
    return (
      <div className="screen-container s29-bp-instructions-screen">
        <div className="white-surface-card bp-instructions-card">
          <div className="bp-split-grid">
            {/* Left: Graphic illustration matching s29.png */}
            <div className="bp-illustration-col">
              <img 
                src="/assets/bp_graphic.png" 
                alt="Blood Pressure Measurement Guide"
                className="bp-guide-img"
              />
              <span className="bp-img-callout">
                <Check size={14} color="#ffffff" />
                {isHi ? 'बांह को दिल के स्तर पर रखें' : 'Keep your arm at heart level'}
              </span>
            </div>

            {/* Right: 4 Steps matching s29.png */}
            <div className="bp-steps-col">
              <div className="step-guide-item">
                <span className="step-num-bubble">1</span>
                <div className="step-texts">
                  <h4>{isHi ? 'आराम से बैठें' : 'Sit comfortably'}</h4>
                  <p>{isHi ? 'पीठ को सहारा दें और पैर फर्श पर सीधे रखें' : 'Keep your back supported and feet flat on the floor.'}</p>
                </div>
              </div>

              <div className="step-guide-item">
                <span className="step-num-bubble">2</span>
                <div className="step-texts">
                  <h4>{isHi ? 'कफ लगाएं' : 'Place the cuff'}</h4>
                  <p>{isHi ? 'अपनी बांह कफ के अंदर डालें जैसा दिखाया गया है' : 'Your arm should be in the cuff as shown.'}</p>
                </div>
              </div>

              <div className="step-guide-item">
                <span className="step-num-bubble">3</span>
                <div className="step-texts">
                  <h4>{isHi ? 'शांत और स्थिर रहें' : 'Keep still'}</h4>
                  <p>{isHi ? 'बांह को मेज़ पर टिकाएं और बोलना बंद करें' : 'Rest your arm on the table at heart level and avoid talking.'}</p>
                </div>
              </div>

              <div className="step-guide-item">
                <span className="step-num-bubble">4</span>
                <div className="step-texts">
                  <h4>{isHi ? 'हिलें-डुलें नहीं' : 'Avoid movement'}</h4>
                  <p>{isHi ? 'माप के दौरान फोन का उपयोग न करें' : 'Please do not move or use your phone during measurement.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="consent-info-pill" style={{ marginTop: '16px' }}>
            <Lightbulb size={16} color="#00796B" />
            <span>
              {isHi 
                ? 'अच्छी जानकारी: गहरी सांस लेने और शांत रहने से अधिक सटीक रीडिंग आती है।' 
                : 'Good to know: Taking a few deep breaths and relaxing can help get a more accurate reading.'}
            </span>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '16px' }}
            onClick={() => onNavigate(30)}
          >
            <span>{isHi ? 'मापने के लिए तैयार' : 'Ready to measure'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 30: Arm Positioning Checklist (s30.png)
  if (screenNum === 30) {
    return (
      <div className="screen-container s30-position-arm-screen">
        <div className="white-surface-card position-arm-card">
          <div className="bp-split-grid">
            <div className="bp-illustration-col">
              <img 
                src="/assets/bp_graphic.png" 
                alt="Position Your Arm"
                className="bp-guide-img"
              />
            </div>

            <div className="bp-checks-col">
              <h4 className="checks-title">{isHi ? 'अपनी स्थिति जांचें:' : 'Check your position:'}</h4>
              <ul className="checks-list">
                <li>
                  <Check size={18} color="#059669" strokeWidth={3} />
                  <span>{isHi ? 'पीठ सीधी और सहारा लिए हुए' : 'Sitting comfortably with back supported'}</span>
                </li>
                <li>
                  <Check size={18} color="#059669" strokeWidth={3} />
                  <span>{isHi ? 'बांह मेज़ पर टिकी हुई' : 'Arm on the table'}</span>
                </li>
                <li>
                  <Check size={18} color="#059669" strokeWidth={3} />
                  <span>{isHi ? 'कफ सही ढंग से लगा हुआ' : 'Cuff placed correctly'}</span>
                </li>
                <li>
                  <Check size={18} color="#059669" strokeWidth={3} />
                  <span>{isHi ? 'बांह दिल के स्तर पर' : 'Arm at heart level'}</span>
                </li>
                <li>
                  <Check size={18} color="#059669" strokeWidth={3} />
                  <span>{isHi ? 'हथेली ऊपर और तनावमुक्त' : 'Hand relaxed and still'}</span>
                </li>
              </ul>

              <div className="avoid-talking-pill">
                <AlertCircle size={16} color="#00796B" />
                <span>{isHi ? 'माप के दौरान शांत रहें' : 'Avoid talking or moving during the measurement.'}</span>
              </div>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(31)}
          >
            <span>{isHi ? 'सब सही है' : 'Looks good'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 31: Measuring BP 30s Countdown (s31.png)
  if (screenNum === 31) {
    return (
      <div className="screen-container s31-bp-measuring-screen">
        <div className="white-surface-card bp-measuring-card">
          <div className="measuring-split-layout">
            {/* Left: Graphic + Status */}
            <div className="measuring-left-status">
              <img 
                src="/assets/bp_graphic.png" 
                alt="Measuring BP" 
                className="bp-guide-img-small" 
              />
              <div className="measuring-status-tags">
                <span className="m-tag done">
                  <Check size={14} color="#059669" /> Position looks good
                </span>
                <span className="m-tag done">
                  <Check size={14} color="#059669" /> Cuff detected
                </span>
                <span className="m-tag active">
                  <span className="pulse-dot-green" /> Measuring...
                </span>
              </div>
            </div>

            {/* Right: Circular Countdown matching s31.png */}
            <div className="measuring-right-timer">
              <div className="circular-timer-ring">
                <span className="countdown-number">{countdown}</span>
                <span className="countdown-unit">{isHi ? 'सेकंड शेष' : 'seconds left'}</span>
              </div>

              <div className="reading-pulse-indicator">
                <Heart size={20} color="#059669" className="pulsing-heart-icon" />
                <div className="reading-texts">
                  <h5>{isHi ? 'रक्तचाप नापा जा रहा है' : 'Reading your blood pressure'}</h5>
                  <p>{isHi ? 'सटीक परिणाम के लिए स्थिर रहें' : 'Please stay still for accurate results.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="measuring-bottom-footer-row">
            <div className="moment-box">
              <Lightbulb size={16} color="#00796B" />
              <span>{isHi ? 'बस कुछ क्षण... आपकी शांति सटीक रीडिंग में मदद करती है।' : 'Just a moment... Your comfort helps us get a reliable reading.'}</span>
            </div>

            <div className="need-stop-box" onClick={() => onNavigate(32)}>
              <AlertCircle size={16} color="#6B7280" />
              <span>{isHi ? 'रोकना चाहते हैं? किसी भी समय रोक सकते हैं।' : 'Need to stop? Safe to stop anytime.'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 32: BP Result (s32.png)
  if (screenNum === 32) {
    return (
      <div className="screen-container s32-bp-result-screen">
        <div className="white-surface-card bp-result-card">
          <div className="bp-result-numbers-grid">
            <div className="bp-num-block">
              <span className="bp-num-label">{isHi ? 'सिस्टोलिक (ऊपरी)' : 'Systolic (Upper)'}</span>
              <span className="bp-num-val">118</span>
              <span className="bp-num-unit">mmHg</span>
            </div>

            <div className="bp-num-divider">/</div>

            <div className="bp-num-block">
              <span className="bp-num-label">{isHi ? 'डायस्टोलिक (निचला)' : 'Diastolic (Lower)'}</span>
              <span className="bp-num-val">78</span>
              <span className="bp-num-unit">mmHg</span>
            </div>

            <div className="bp-num-block">
              <span className="bp-num-label">{isHi ? 'नाड़ी (पल्स)' : 'Pulse'}</span>
              <span className="bp-num-val">72</span>
              <span className="bp-num-unit">bpm</span>
            </div>
          </div>

          <div className="bp-status-pill-badge normal">
            <Check size={18} color="#059669" />
            <span>{isHi ? 'सामान्य रक्तचाप (Normal Blood Pressure)' : 'Normal Blood Pressure Range'}</span>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => onNavigate(33)}
          >
            <span>{isHi ? 'अगली जांच (SpO2)' : 'Next check (SpO2)'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 33: Oxygen Saturation (s33.png)
  if (screenNum === 33) {
    return (
      <div className="screen-container s33-spo2-screen">
        <div className="white-surface-card spo2-card">
          <div className="spo2-display-row">
            <div className="spo2-metric-box">
              <Wind size={28} color="#2563EB" />
              <span className="spo2-val">98%</span>
              <span className="spo2-label">{isHi ? 'ऑक्सीजन स्तर (SpO2)' : 'Oxygen Saturation'}</span>
              <span className="metric-badge-ok">{isHi ? 'उत्कृष्ट' : 'Optimal'}</span>
            </div>

            <div className="spo2-metric-box">
              <Activity size={28} color="#7C3AED" />
              <span className="spo2-val">74</span>
              <span className="spo2-label">{isHi ? 'पल्स (BPM)' : 'Heart Rate'}</span>
              <span className="metric-badge-ok">{isHi ? 'सामान्य' : 'Normal'}</span>
            </div>
          </div>

          <p className="spo2-summary-text">
            {isHi 
              ? 'आपकी ऑक्सीजन और पल्स दोनों पूरी तरह सामान्य और स्वस्थ हैं।' 
              : 'Both your oxygen level and heart rate are completely normal and healthy.'}
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(34)}
          >
            <span>{isHi ? 'दस्तावेज़ स्कैन पर जाएं' : 'Continue to documents'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
