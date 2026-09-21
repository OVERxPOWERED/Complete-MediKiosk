import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  QrCode, 
  Printer, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  User, 
  Heart, 
  Clock 
} from 'lucide-react';

interface ScreenGroup44to51Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  selectedLanguage: 'en' | 'hi';
  patientToken?: string;
  patientName?: string;
  onCheckinComplete?: () => void;
}

export const ScreenGroup44to51: React.FC<ScreenGroup44to51Props> = ({
  screenNum,
  onNavigate,
  selectedLanguage,
  patientToken = 'A1054',
  patientName,
  onCheckinComplete,
}) => {
  const isHi = selectedLanguage === 'hi';
  const [dispenseProgress, setDispenseProgress] = useState(25);

  useEffect(() => {
    if (screenNum === 44) {
      const timer = setTimeout(() => {
        onNavigate(47);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screenNum, onNavigate]);

  useEffect(() => {
    if (screenNum === 49) {
      const timer = setInterval(() => {
        setDispenseProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 25;
        });
      }, 600);
      return () => clearInterval(timer);
    }
  }, [screenNum]);

  // SCREEN 44: Preparing Your Case (s44.png)
  if (screenNum === 44) {
    return (
      <div className="screen-container s44-preparing-screen">
        <div className="white-surface-card preparing-card">
          <div className="preparing-gears-animation">
            <Sparkles size={42} color="#00796B" className="spinning-search-icon" />
          </div>

          <h3 className="preparing-title">
            {isHi ? 'आपका केस तैयार किया जा रहा है...' : 'Preparing your case...'}
          </h3>
          <p className="preparing-sub">
            {isHi 
              ? 'आपकी बातचीत, वाइटल्स और दस्तावेज़ों को मिलाकर डॉक्टर फाइल तैयार हो रही है।' 
              : "Putting together your conversation, health details, and documents for the doctor."}
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => onNavigate(45)}
          >
            <span>{isHi ? 'केस समरी देखें' : 'View Prepared Case'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 45: Case Ready Confirmation (s45.png)
  if (screenNum === 45) {
    return (
      <div className="screen-container s45-ready-screen">
        <div className="white-surface-card case-ready-card">
          <div className="case-ready-badge">
            <CheckCircle2 size={38} color="#059669" />
          </div>

          <h3 className="case-ready-title">
            {isHi ? 'आपका केस तैयार है!' : 'Your case is ready!'}
          </h3>
          <p className="case-ready-sub">
            {isHi 
              ? 'डॉक्टर अंजलि वर्मा के पास आपकी पूरी जानकारी पहुंच चुकी है।' 
              : 'Your doctor will now have a complete picture to provide better care.'}
          </p>

          <div className="summary-snapshot-grid">
            <div className="snapshot-box">
              <User size={20} color="#00796B" />
              <span>{patientName || 'Rohit Mehta'} (38 Y, M)</span>
            </div>
            <div className="snapshot-box">
              <Heart size={20} color="#E11D48" />
              <span>BP: 118/78 mmHg · SpO2: 98%</span>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => onNavigate(46)}
          >
            <span>{isHi ? 'टोकन और कलाई का पट्टा बनाएं' : 'Generate Visit Token'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 46: All Set Summary (s46.png)
  if (screenNum === 46) {
    return (
      <div className="screen-container s46-all-set-screen">
        <div className="white-surface-card all-set-card">
          <h3 className="all-set-headline">
            {isHi ? 'बहुत बढ़िया! आपकी चेक-इन पूरी हो गई' : "Great! You're all set."}
          </h3>
          <p className="all-set-subline">
            {isHi 
              ? 'आपकी विज़िट के लिए आवश्यक सभी जानकारी एकत्र कर ली गई है।' 
              : "We've collected everything we need for your visit. You can now meet your doctor."}
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => onNavigate(47)}
          >
            <span>{isHi ? 'विज़िट क्यूआर टोकन देखें' : 'View Visit QR Token'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 47: Visit QR Token (s47.png)
  if (screenNum === 47) {
    return (
      <div className="screen-container s47-qr-screen">
        <div className="white-surface-card qr-token-card">
          <h3 className="qr-token-title">
            {isHi ? 'आपका विज़िट क्यूआर कोड' : 'Your Visit QR Code'}
          </h3>
          <p className="qr-token-sub">
            {isHi 
              ? 'डॉक्टर इस कोड को स्कैन करके आपकी पूरी मेडिकल समरी देख सकते हैं।' 
              : 'Your doctor can scan this code to securely access your prepared case.'}
          </p>

          <div className="qr-code-display-box">
            <QrCode size={140} color="#004D40" />
            <div className="qr-token-pill">
              <span className="token-label">{isHi ? 'टोकन नंबर' : 'Token'}</span>
              <span className="token-value">{patientToken}</span>
            </div>
          </div>

          <div className="qr-meta-box">
            <span>Patient: {patientName || 'Rohit Mehta'} · Counter 4</span>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(48)}
          >
            <span>{isHi ? 'कलाई का पट्टा प्रिंट करें' : 'Print Wristband'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 48: Wristband Ready Guide (s48.png)
  if (screenNum === 48) {
    return (
      <div className="screen-container s48-wristband-guide-screen">
        <div className="white-surface-card wristband-guide-card">
          <div className="wristband-icon-badge">
            <Printer size={38} color="#00796B" />
          </div>

          <h3 className="wristband-guide-title">
            {isHi ? 'कलाई का पट्टा तैयार है' : 'Get Your Wristband Ready'}
          </h3>
          <p className="wristband-guide-sub">
            {isHi 
              ? 'क्यूआर कोड युक्त कलाई का पट्टा प्रिंटर से स्वतः बाहर आएगा।' 
              : 'Your wristband with QR code will be dispensed automatically.'}
          </p>

          <div className="place-hand-guide-box">
            <span className="hand-guide-tag">{isHi ? 'हाथ यहाँ रखें' : 'Place your hand here'}</span>
            <div className="hand-tray-indicator" />
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => onNavigate(49)}
          >
            <span>{isHi ? 'पट्टा निकालें' : 'Dispense Wristband'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 49: Dispensing Wristband Animation (s49.png)
  if (screenNum === 49) {
    return (
      <div className="screen-container s49-dispensing-screen">
        <div className="white-surface-card dispensing-card">
          <h3 className="dispensing-title">
            {isHi ? 'कलाई का पट्टा छप रहा है...' : 'Almost there! Your wristband is being dispensed.'}
          </h3>
          <p className="dispensing-sub">
            {isHi 
              ? 'पट्टा पूरी तरह बाहर आने पर इसे आराम से निकाल लें।' 
              : 'Please keep your hand steady and take the wristband once it is fully out.'}
          </p>

          <div className="wristband-printer-tray-animated">
            <div 
              className="thermal-band-strip"
              style={{ transform: `translateY(${(dispenseProgress - 100) * 0.5}px)` }}
            >
              <div className="band-qr-chip">
                <QrCode size={24} color="#000000" />
                <span className="band-token-text">{patientToken}</span>
              </div>
              <span className="band-patient-name">Rohit Mehta · 38M</span>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(50)}
          >
            <span>{isHi ? 'पट्टा प्राप्त हुआ' : 'Wristband Collected'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 50: Consultation Room Handoff (s50.png)
  if (screenNum === 50) {
    return (
      <div className="screen-container s50-room-handoff-screen">
        <div className="white-surface-card room-handoff-card">
          <div className="room-icon-badge">
            <MapPin size={38} color="#059669" />
          </div>

          <h3 className="room-title">
            {isHi ? 'आप तैयार हैं! कमरा नंबर 4' : "You're All Set! Consultation Room 4"}
          </h3>
          <p className="room-sub">
            {isHi 
              ? 'डॉक्टर अंजलि वर्मा के पास आपकी फाइल सुरक्षित पहुँच चुकी है।' 
              : 'Your information has been securely sent to Dr. Anjali Verma.'}
          </p>

          <div className="room-info-card">
            <div className="room-num-badge">
              <span className="room-label">{isHi ? 'कमरा / काउंटर' : 'Counter'}</span>
              <span className="room-val">4</span>
            </div>
            <div className="room-text-details">
              <h4>Dr. Anjali Verma (MD Internal Medicine)</h4>
              <p>General Medicine OPD · Ground Floor</p>
              <span className="wait-time-tag">
                <Clock size={14} /> {isHi ? 'अनुमानित प्रतीक्षा: ~4 मिनट' : 'Estimated wait: ~4 mins'}
              </span>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => {
              onCheckinComplete?.();
              onNavigate(51);
            }}
          >
            <span>{isHi ? 'चेक-इन समाप्त करें' : 'Finish Check-in'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 51: Thank You Screen (s51.png)
  if (screenNum === 51) {
    return (
      <div className="screen-container s51-thank-you-screen">
        <div className="white-surface-card thank-you-card">
          <div className="thank-you-badge">
            <Sparkles size={46} color="#00796B" />
          </div>

          <h2 className="thank-you-headline">
            {isHi ? 'धन्यवाद!' : 'Thank You!'}
          </h2>
          <h3 className="thank-you-subhead">
            {isHi ? 'आपकी चेक-इन पूरी हो चुकी है।' : 'Your check-in is complete.'}
          </h3>
          <p className="thank-you-message">
            {isHi 
              ? 'MediKiosk का उपयोग करने के लिए धन्यवाद। हम आपके अच्छे स्वास्थ्य और सुखद परामर्श की कामना करते हैं।' 
              : 'We appreciate you using MediKiosk. Wishing you a safe and healthy visit!'}
          </p>

          <div className="thank-you-motto-tag">
            {isHi ? 'स्वस्थ समुदाय, उज्ज्वल भविष्य' : 'Small steps today for a healthier tomorrow.'}
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '28px' }}
            onClick={() => onNavigate(1)}
          >
            <span>{isHi ? 'नया मरीज़ / शुरू करें' : 'Done / New Patient'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
