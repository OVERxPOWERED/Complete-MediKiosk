import React, { useState } from 'react';
import { 
  Folder, 
  UserPlus, 
  ArrowRight, 
  Fingerprint, 
  CreditCard, 
  FileBadge, 
  Search, 
  Check, 
  X, 
  Delete, 
  Clock, 
  User, 
  Phone 
} from 'lucide-react';

interface ScreenGroup5to11Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  onPatientTypeSelect: (type: 'new' | 'existing') => void;
  selectedLanguage: 'en' | 'hi';
}

export const ScreenGroup5to11: React.FC<ScreenGroup5to11Props> = ({
  screenNum,
  onNavigate,
  onPatientTypeSelect,
  selectedLanguage,
}) => {
  const isHi = selectedLanguage === 'hi';
  const [idNumber, setIdNumber] = useState('9821 4056 1238');
  const [selectedIdType, setSelectedIdType] = useState<'aadhaar' | 'abha' | 'uhid'>('aadhaar');

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setIdNumber(prev => prev.slice(0, -1));
    } else if (idNumber.length < 16) {
      setIdNumber(prev => prev + val);
    }
  };

  // SCREEN 5: Existing vs New Patient (s5.png)
  if (screenNum === 5) {
    return (
      <div className="screen-container s5-patient-type-screen">
        <div className="s5-cards-grid">
          {/* Existing Patient Card */}
          <div 
            className="patient-choice-card existing-patient-card"
            onClick={() => {
              onPatientTypeSelect('existing');
              onNavigate(7);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="choice-badge-icon icon-bg-green">
              <Folder size={32} color="#059669" />
            </div>

            <h3 className="choice-card-title">
              {isHi ? 'मैं पंजीकृत मरीज़ हूँ' : 'I am an existing patient'}
            </h3>
            <p className="choice-card-sub">
              {isHi ? 'मैं पहले भी इस अस्पताल में आ चुका हूँ।' : 'I have already visited this hospital before.'}
            </p>

            <ul className="choice-bullet-list">
              <li>
                <Check size={16} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'UHID या ABHA ID का उपयोग करें' : 'Use your UHID or ABHA ID'}</span>
              </li>
              <li>
                <Check size={16} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'हम आपके पुराने रिकॉर्ड खोज लेंगे' : "We'll find your previous records"}</span>
              </li>
              <li>
                <Check size={16} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'तेज़ और आसान' : 'Faster and easier'}</span>
              </li>
            </ul>

            <button className="choice-arrow-btn arrow-btn-green">
              <ArrowRight size={22} color="#059669" />
            </button>
          </div>

          {/* New Patient Card */}
          <div 
            className="patient-choice-card new-patient-card"
            onClick={() => {
              onPatientTypeSelect('new');
              onNavigate(6);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="choice-badge-icon icon-bg-blue">
              <UserPlus size={32} color="#2563EB" />
            </div>

            <h3 className="choice-card-title">
              {isHi ? 'मैं नया मरीज़ हूँ' : 'I am a new patient'}
            </h3>
            <p className="choice-card-sub">
              {isHi ? 'यह इस अस्पताल में मेरी पहली विज़िट है।' : 'This is my first visit to this hospital.'}
            </p>

            <ul className="choice-bullet-list">
              <li>
                <Check size={16} color="#2563EB" strokeWidth={3} />
                <span>{isHi ? 'नया मरीज़ प्रोफ़ाइल बनाएं' : 'Create a new patient profile'}</span>
              </li>
              <li>
                <Check size={16} color="#2563EB" strokeWidth={3} />
                <span>{isHi ? 'बुनियादी जानकारी साझा करें' : 'Share basic information'}</span>
              </li>
              <li>
                <Check size={16} color="#2563EB" strokeWidth={3} />
                <span>{isHi ? 'हम कदम दर कदम मार्गदर्शन करेंगे' : "We'll guide you step by step"}</span>
              </li>
            </ul>

            <button className="choice-arrow-btn arrow-btn-blue">
              <ArrowRight size={22} color="#2563EB" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 6: First-time Record Choice (s6.png)
  if (screenNum === 6) {
    return (
      <div className="screen-container s6-record-choice-screen">
        <div className="s5-cards-grid">
          {/* Create Permanent Record */}
          <div 
            className="patient-choice-card existing-patient-card"
            onClick={() => onNavigate(12)}
            role="button"
            tabIndex={0}
          >
            <div className="choice-badge-icon icon-bg-green">
              <FileBadge size={32} color="#059669" />
            </div>
            <h3 className="choice-card-title">
              {isHi ? 'मेरा मरीज़ रिकॉर्ड बनाएं' : 'Create my patient record'}
            </h3>
            <p className="choice-card-sub">
              {isHi ? 'भविष्य की विज़िट के लिए जानकारी सुरक्षित रखें।' : 'Keep your information for future visits.'}
            </p>
            <ul className="choice-bullet-list">
              <li>
                <Check size={16} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'अगली बार तेज़ चेक-इन' : 'Faster check-in next time'}</span>
              </li>
              <li>
                <Check size={16} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'पुराने रिकॉर्ड एक जगह' : 'Your past records in one place'}</span>
              </li>
              <li>
                <Check size={16} color="#059669" strokeWidth={3} />
                <span>{isHi ? 'बेहतर और व्यक्तिगत देखभाल' : 'Better and more personalized care'}</span>
              </li>
            </ul>
            <button className="choice-arrow-btn arrow-btn-green">
              <ArrowRight size={22} color="#059669" />
            </button>
          </div>

          {/* Continue for this visit */}
          <div 
            className="patient-choice-card new-patient-card"
            onClick={() => onNavigate(12)}
            role="button"
            tabIndex={0}
          >
            <div className="choice-badge-icon icon-bg-blue">
              <Clock size={32} color="#2563EB" />
            </div>
            <h3 className="choice-card-title">
              {isHi ? 'केवल इस विज़िट के लिए जारी रखें' : 'Continue for this visit'}
            </h3>
            <p className="choice-card-sub">
              {isHi ? 'स्थायी रिकॉर्ड न बनाएं, केवल आज के लिए उपयोग करें।' : "Don't create a permanent record now. Today only."}
            </p>
            <ul className="choice-bullet-list">
              <li>
                <Check size={16} color="#2563EB" strokeWidth={3} />
                <span>{isHi ? 'दीर्घकालिक रिकॉर्ड सेव नहीं होगा' : 'No long-term record will be saved'}</span>
              </li>
              <li>
                <Check size={16} color="#2563EB" strokeWidth={3} />
                <span>{isHi ? 'कंसल्टेशन समरी प्राप्त करें' : 'Get your consultation summary'}</span>
              </li>
              <li>
                <Check size={16} color="#2563EB" strokeWidth={3} />
                <span>{isHi ? 'बाद में कभी भी रिकॉर्ड बना सकते हैं' : 'You can create a record later'}</span>
              </li>
            </ul>
            <button className="choice-arrow-btn arrow-btn-blue">
              <ArrowRight size={22} color="#2563EB" />
            </button>
          </div>
        </div>

        <div className="consent-info-pill">
          <span className="info-badge-icon">i</span>
          <span>
            {isHi ? 'आप बाद में भी बदल सकते हैं। दोनों विकल्प आज की विज़िट पूरी करेंगे।' : 'You can change your choice later. Both options let you complete today.'}
          </span>
        </div>
      </div>
    );
  }

  // SCREEN 7: Existing Search Method (s7.png)
  if (screenNum === 7) {
    return (
      <div className="screen-container s7-search-method-screen">
        <div className="s7-cards-row">
          {/* Aadhaar Card */}
          <div 
            className="search-method-card recommended"
            onClick={() => onNavigate(8)}
            role="button"
            tabIndex={0}
          >
            <div className="method-icon-circle icon-bg-green">
              <Fingerprint size={32} color="#059669" />
            </div>
            <h3 className="method-title">{isHi ? 'आधार (Aadhaar)' : 'Aadhaar'}</h3>
            <p className="method-desc">
              {isHi ? 'रिकॉर्ड खोजने के लिए आधार नंबर का उपयोग करें।' : 'Use your Aadhaar number to find your record.'}
            </p>
            <span className="recommended-badge">{isHi ? 'अनुशंसित' : 'Recommended'}</span>
            <button className="method-arrow-btn arrow-btn-green">
              <ArrowRight size={20} color="#059669" />
            </button>
          </div>

          {/* ABHA ID Card */}
          <div 
            className="search-method-card"
            onClick={() => onNavigate(8)}
            role="button"
            tabIndex={0}
          >
            <div className="method-icon-circle icon-bg-blue">
              <CreditCard size={32} color="#2563EB" />
            </div>
            <h3 className="method-title">{isHi ? 'आभा आईडी (ABHA ID)' : 'ABHA ID'}</h3>
            <p className="method-desc">
              {isHi ? 'रिकॉर्ड खोजने के लिए ABHA ID का उपयोग करें।' : 'Use your ABHA ID to find your record.'}
            </p>
            <button className="method-arrow-btn arrow-btn-blue">
              <ArrowRight size={20} color="#2563EB" />
            </button>
          </div>

          {/* UHID Card */}
          <div 
            className="search-method-card"
            onClick={() => onNavigate(8)}
            role="button"
            tabIndex={0}
          >
            <div className="method-icon-circle icon-bg-purple">
              <FileBadge size={32} color="#7C3AED" />
            </div>
            <h3 className="method-title">{isHi ? 'अस्पताल UHID' : 'UHID'}</h3>
            <p className="method-desc">
              {isHi ? 'अस्पताल की UHID संख्या का उपयोग करें।' : 'Use your hospital UHID to find your record.'}
            </p>
            <button className="method-arrow-btn arrow-btn-purple">
              <ArrowRight size={20} color="#7C3AED" />
            </button>
          </div>
        </div>

        {/* OR Search input row */}
        <div className="s7-or-divider">
          <span>{isHi ? 'या (OR)' : 'OR'}</span>
        </div>

        <div className="s7-manual-search-bar" onClick={() => onNavigate(8)}>
          <Search size={20} color="#6B7280" />
          <span className="search-placeholder">
            {isHi ? 'अपना UHID या ABHA ID मैनुअल दर्ज करें' : 'Enter your UHID or ABHA ID manually'}
          </span>
          <ArrowRight size={20} color="#00796B" />
        </div>

        <div className="consent-info-pill">
          <span className="info-badge-icon">i</span>
          <span>
            {isHi ? 'निश्चित नहीं हैं कि कौन सी ID उपयोग करें? सहायता पर टैप करें।' : 'Not sure which ID to use? Tap Help or ask me.'}
          </span>
        </div>
      </div>
    );
  }

  // SCREEN 8: Enter Identity Number (s8.png)
  if (screenNum === 8) {
    return (
      <div className="screen-container s8-keypad-screen">
        <div className="white-surface-card keypad-card">
          <div className="id-type-tabs">
            <button 
              className={`id-tab ${selectedIdType === 'aadhaar' ? 'active' : ''}`}
              onClick={() => setSelectedIdType('aadhaar')}
            >
              Aadhaar
            </button>
            <button 
              className={`id-tab ${selectedIdType === 'abha' ? 'active' : ''}`}
              onClick={() => setSelectedIdType('abha')}
            >
              ABHA ID
            </button>
            <button 
              className={`id-tab ${selectedIdType === 'uhid' ? 'active' : ''}`}
              onClick={() => setSelectedIdType('uhid')}
            >
              Hospital UHID
            </button>
          </div>

          <div className="id-number-display-box">
            <span className="id-digits">{idNumber || '____ ____ ____'}</span>
          </div>

          <div className="numeric-keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button 
                key={num} 
                className="keypad-btn" 
                onClick={() => handleKeypadPress(num)}
              >
                {num}
              </button>
            ))}
            <button className="keypad-btn clear" onClick={() => handleKeypadPress('backspace')}>
              <Delete size={20} />
            </button>
            <button className="keypad-btn" onClick={() => handleKeypadPress('0')}>0</button>
            <button 
              className="keypad-btn enter-action"
              onClick={() => onNavigate(9)}
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 9: Searching Database (s9.png)
  if (screenNum === 9) {
    return (
      <div className="screen-container s9-searching-screen">
        <div className="white-surface-card searching-card">
          <div className="searching-spinner-ring">
            <Search size={36} color="#00796B" className="spinning-search-icon" />
          </div>
          <h3 className="searching-headline">
            {isHi ? 'अस्पताल डेटाबेस में खोज जारी है...' : 'Searching hospital registry...'}
          </h3>
          <p className="searching-sub">
            {isHi ? 'कृपया प्रतीक्षा करें, आपकी जानकारी का मिलान किया जा रहा है।' : "Matching patient demographics with national registry."}
          </p>

          <button 
            className="s2-start-pill-btn" 
            style={{ marginTop: '24px' }}
            onClick={() => onNavigate(10)}
          >
            <span>{isHi ? 'रिकॉर्ड मिल गया' : 'Record Found'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 10: Record Found Profile Confirmation (s10.png)
  if (screenNum === 10) {
    return (
      <div className="screen-container s10-profile-confirm-screen">
        <div className="white-surface-card patient-found-card">
          <div className="found-avatar-circle">
            <User size={36} color="#00796B" />
          </div>

          <h3 className="patient-found-name">Rohit Mehta</h3>
          <p className="patient-found-meta">38 Years · Male · Blood Group O+</p>

          <div className="patient-details-table">
            <div className="detail-row">
              <span className="row-label">{isHi ? 'यूएचआईडी (UHID)' : 'UHID'}</span>
              <span className="row-val">UHID-98214</span>
            </div>
            <div className="detail-row">
              <span className="row-label">{isHi ? 'मोबाइल नंबर' : 'Phone'}</span>
              <span className="row-val">+91 98765 43210</span>
            </div>
            <div className="detail-row">
              <span className="row-label">{isHi ? 'पिछली विज़िट' : 'Last Visit'}</span>
              <span className="row-val">12 July 2026 (General Medicine)</span>
            </div>
          </div>

          <div className="s10-confirm-buttons">
            <button 
              className="footer-primary-pill full-width"
              onClick={() => onNavigate(19)}
            >
              <Check size={20} />
              <span>{isHi ? 'हाँ, यह मैं हूँ' : 'Yes, this is me'}</span>
            </button>

            <button 
              className="bottom-pill-btn full-width"
              onClick={() => onNavigate(11)}
            >
              <X size={18} />
              <span>{isHi ? 'नहीं, यह मेरा रिकॉर्ड नहीं है' : 'No, not my record'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 11: Record Not Found Fallback (s11.png)
  if (screenNum === 11) {
    return (
      <div className="screen-container s11-not-found-screen">
        <div className="white-surface-card not-found-card">
          <div className="not-found-icon-wrap">
            <X size={36} color="#E11D48" />
          </div>
          <h3 className="not-found-headline">
            {isHi ? 'कोई मेल खाता रिकॉर्ड नहीं मिला' : "Couldn't find matching record"}
          </h3>
          <p className="not-found-sub">
            {isHi 
              ? 'चिंता न करें, आइए आज के लिए आपकी नई प्रोफ़ाइल बना लेते हैं।' 
              : "No worries, let's create a new patient profile for today's visit."}
          </p>

          <div className="s11-actions-stack">
            <button 
              className="footer-primary-pill full-width"
              onClick={() => onNavigate(12)}
            >
              <span>{isHi ? 'नया प्रोफ़ाइल बनाएं' : 'Create new profile'}</span>
              <ArrowRight size={20} />
            </button>

            <button 
              className="bottom-pill-btn full-width"
              onClick={() => onNavigate(8)}
            >
              <span>{isHi ? 'दोबारा ID दर्ज करें' : 'Try entering ID again'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
