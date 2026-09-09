import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { ScreenId, ScannedDocItem } from '../../types';

interface DocumentScanScreenProps {
  currentScreen: ScreenId;
  scanProgress: number;
  setScanProgress: React.Dispatch<React.SetStateAction<number>>;
  documents?: ScannedDocItem[];
  goTo: (screen: ScreenId) => void;
  langCode?: 'en' | 'hi';
}

export const DocumentScanScreen: React.FC<DocumentScanScreenProps> = ({
  currentScreen,
  scanProgress,
  setScanProgress,
  documents,
  goTo,
  langCode = 'en'
}) => {
  const isHi = langCode === 'hi';

  // Animate scan progress when on scanning screen
  useEffect(() => {
    let timer: any;
    if (currentScreen === '32_SCANNING_BACKGROUND') {
      timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            goTo('34_OCR_PROCESSING');
            return 100;
          }
          return prev + 15;
        });
      }, 400);
    } else {
      setScanProgress(30);
    }
    return () => clearInterval(timer);
  }, [currentScreen, goTo, setScanProgress]);

  return (
    <>
      {/* SCREEN 30: MEDICAL DOCUMENTS INTRO */}
      {currentScreen === '30_DOCUMENT_INTRO' && (
        <motion.div 
          key="30_DOCUMENT_INTRO"
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
                {isHi ? "पुराने चिकित्सा दस्तावेज़ स्कैन करें" : "Scan Previous Medical Documents"}
              </h2>
              <p className="card-main-subtitle">
                {isHi ? "पुराने डॉक्टर के पर्चे, जांच रिपोर्ट या ईसीजी रिकॉर्ड जोड़ें।" : "Insert any prior doctor prescriptions, lab tests, or ECG reports."}
              </p>
            </div>
          </div>

          <div className="grid-2-cards" style={{ margin: 'clamp(8px, 1.4vh, 14px) 0' }}>
            <div className="selection-card">
              <FileText size={20} color="#0e6c38" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>
                  {isHi ? "चिकित्सक के पर्चे" : "Doctor Prescriptions"}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {isHi ? "वर्तमान एवं पूर्व दवाइयों का विवरण" : "Current & past treatment history"}
                </div>
              </div>
            </div>
            <div className="selection-card">
              <Heart size={20} color="#0e6c38" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>
                  {isHi ? "लैब एवं ईसीजी रिपोर्ट" : "Lab & ECG Reports"}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {isHi ? "रक्त परीक्षण, ईसीजी या इमेजिंग रिपोर्ट" : "Blood tests, ECG, or imaging reports"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('37_PREPARING_CASE')}>
              {isHi ? "छोड़ें / कोई दस्तावेज़ नहीं" : "Skip documents"}
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('31_PLACE_DOCUMENT')}>
              <span>{isHi ? "दस्तावेज़ डालें" : "Insert Document"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 31: INSERT DOCUMENT WITH REFERENCE GRAPHIC */}
      {currentScreen === '31_PLACE_DOCUMENT' && (
        <motion.div 
          key="31_PLACE_DOCUMENT"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center' }}
        >
          <h2 className="card-main-title">
            {isHi ? "दस्तावेज़ स्कैनर स्लॉट में रखें" : "Insert Document into Lower Slot"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "कागज़ को ऊपर की ओर रखते हुए नीचे की स्लॉट में डालें।" : "Slide your paper face-up into the highlighted scanner slot."}
          </p>

          <div className="graphic-illustration-container">
            <img 
              src="/assets/scanner_graphic.png" 
              alt="MediKiosk Document Scanner Slot Graphic" 
              className="graphic-illustration-img"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('30_DOCUMENT_INTRO')}>
              {isHi ? "पीछे जाएं" : "Back"}
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('32_SCANNING_BACKGROUND')}>
              <span>{isHi ? "दस्तावेज़ रखा गया" : "Document Inserted"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 32: SCANNING IN BACKGROUND */}
      {currentScreen === '32_SCANNING_BACKGROUND' && (
        <motion.div 
          key="32_SCANNING_BACKGROUND"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <h2 className="card-main-title">
            {isHi ? "दस्तावेज़ की स्कैनिंग चल रही है..." : "Scanning Your Document..."}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "ऑप्टिकल स्कैन लिया जा रहा है और जेमिनी विश्लेषण तैयार हो रहा है।" : "Capturing optical scan and preparing image for Gemini AI OCR."}
          </p>

          <div style={{
            width: '74px',
            height: '92px',
            border: '2px solid #0e6c38',
            borderRadius: '10px',
            margin: '10px auto',
            position: 'relative',
            overflow: 'hidden',
            background: '#f8fafc'
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${scanProgress}%`,
              background: 'linear-gradient(180deg, #22c55e 0%, #0e6c38 100%)',
              transition: 'height 0.3s ease'
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: 800,
              color: scanProgress > 50 ? '#ffffff' : '#0e6c38'
            }}>
              {scanProgress}%
            </div>
          </div>

          <button className="btn-primary-pill" onClick={() => goTo('34_OCR_PROCESSING')}>
            {isHi ? "सत्र जारी रखें" : "Continue Session"}
          </button>
        </motion.div>
      )}

      {/* SCREEN 34: OCR CLINICAL EXTRACTION */}
      {currentScreen === '34_OCR_PROCESSING' && (
        <motion.div 
          key="34_OCR_PROCESSING"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <FileCheck size={32} color="#0e6c38" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">
            {isHi ? "दस्तावेज़ का विश्लेषण जारी है..." : "Reading & Structuring Document..."}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "जेमिनी एआई पर्चे से दवाइयों और परीक्षणों का विवरण निकाल रहा है।" : "Gemini AI is parsing handwriting and medication entities."}
          </p>

          <div style={{ maxWidth: '270px', margin: '10px auto', textAlign: 'left', fontSize: '11px', color: '#16a34a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>{isHi ? "✔ उच्च-रिज़ॉल्यूशन ऑप्टिकल स्कैन दर्ज" : "✔ High-resolution optical scan captured"}</div>
            <div>{isHi ? "✔ निकाली गई दवाइयां: Paracetamol 650mg, Pantoprazole 40mg" : "✔ Extracted: Paracetamol 650mg, Pantoprazole 40mg"}</div>
            <div>{isHi ? "✔ डॉक्टर अंजलि की वर्कस्टेशन फाइल से जोड़ा गया" : "✔ Formatted & linked to Dr. Anjali's workstation"}</div>
          </div>

          <button className="btn-primary-pill" onClick={() => goTo('36_DOCUMENT_COMPLETE')}>
            {isHi ? "आगे बढ़ें →" : "Next →"}
          </button>
        </motion.div>
      )}

      {/* SCREEN 35: SCAN RETRY FALLBACK */}
      {currentScreen === '35_DOCUMENT_PROBLEM' && (
        <motion.div 
          key="35_DOCUMENT_PROBLEM"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 6px auto' }} />
          <h2 className="card-main-title">{isHi ? "दस्तावेज़ का किनारा कट गया" : "Document Edge Cut Off"}</h2>
          <p className="card-main-subtitle">{isHi ? "कृपया सुनिश्चित करें कि कागज़ स्लॉट में सीधा रखा है।" : "Please ensure the document is aligned flat within the slot."}</p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
            <button className="btn-secondary-pill" onClick={() => goTo('37_PREPARING_CASE')}>
              {isHi ? "दस्तावेज़ छोड़ें" : "Skip document"}
            </button>
            <button className="btn-primary-pill" onClick={() => goTo('31_PLACE_DOCUMENT')}>
              {isHi ? "पुनः डालें और स्कैन करें" : "Re-insert & Scan"}
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 36: DOCUMENTS COMPLETE */}
      {currentScreen === '36_DOCUMENT_COMPLETE' && (
        <motion.div 
          key="36_DOCUMENT_COMPLETE"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{ textAlign: 'center', margin: 'auto 0' }}
        >
          <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
          <h2 className="card-main-title">
            {isHi ? "दस्तावेज़ सफलतापूर्वक स्कैन हो गए!" : "Documents Scanned Successfully!"}
          </h2>
          <p className="card-main-subtitle">
            {isHi ? "सभी पुरानी रिपोर्ट दर्ज हो गई हैं। आइए आपकी केस फाइल तैयार करें।" : "We have collected all previous reports. Let's assemble your consultation case."}
          </p>

          <div style={{ marginTop: '14px' }}>
            <button className="btn-primary-pill" onClick={() => goTo('37_PREPARING_CASE')}>
              <span>{isHi ? "केस फाइल संकलित करें" : "Assemble Complete Case"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
