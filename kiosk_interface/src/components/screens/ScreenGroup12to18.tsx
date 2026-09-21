import React, { useState } from 'react';
import { 
  Mic, 
  Keyboard, 
  ArrowRight, 
  Check, 
  Delete, 
  ShieldCheck, 
  Camera, 
  Sun, 
  Eye, 
  Glasses, 
  UserCheck 
} from 'lucide-react';

interface ScreenGroup12to18Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  selectedLanguage: 'en' | 'hi';
  patientName?: string;
  onNameChange?: (name: string) => void;
  onPhotoCaptured?: (dataUrl: string) => void;
}

export const ScreenGroup12to18: React.FC<ScreenGroup12to18Props> = ({
  screenNum,
  onNavigate,
  selectedLanguage,
  patientName: propPatientName,
  onNameChange,
  onPhotoCaptured,
}) => {
  const isHi = selectedLanguage === 'hi';
  const [patientName, setPatientName] = useState(propPatientName || '');
  const [patientAge, setPatientAge] = useState('38');
  const [patientGender, setPatientGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpCode, setOtpCode] = useState('4821');

  React.useEffect(() => {
    if (propPatientName) {
      setPatientName(propPatientName);
    }
  }, [propPatientName]);

  const handlePhoneKeypad = (val: string) => {
    if (val === 'backspace') {
      setPhoneNumber(prev => prev.slice(0, -1));
    } else if (phoneNumber.length < 10) {
      setPhoneNumber(prev => prev + val);
    }
  };

  const handleAgeKeypad = (val: string) => {
    if (val === 'backspace') {
      setPatientAge(prev => prev.slice(0, -1));
    } else if (patientAge.length < 3) {
      setPatientAge(prev => prev + val);
    }
  };

  // SCREEN 12: Name Input (s12.png)
  if (screenNum === 12) {
    const handleContinue = () => {
      const finalName = patientName.trim() || (isHi ? 'अमित कुमार' : 'Amit Kumar');
      onNameChange?.(finalName);
      onNavigate(20);
    };

    return (
      <div className="screen-container s12-name-screen">
        <div className="white-surface-card name-input-card">
          <label className="input-field-label">
            {isHi ? 'आपका पूरा नाम' : 'Your Full Name'}
          </label>
          <input
            type="text"
            className="large-text-input"
            value={patientName}
            onChange={(e) => {
              setPatientName(e.target.value);
              onNameChange?.(e.target.value);
            }}
            placeholder={isHi ? 'अपना नाम दर्ज करें या बोलकर बताएं' : 'Enter your name or speak aloud'}
          />

          <div className="s12-input-modes-grid">
            <div className="input-mode-card active-mic">
              <div className="mode-icon-circle icon-bg-green">
                <Mic size={24} color="#059669" />
              </div>
              <div className="mode-texts">
                <h4>{isHi ? 'बोलकर बताएं' : 'Speak your name'}</h4>
                <p>{isHi ? 'माइक खुला है, अपना नाम बोलें...' : "Mic active, speak your name..."}</p>
              </div>
            </div>

            <div className="input-mode-card">
              <div className="mode-icon-circle icon-bg-blue">
                <Keyboard size={24} color="#2563EB" />
              </div>
              <div className="mode-texts">
                <h4>{isHi ? 'कीबोर्ड से टाइप करें' : 'Use keyboard'}</h4>
                <p>{isHi ? 'स्क्रीन पर टाइप करें' : 'Enter manually'}</p>
              </div>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={handleContinue}
          >
            <span>{isHi ? 'बीमारी बताएं / आगे बढ़ें' : 'Continue to Symptoms'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 13: Age Input (s13.png)
  if (screenNum === 13) {
    return (
      <div className="screen-container s13-age-screen">
        <div className="white-surface-card age-input-card">
          <div className="age-display-box">
            <span className="age-number">{patientAge || '--'}</span>
            <span className="age-unit">{isHi ? 'वर्ष (Years)' : 'Years'}</span>
          </div>

          <div className="age-quick-brackets">
            {['18-30', '31-45', '46-60', '60+'].map((range) => (
              <button 
                key={range}
                className="age-bracket-btn"
                onClick={() => setPatientAge(range.split('-')[0])}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="numeric-keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button 
                key={num} 
                className="keypad-btn" 
                onClick={() => handleAgeKeypad(num)}
              >
                {num}
              </button>
            ))}
            <button className="keypad-btn clear" onClick={() => handleAgeKeypad('backspace')}>
              <Delete size={20} />
            </button>
            <button className="keypad-btn" onClick={() => handleAgeKeypad('0')}>0</button>
            <button 
              className="keypad-btn enter-action"
              onClick={() => onNavigate(14)}
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 14: Gender Selection (s14.png)
  if (screenNum === 14) {
    const genders = [
      { id: 'Male', labelEn: 'Male', labelHi: 'पुरुष', icon: '👨' },
      { id: 'Female', labelEn: 'Female', labelHi: 'महिला', icon: '👩' },
      { id: 'Other', labelEn: 'Other', labelHi: 'अन्य', icon: '🧑' },
      { id: 'Prefer not to say', labelEn: 'Prefer not to say', labelHi: 'बताना नहीं चाहते', icon: '🔒' },
    ];

    return (
      <div className="screen-container s14-gender-screen">
        <div className="gender-options-grid">
          {genders.map((g) => (
            <div
              key={g.id}
              className={`gender-option-card ${patientGender === g.id ? 'selected' : ''}`}
              onClick={() => {
                setPatientGender(g.id);
                onNavigate(15);
              }}
              role="button"
              tabIndex={0}
            >
              <span className="gender-emoji">{g.icon}</span>
              <h3 className="gender-label">{isHi ? g.labelHi : g.labelEn}</h3>
              {patientGender === g.id && (
                <div className="gender-check-badge">
                  <Check size={16} color="#ffffff" strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SCREEN 15: Phone Number Entry (s15.png)
  if (screenNum === 15) {
    return (
      <div className="screen-container s15-phone-screen">
        <div className="white-surface-card phone-keypad-card">
          <div className="phone-input-header">
            <div className="phone-flag-box">
              <span className="country-code">+91</span>
            </div>
            <div className="phone-digits-display">
              {phoneNumber || 'Enter 10-digit number'}
            </div>
          </div>

          <div className="phone-screen-split-layout">
            {/* Left Column: Voice & Touch cards */}
            <div className="phone-left-helpers">
              <div className="input-mode-card active-mic">
                <div className="mode-icon-circle icon-bg-green">
                  <Mic size={24} color="#059669" />
                </div>
                <div className="mode-texts">
                  <h4>{isHi ? 'बोलकर बताएं' : 'Tap to speak'}</h4>
                  <p>{isHi ? 'मैं सुन रहा हूँ...' : "I'm listening..."}</p>
                </div>
              </div>

              <div className="input-mode-card">
                <div className="mode-icon-circle icon-bg-blue">
                  <Keyboard size={24} color="#2563EB" />
                </div>
                <div className="mode-texts">
                  <h4>{isHi ? 'कीपैड का उपयोग' : 'Use keypad instead'}</h4>
                  <p>{isHi ? 'मैनुअल दर्ज करें' : 'Enter manually'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Numeric Keypad */}
            <div className="phone-right-keypad">
              <div className="numeric-keypad-grid">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button 
                    key={num} 
                    className="keypad-btn" 
                    onClick={() => handlePhoneKeypad(num)}
                  >
                    {num}
                  </button>
                ))}
                <button className="keypad-btn clear" onClick={() => handlePhoneKeypad('backspace')}>
                  <Delete size={20} />
                </button>
                <button className="keypad-btn" onClick={() => handlePhoneKeypad('0')}>0</button>
                <button 
                  className="keypad-btn enter-action"
                  onClick={() => onNavigate(16)}
                >
                  <ArrowRight size={22} />
                </button>
              </div>
            </div>
          </div>

          <div className="phone-security-notice">
            <ShieldCheck size={18} color="#059669" />
            <span>
              {isHi 
                ? 'हम इस नंबर का उपयोग केवल अपॉइंटमेंट रिमाइंडर और अपडेट के लिए करेंगे।' 
                : 'We will use this number only for appointment reminders and important updates.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 16: OTP Verification (s16.png)
  if (screenNum === 16) {
    return (
      <div className="screen-container s16-otp-screen">
        <div className="white-surface-card otp-card">
          <div className="otp-boxes-row">
            {['4', '8', '2', '1'].map((digit, idx) => (
              <div key={idx} className="otp-digit-box filled">
                {digit}
              </div>
            ))}
          </div>

          <p className="otp-resend-text">
            {isHi ? 'ओटीपी नहीं मिला? ' : "Didn't receive code? "}
            <span className="resend-link">{isHi ? 'दोबारा भेजें (24s)' : 'Resend in 24s'}</span>
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}
            onClick={() => onNavigate(17)}
          >
            <span>{isHi ? 'सत्यापित करें' : 'Verify OTP'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 17: Profile Confirmation Summary (s17.png)
  if (screenNum === 17) {
    return (
      <div className="screen-container s17-confirm-profile-screen">
        <div className="white-surface-card profile-summary-card">
          <div className="summary-header-badge">
            <UserCheck size={32} color="#00796B" />
          </div>

          <h3 className="summary-card-title">
            {isHi ? 'कृपया अपनी जानकारी देख लें' : 'Please check your basic details'}
          </h3>

          <div className="patient-details-table">
            <div className="detail-row">
              <span className="row-label">{isHi ? 'नाम' : 'Full Name'}</span>
              <span className="row-val">{patientName}</span>
            </div>
            <div className="detail-row">
              <span className="row-label">{isHi ? 'उम्र' : 'Age'}</span>
              <span className="row-val">{patientAge} Years</span>
            </div>
            <div className="detail-row">
              <span className="row-label">{isHi ? 'लिंग' : 'Gender'}</span>
              <span className="row-val">{patientGender}</span>
            </div>
            <div className="detail-row">
              <span className="row-label">{isHi ? 'मोबाइल नंबर' : 'Phone'}</span>
              <span className="row-val">+91 {phoneNumber}</span>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(18)}
          >
            <span>{isHi ? 'सब सही है, फोटो लें' : 'Looks good, take photo'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 18: Face Photo Capture (s18.png)
  if (screenNum === 18) {
    return (
      <div className="screen-container s18-photo-screen">
        <div className="white-surface-card photo-capture-card">
          <div className="photo-card-split-layout">
            {/* Left: Viewfinder Oval */}
            <div className="photo-viewfinder-col">
              <div className="photo-oval-viewfinder">
                <div className="viewfinder-oval-ring" />
                <img 
                  src="/assets/avatar_selfie.png" 
                  alt="Camera Preview" 
                  className="viewfinder-preview-img"
                  onError={(e) => {
                    // Fallback to avatar placeholder
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="viewfinder-instruction-tag">
                  {isHi ? 'चेहरे को अंडाकार घेरे में रखें' : 'Position your face within the oval'}
                </span>
              </div>

              <button 
                className="photo-capture-circle-btn"
                onClick={() => {
                  onPhotoCaptured?.('/assets/avatar_selfie.png');
                  onNavigate(19);
                }}
              >
                <Camera size={26} color="#ffffff" />
                <span>{isHi ? 'फोटो लें' : 'Tap to capture'}</span>
              </button>
            </div>

            {/* Right: Helpful Tips matching s18.png */}
            <div className="photo-tips-col">
              <div className="tips-header-pill">
                <span className="info-dot-icon">i</span>
                <span className="tips-title">{isHi ? 'साफ फोटो के लिए सुझाव:' : 'Tips for a clear photo'}</span>
              </div>

              <ul className="photo-tips-list">
                <li>
                  <UserCheck size={18} color="#059669" />
                  <span>{isHi ? 'सीधे कैमरे की तरफ देखें' : 'Face the camera directly'}</span>
                </li>
                <li>
                  <Sun size={18} color="#059669" />
                  <span>{isHi ? 'चेहरे पर अच्छी रोशनी हो' : 'Make sure your face is well lit'}</span>
                </li>
                <li>
                  <Eye size={18} color="#059669" />
                  <span>{isHi ? 'स्वाभाविक मुद्रा बनाए रखें' : 'Keep a neutral expression (natural smile)'}</span>
                </li>
                <li>
                  <Glasses size={18} color="#059669" />
                  <span>{isHi ? 'चश्मा या मास्क हटा लें' : 'Remove sunglasses, cap or mask'}</span>
                </li>
                <li>
                  <Check size={18} color="#059669" />
                  <span>{isHi ? 'फोटो खिंचने तक स्थिर रहें' : 'Stay within the frame until captured'}</span>
                </li>
              </ul>

              <div className="voice-help-card-inline">
                <Mic size={18} color="#059669" />
                <div className="voice-help-texts">
                  <span className="vh-title">{isHi ? 'सहायता चाहिए?' : 'Need help?'}</span>
                  <span className="vh-sub">{isHi ? 'मैं आवाज से भी मदद कर सकता हूँ।' : 'I can guide you with voice instructions.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
