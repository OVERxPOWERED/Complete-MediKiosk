import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FlaskConical, 
  FileCheck, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  FileSearch, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

interface ScreenGroup34to43Props {
  screenNum: number;
  onNavigate: (target: number) => void;
  selectedLanguage: 'en' | 'hi';
  onDocumentProcessed?: (docName: string) => void;
}

export const ScreenGroup34to43: React.FC<ScreenGroup34to43Props> = ({
  screenNum,
  onNavigate,
  selectedLanguage,
  onDocumentProcessed,
}) => {
  const isHi = selectedLanguage === 'hi';
  const [scanProgress, setScanProgress] = useState(68);

  useEffect(() => {
    if (screenNum === 36) {
      const timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            onDocumentProcessed?.('Previous_Prescription.pdf');
            onNavigate(38); // Document Scanned 100%
            return 100;
          }
          return prev + 8;
        });
      }, 500);
      return () => clearInterval(timer);
    }
  }, [screenNum]);

  // SCREEN 34: Scan Medical Documents Intro (s34.png)
  if (screenNum === 34) {
    return (
      <div className="screen-container s34-doc-intro-screen">
        <div className="white-surface-card doc-intro-card">
          <h3 className="doc-intro-title">
            {isHi ? 'अपने पुराने मेडिकल दस्तावेज़ या पर्चे स्कैन करें' : 'Scan Your Medical Documents'}
          </h3>
          <p className="doc-intro-sub">
            {isHi 
              ? 'आप पिछले डॉक्टर के पर्चे, लैब रिपोर्ट या डिस्चार्ज समरी स्कैन कर सकते हैं।' 
              : 'You can scan any relevant documents like prescriptions, lab reports, or discharge summaries.'}
          </p>

          <div className="doc-types-grid">
            <div className="doc-type-card">
              <div className="doc-type-icon icon-bg-blue">
                <FileText size={26} color="#2563EB" />
              </div>
              <h4 className="doc-type-name">{isHi ? 'डॉक्टर का पर्चा' : 'Previous Prescriptions'}</h4>
              <p className="doc-type-desc">{isHi ? 'पुरानी दवाइयों का विवरण' : 'Past medicines & advice'}</p>
            </div>

            <div className="doc-type-card">
              <div className="doc-type-icon icon-bg-green">
                <FlaskConical size={26} color="#059669" />
              </div>
              <h4 className="doc-type-name">{isHi ? 'लैब टेस्ट रिपोर्ट' : 'Lab Test Reports'}</h4>
              <p className="doc-type-desc">{isHi ? 'खून या यूरिन जांच रिपोर्ट' : 'Blood tests, X-rays, ECG'}</p>
            </div>

            <div className="doc-type-card">
              <div className="doc-type-icon icon-bg-purple">
                <FileCheck size={26} color="#7C3AED" />
              </div>
              <h4 className="doc-type-name">{isHi ? 'डिस्चार्ज समरी' : 'Hospital Discharge'}</h4>
              <p className="doc-type-desc">{isHi ? 'अस्पताल भर्ती का रिकॉर्ड' : 'Past admission records'}</p>
            </div>
          </div>

          <div className="s34-actions-row">
            <button 
              className="footer-primary-pill full-width"
              onClick={() => onNavigate(35)}
            >
              <span>{isHi ? 'दस्तावेज़ स्कैन करें' : 'Insert Document'}</span>
              <ArrowRight size={20} />
            </button>

            <button 
              className="bottom-pill-btn full-width"
              onClick={() => onNavigate(44)}
            >
              <span>{isHi ? 'पर्चा नहीं है / छोड़ें (Skip)' : 'Skip for now (No documents)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 35: Insert Document Slot (s35.png)
  if (screenNum === 35) {
    return (
      <div className="screen-container s35-insert-doc-screen">
        <div className="white-surface-card insert-doc-card">
          <div className="insert-doc-split">
            {/* Left: Graphic slot */}
            <div className="insert-doc-graphic-col">
              <img 
                src="/assets/scanner_graphic.png" 
                alt="Scanner Slot Guide"
                className="scanner-slot-img"
              />
              <span className="scanner-slot-tag">
                {isHi ? 'स्क्रीन के नीचे बने स्लॉट में डालें' : 'Feed face up into scanner slot'}
              </span>
            </div>

            {/* Right: Instructions */}
            <div className="insert-doc-steps-col">
              <h4 className="steps-header-title">{isHi ? 'इन चरणों का पालन करें:' : 'Follow these steps:'}</h4>
              <ol className="insert-steps-list">
                <li>
                  <span className="step-badge">1</span>
                  <span>{isHi ? 'पर्चे को सीधा और समतल रखें' : 'Keep the document flat and clean'}</span>
                </li>
                <li>
                  <span className="step-badge">2</span>
                  <span>{isHi ? 'लिखित भाग ऊपर की ओर रखें' : 'Insert with written text facing upwards'}</span>
                </li>
                <li>
                  <span className="step-badge">3</span>
                  <span>{isHi ? 'स्कैनर इसे स्वतः अंदर ले लेगा' : 'The scanner will feed it automatically'}</span>
                </li>
              </ol>

              <button 
                className="s2-start-pill-btn"
                style={{ width: '100%', marginTop: '20px' }}
                onClick={() => onNavigate(36)}
              >
                <span>{isHi ? 'स्कैन शुरू करें' : 'Start Scanning'}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 36: Scanning Progress 68% (s36.png)
  if (screenNum === 36) {
    return (
      <div className="screen-container s36-scanning-screen">
        <div className="white-surface-card scanning-card">
          <div className="scanning-preview-box">
            <div className="scanner-laser-beam" />
            <FileText size={64} color="#00796B" opacity={0.3} />
          </div>

          <h3 className="scanning-progress-title">
            {isHi ? 'दस्तावेज़ स्कैन हो रहा है...' : 'Scanning Document...'}
          </h3>
          <p className="scanning-progress-sub">
            {isHi ? 'कृपया प्रतीक्षा करें, दस्तावेज़ की छवि ली जा रही है।' : 'Please wait while we capture your document.'}
          </p>

          <div className="scan-progress-bar-container">
            <div className="scan-progress-fill" style={{ width: `${scanProgress}%` }} />
          </div>
          <span className="scan-percentage-text">{scanProgress}% · Page 1 of 1</span>
        </div>
      </div>
    );
  }

  // SCREEN 37: Background Scan Notice (s37.png)
  if (screenNum === 37) {
    return (
      <div className="screen-container s37-bg-scan-screen">
        <div className="white-surface-card bg-scan-card">
          <h3 className="bg-scan-title">
            {isHi ? 'बैकग्राउंड में स्कैन जारी है' : 'Scanning in background...'}
          </h3>
          <p className="bg-scan-sub">
            {isHi ? 'आप अपनी विज़िट जारी रख सकते हैं।' : 'You can continue with your visit.'}
          </p>
          <button 
            className="s2-start-pill-btn"
            onClick={() => onNavigate(38)}
          >
            <span>{isHi ? 'आगे बढ़ें' : 'Continue'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 38: Document Scanned 100% (s38.png)
  if (screenNum === 38) {
    return (
      <div className="screen-container s38-scanned-screen">
        <div className="white-surface-card scanned-card">
          <div className="success-icon-badge">
            <Check size={38} color="#059669" strokeWidth={3} />
          </div>
          <h3 className="scanned-title">
            {isHi ? 'दस्तावेज़ 100% स्कैन हो गया' : 'Document Scanned 100%'}
          </h3>
          <p className="scanned-sub">
            {isHi ? 'अब एआई द्वारा पर्चे में लिखी दवाइयों को पढ़ा जा रहा है।' : "Great! Your document has been scanned successfully."}
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(39)}
          >
            <span>{isHi ? 'जानकारी पढ़ें (AI OCR)' : 'Read Document (AI OCR)'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 39: OCR Processing (s39.png)
  if (screenNum === 39) {
    return (
      <div className="screen-container s39-ocr-screen">
        <div className="white-surface-card ocr-card">
          <div className="ocr-reading-animation">
            <FileSearch size={48} color="#00796B" className="spinning-search-icon" />
            <div className="reading-lines-flow">
              <span className="reading-line l1" />
              <span className="reading-line l2" />
              <span className="reading-line l3" />
            </div>
          </div>

          <h3 className="ocr-title">
            {isHi ? 'दस्तावेज़ से जानकारी पढ़ी जा रही है...' : "I'm now reading your document..."}
          </h3>
          <p className="ocr-sub">
            {isHi ? 'Google Gemini AI द्वारा मुख्य दवाइयों और टेस्ट को पहचाना जा रहा है।' : "Extracting key clinical information using Gemini Multimodal AI."}
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(40)}
          >
            <span>{isHi ? 'समीक्षा देखें' : 'View Extracted Info'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 40: OCR Extraction Complete (s40.png)
  if (screenNum === 40) {
    return (
      <div className="screen-container s40-complete-screen">
        <div className="white-surface-card ocr-results-card">
          <div className="ocr-success-badge">
            <Sparkles size={24} color="#059669" />
            <span>{isHi ? 'दवाइयों और सलाह की पहचान पूरी हुई' : 'Information Extracted Successfully'}</span>
          </div>

          <div className="extracted-fields-box">
            <div className="extracted-field">
              <span className="field-label">{isHi ? 'चिकित्सक' : 'Doctor'}</span>
              <span className="field-value">Dr. S. K. Sharma (MD Internal Medicine)</span>
            </div>
            <div className="extracted-field">
              <span className="field-label">{isHi ? 'निदान (Diagnosis)' : 'Diagnosis'}</span>
              <span className="field-value">Acute Upper Respiratory Tract Infection (Cold)</span>
            </div>
            <div className="extracted-field">
              <span className="field-label">{isHi ? 'पहचानी गई दवाइयां' : 'Identified Medications'}</span>
              <span className="field-value">Paracetamol 500mg (SOS), Cetirizine 10mg (OD)</span>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(43)}
          >
            <span>{isHi ? 'आगे बढ़ें' : 'Continue'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 41: Scan Unclear Warning (s41.png)
  if (screenNum === 41) {
    return (
      <div className="screen-container s41-unclear-screen">
        <div className="white-surface-card unclear-doc-card">
          <div className="unclear-icon-circle">
            <AlertTriangle size={36} color="#D97706" />
          </div>
          <h3 className="unclear-doc-title">
            {isHi ? 'स्कैन साफ नहीं आ सका' : 'Scan Unsuccessful - Image Unclear'}
          </h3>
          <p className="unclear-doc-sub">
            {isHi ? 'तस्वीर थोड़ी धुंधली थी। कृपया पर्चे को समतल रखें और दोबारा डालें।' : "Looks like we couldn't read this document clearly. Let's try scanning again."}
          </p>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => onNavigate(42)}
          >
            <span>{isHi ? 'विकल्प देखें' : 'View Options'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 42: Scan Again or Skip (s42.png)
  if (screenNum === 42) {
    return (
      <div className="screen-container s42-retry-skip-screen">
        <div className="white-surface-card retry-skip-card">
          <div className="s5-cards-grid">
            <div 
              className="patient-choice-card existing-patient-card"
              onClick={() => onNavigate(35)}
              role="button"
              tabIndex={0}
            >
              <div className="choice-badge-icon icon-bg-green">
                <RotateCcw size={28} color="#059669" />
              </div>
              <h3 className="choice-card-title">{isHi ? 'दोबारा स्कैन करें' : 'Scan Again'}</h3>
              <p className="choice-card-sub">{isHi ? 'पर्चा दोबारा स्लॉट में डालें।' : 'Try feeding document into slot again.'}</p>
              <button className="choice-arrow-btn arrow-btn-green">
                <ArrowRight size={20} color="#059669" />
              </button>
            </div>

            <div 
              className="patient-choice-card new-patient-card"
              onClick={() => onNavigate(43)}
              role="button"
              tabIndex={0}
            >
              <div className="choice-badge-icon icon-bg-blue">
                <ArrowRight size={28} color="#2563EB" />
              </div>
              <h3 className="choice-card-title">{isHi ? 'अभी छोड़ें' : 'Skip for Now'}</h3>
              <p className="choice-card-sub">{isHi ? 'बिना पर्चे के आगे बढ़ें।' : 'Continue without this document.'}</p>
              <button className="choice-arrow-btn arrow-btn-blue">
                <ArrowRight size={20} color="#2563EB" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 43: Collection Complete (s43.png)
  if (screenNum === 43) {
    return (
      <div className="screen-container s43-complete-screen">
        <div className="white-surface-card collection-complete-card">
          <div className="collection-badge-icon">
            <ShieldCheck size={38} color="#00796B" />
          </div>

          <h3 className="collection-title">
            {isHi ? 'सभी दस्तावेज़ एकत्रित हो गए!' : 'All your documents are collected!'}
          </h3>
          <p className="collection-sub">
            {isHi ? 'डॉक्टर के लिए आपकी सभी फाइलें तैयार हैं।' : "We have everything we need. Let's continue."}
          </p>

          <div className="collection-checklist">
            <div className="col-check-item">
              <Check size={18} color="#059669" strokeWidth={3} />
              <span>{isHi ? 'दस्तावेज़ प्राप्त हुआ' : 'Document Received'}</span>
            </div>
            <div className="col-check-item">
              <Check size={18} color="#059669" strokeWidth={3} />
              <span>{isHi ? 'जानकारी संकलित' : 'Information Extracted'}</span>
            </div>
            <div className="col-check-item">
              <Check size={18} color="#059669" strokeWidth={3} />
              <span>{isHi ? 'डॉक्टर फाइल तैयार' : 'Ready for Doctor'}</span>
            </div>
          </div>

          <button 
            className="s2-start-pill-btn"
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => onNavigate(44)}
          >
            <span>{isHi ? 'केस समरी तैयार करें' : 'Prepare Case Summary'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
