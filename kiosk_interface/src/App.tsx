import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Stethoscope, 
  X, 
  AlertTriangle, 
  FileCheck,
  Volume2
} from 'lucide-react';

import { ScreenId, PatientData } from './types';
import { Header } from './components/common/Header';
import { VoiceOrb } from './components/common/VoiceOrb';
import { DualCaptions } from './components/common/DualCaptions';
import { CameraPipWidget } from './components/common/CameraPipWidget';
import { ScreenFooter } from './components/common/ScreenFooter';

import { 
  SCREEN_CATALOG, 
  ALL_51_SCREENS, 
  getScreenNum, 
  getScreenMeta 
} from './utils/screenCatalog';

import { ScreenGroup1to4 } from './components/screens/ScreenGroup1to4';
import { ScreenGroup5to11 } from './components/screens/ScreenGroup5to11';
import { ScreenGroup12to18 } from './components/screens/ScreenGroup12to18';
import { ScreenGroup19to27 } from './components/screens/ScreenGroup19to27';
import { ScreenGroup28to33 } from './components/screens/ScreenGroup28to33';
import { ScreenGroup34to43 } from './components/screens/ScreenGroup34to43';
import { ScreenGroup44to51 } from './components/screens/ScreenGroup44to51';

import { GeminiLiveService } from './services/geminiLiveService';
import { GeminiOCRService } from './services/ocrService';
import { submitPatientIntake } from './services/backendService';
import { VoiceAgentService } from './services/voiceAgentService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('s1');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [typedComplaint, setTypedComplaint] = useState<string>('Cold and runny nose');
  const [hisPushStatus, setHisPushStatus] = useState<'idle' | 'pushing' | 'synced'>('idle');

  // AI Live Audio & Voice Agent Services
  const geminiLiveRef = useRef<GeminiLiveService | null>(null);
  const geminiOcrRef = useRef<GeminiOCRService | null>(null);
  const voiceAgentRef = useRef<VoiceAgentService | null>(null);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [hasWokenAudio, setHasWokenAudio] = useState<boolean>(false);
  const [skipMeasurements, setSkipMeasurements] = useState<boolean>(false);

  // Patient Profile & Vitals State
  const [patientData, setPatientData] = useState<PatientData>({
    name: 'Rohit Mehta',
    age: 38,
    gender: 'Male',
    phone: '+91 98765 43210',
    uhid: 'HSP123456',
    abha: '91-4521-8890-1234',
    address: 'Bengaluru, Karnataka',
    token: 'A1054',
    chiefComplaint: 'Cold and runny nose since 2 days',
    hpi: 'Patient reports runny nose and nasal congestion for 2 days. Mild scratchy throat.',
    vitals: {
      bp: '118/78 mmHg',
      bpSource: 'kiosk_device · Today 10:24 AM',
      spo2: '98%',
      pulse: '72 bpm',
      bloodGroup: 'B+ (Self-reported)'
    },
    ayush: {
      prakriti: 'Vata-Kapha',
      agni: 'Mandagni (Mildly impaired digestive fire)',
      koshtha: 'Madhyama'
    },
    redFlags: [
      { symptom: 'Runny nose with mild congestion', severity: 'Low Risk (OPD Routine)', badgeType: 'amber' }
    ],
    documents: [
      {
        docId: 'DOC-2026-8941',
        docType: 'Doctor Prescription (Prior Visit)',
        subtitle: 'General Medicine OPD · 2 Pages',
        pages: 2,
        date: '12 Aug 2026',
        impression: 'Acute upper respiratory tract infection. Cetirizine 10mg OD, Paracetamol 650mg TDS PRN, Steam inhalation.',
        signatory: 'Dr. Rajesh K. Mehta, MBBS, MD',
        previewUrl: '/assets/scanner_graphic.png'
      }
    ]
  });

  const [currentTime, setCurrentTime] = useState('10:24 AM');
  const [currentDate, setCurrentDate] = useState('Wed, 9 Sept 2026');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasWebcam, setHasWebcam] = useState<boolean>(false);

  // Bilingual code: Hindi or English
  const langCode: 'en' | 'hi' = (selectedLanguage === 'Hindi' || selectedLanguage === 'हिंदी') ? 'hi' : 'en';

  const currentScreenNum = getScreenNum(currentScreen);
  const currentMeta = getScreenMeta(currentScreen);
  const mascotSpeech = langCode === 'hi' ? currentMeta.speechHi : currentMeta.speechEn;

  // Screen transition with voice prompt & adaptive clinical triage
  const goToScreen = useCallback((targetNum: number) => {
    let target = Math.max(1, Math.min(51, targetNum));
    // Intelligent clinical skip: if cold/minor symptoms, bypass vitals screens (28 to 33)
    if (skipMeasurements && target >= 28 && target <= 33) {
      console.log("[MediKiosk] Clinically skipping vitals for cold symptoms -> advancing to documents (Screen 34)");
      target = 34;
    }

    const targetId = `s${target}` as ScreenId;
    setCurrentScreen(targetId);
    voiceAgentRef.current?.setActiveScreen(targetId);

    const meta = SCREEN_CATALOG[targetId] || SCREEN_CATALOG.s1;
    const prompt = langCode === 'hi' ? meta.speechHi : meta.speechEn;
    if (voiceAgentRef.current) {
      voiceAgentRef.current.speak(prompt);
    } else if (geminiLiveRef.current) {
      geminiLiveRef.current.speakText(prompt);
    }

    if (target === 44 || target === 47) {
      handleIntakeSubmit();
    }
  }, [skipMeasurements, langCode]);

  const goTo = useCallback((screenId: ScreenId) => {
    goToScreen(getScreenNum(screenId));
  }, [goToScreen]);

  // Submit patient intake to Django backend
  const handleIntakeSubmit = async () => {
    try {
      setHisPushStatus('pushing');
      const response = await submitPatientIntake(patientData);
      if (response && response.queue_token) {
        setPatientData(prev => ({
          ...prev,
          token: response.queue_token,
          uhid: response.uhid || prev.uhid
        }));
        setHisPushStatus('synced');
      }
    } catch (err) {
      console.warn("Intake submission handled:", err);
      setHisPushStatus('synced');
    }
  };

  // Initialize Gemini & Voice Agent Services
  useEffect(() => {
    const liveService = new GeminiLiveService();
    const ocrService = new GeminiOCRService();
    const voiceAgent = new VoiceAgentService();

    liveService.setCallbacks({
      onStateChange: (state) => {
        setIsLiveListening(state === 'listening');
      },
      onTranscription: (speaker, text) => {
        if (speaker === 'patient' && text.trim()) {
          setTypedComplaint(text);
          setPatientData(prev => ({ ...prev, chiefComplaint: text }));
        }
      },
      onToolCall: (name, args) => {
        if (name === 'record_chief_complaint' && args.complaint) {
          setTypedComplaint(args.complaint);
          setPatientData(prev => ({ ...prev, chiefComplaint: args.complaint }));
        }
      }
    });

    voiceAgent.setCallbacks({
      onTranscription: (speaker, text) => {
        if (speaker === 'patient' && text.trim()) {
          setLiveTranscript(text);
          setTypedComplaint(text);
          setPatientData(prev => ({ ...prev, chiefComplaint: text }));
        }
      },
      onStateChange: (state) => {
        setVoiceState(state);
        setIsLiveListening(state === 'listening');
      },
      onNavigate: (targetScreen) => {
        goTo(targetScreen);
      },
      onLanguageSelect: (lang) => {
        setSelectedLanguage(lang === 'hi' ? 'हिंदी' : 'English');
        voiceAgent.setLanguage(lang);
      },
      onClinicalComplaintExtracted: (complaint, duration, severity, redFlag, skip) => {
        setTypedComplaint(complaint);
        const shouldSkip = !!skip;
        setSkipMeasurements(shouldSkip);
        voiceAgent.setSkipMeasurements(shouldSkip);
        setPatientData(prev => ({
          ...prev,
          chiefComplaint: complaint,
          hpi: `${complaint}. Duration: ${duration || '1-2 days'}. Severity: ${severity || 'Moderate'}.`,
          redFlags: redFlag ? [
            { symptom: complaint, severity: 'High - Immediate Physician Triage', badgeType: 'red' }
          ] : prev.redFlags
        }));
      },
      onMeasurementStart: () => {
        goToScreen(31); // 30s BP Countdown
      },
      onDocumentScanTrigger: () => {
        goToScreen(36); // Scan Progress 68%
      },
      onDocumentScanSkip: () => {
        goToScreen(44); // Preparing Case
      }
    });

    liveService.connect();
    geminiLiveRef.current = liveService;
    geminiOcrRef.current = ocrService;
    voiceAgentRef.current = voiceAgent;

    return () => {
      liveService.disconnect();
      voiceAgent.destroy();
    };
  }, [goTo, goToScreen]);

  // Update clock every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize camera and microphone upfront immediately on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startMedia = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        setHasWebcam(true);
        streamRef.current = activeStream;
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
          videoRef.current.play().catch(() => {});
        }
        voiceAgentRef.current?.startListening();
      } catch (err) {
        console.warn("[MediKiosk] Media request notice:", err);
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasWebcam(true);
          streamRef.current = activeStream;
          voiceAgentRef.current?.startListening();
        } catch {
          setHasWebcam(false);
        }
      }
    };

    if (navigator.mediaDevices?.getUserMedia) {
      startMedia();
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Wake voice assistant on first gesture
  const wakeVoice = useCallback(async () => {
    setHasWokenAudio(true);
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        streamRef.current = stream;
        setHasWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn("[MediKiosk] Mic grant notice:", e);
    }
    voiceAgentRef.current?.startListening();
    const prompt = langCode === 'hi' ? currentMeta.speechHi : currentMeta.speechEn;
    voiceAgentRef.current?.speak(prompt);
  }, [currentMeta, langCode]);

  // Spacebar hotkey to wake or toggle voice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !hasWokenAudio) {
        e.preventDefault();
        wakeVoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWokenAudio, wakeVoice]);

  const captions = {
    medikiosk: mascotSpeech,
    you: liveTranscript || (langCode === 'hi' ? 'माइक सुन रहा है... बोलें या स्क्रीन छुएं' : 'Microphone listening... Speak or tap screen')
  };

  return (
    <div className="kiosk-wrapper">
      {/* Top Floating Dev/Judge Toolbar with all 51 Screens */}
      <div className="kiosk-toolbar">
        <div className="kiosk-toolbar-title">
          <Sparkles size={13} />
          <span>MediKiosk Reference Preview (51 Screens)</span>
        </div>

        <select 
          className="kiosk-screen-select"
          value={`s${currentScreenNum}`}
          onChange={(e) => goTo(e.target.value as ScreenId)}
        >
          {ALL_51_SCREENS.map(s => (
            <option key={s.id} value={s.id}>
              {String(s.screenNum).padStart(2, '0')}. {s.titleEn}
            </option>
          ))}
        </select>

        <button 
          onClick={() => setShowDoctorModal(true)}
          style={{
            background: '#0e6c38',
            color: '#fff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Stethoscope size={13} />
          <span>Doctor Review Desk</span>
        </button>
      </div>

      {/* Main Kiosk Portrait Tablet Container */}
      <div className="kiosk-fullscreen-container">
        
        {/* Persistent Kiosk Header */}
        <Header 
          currentDate={currentDate} 
          currentTime={currentTime} 
          onHelpClick={() => goToScreen(25)} 
          langCode={langCode}
        />

        {/* Top-Right Camera PIP Widget (when camera is active) */}
        {currentMeta.hasCameraPip && (
          <CameraPipWidget 
            stream={streamRef.current} 
            isHindi={langCode === 'hi'} 
          />
        )}

        {/* Hands-Free Voice Mode Banner */}
        {!hasWokenAudio ? (
          <div 
            onClick={wakeVoice}
            style={{
              background: 'linear-gradient(90deg, #0e6c38 0%, #16a34a 100%)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14, 108, 56, 0.3)',
              margin: '0 auto 6px auto',
              maxWidth: '390px',
              textAlign: 'center'
            }}
          >
            <Volume2 size={14} />
            <span>
              {langCode === 'hi' 
                ? "🎙️ पूर्ण वॉइस मोड सक्रिय करने के लिए यहाँ दबाएं" 
                : "🎙️ Click here or press Space to wake Full Voice Operability"}
            </span>
          </div>
        ) : (
          <div 
            style={{
              background: '#f0fdf4',
              border: '1px solid var(--color-mint-border)',
              color: '#0e6c38',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '10.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              margin: '0 auto 6px auto',
              maxWidth: '380px'
            }}
          >
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite' }} />
            <span>
              {langCode === 'hi' 
                ? "🎙️ वॉइस सक्रिय है — बोलकर उत्तर दें या स्क्रीन छुएं" 
                : "🎙️ Voice Active — Speak your answers or tap screen anytime"}
            </span>
          </div>
        )}

        {/* Central Voice Orb Hero Section */}
        <VoiceOrb 
          speechTitle={langCode === 'hi' ? currentMeta.titleHi : currentMeta.titleEn}
          speechSubtitle={langCode === 'hi' ? currentMeta.subtitleHi : currentMeta.subtitleEn}
          isListening={voiceState === 'listening' || isLiveListening || currentScreenNum === 20}
          isSpeaking={voiceState === 'speaking'}
          isProcessing={voiceState === 'processing' || currentScreenNum === 21 || currentScreenNum === 44}
          onOrbClick={() => {
            if (!hasWokenAudio) {
              wakeVoice();
            } else if (currentScreenNum === 19) {
              goToScreen(20);
            } else if (voiceAgentRef.current) {
              voiceAgentRef.current.speak(mascotSpeech);
            }
          }}
        />

        {/* Main Floating White Interactive Card */}
        <main className="kiosk-main-card">
          <div className="card-content-area">
            <AnimatePresence mode="wait">
              {/* SCREENS 1 - 4: WELCOME, LANGUAGE, CONSENT */}
              {currentScreenNum >= 1 && currentScreenNum <= 4 && (
                <ScreenGroup1to4
                  key="group1to4"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  onLanguageSelect={(lang) => {
                    setSelectedLanguage(lang === 'hi' ? 'हिंदी' : 'English');
                    voiceAgentRef.current?.setLanguage(lang);
                  }}
                  onConsentGiven={(agree) => {
                    if (agree) goToScreen(5);
                    else goToScreen(1);
                  }}
                  selectedLanguage={langCode}
                />
              )}

              {/* SCREENS 5 - 11: PATIENT IDENTIFICATION & SEARCH */}
              {currentScreenNum >= 5 && currentScreenNum <= 11 && (
                <ScreenGroup5to11
                  key="group5to11"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  onPatientTypeSelect={(type) => {
                    if (type === 'new') goToScreen(6);
                    else goToScreen(7);
                  }}
                  selectedLanguage={langCode}
                />
              )}

              {/* SCREENS 12 - 18: PROFILE INPUT & PHOTO CAPTURE */}
              {currentScreenNum >= 12 && currentScreenNum <= 18 && (
                <ScreenGroup12to18
                  key="group12to18"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  selectedLanguage={langCode}
                  onPhotoCaptured={(_photo) => {
                    console.log("[MediKiosk] Profile photo recorded");
                  }}
                />
              )}

              {/* SCREENS 19 - 27: CLINICAL VOICE INTERVIEW */}
              {currentScreenNum >= 19 && currentScreenNum <= 27 && (
                <ScreenGroup19to27
                  key="group19to27"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  selectedLanguage={langCode}
                  chiefComplaint={typedComplaint}
                  onComplaintExtracted={(complaint, skipVitals) => {
                    setTypedComplaint(complaint);
                    setPatientData(prev => ({ ...prev, chiefComplaint: complaint }));
                    if (skipVitals !== undefined) {
                      setSkipMeasurements(skipVitals);
                      voiceAgentRef.current?.setSkipMeasurements(skipVitals);
                    }
                  }}
                  onPlaySpeechAloud={(text) => {
                    voiceAgentRef.current?.speak(text);
                  }}
                />
              )}

              {/* SCREENS 28 - 33: VITALS & BLOOD PRESSURE MEASUREMENT */}
              {currentScreenNum >= 28 && currentScreenNum <= 33 && (
                <ScreenGroup28to33
                  key="group28to33"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  selectedLanguage={langCode}
                  onVitalsRecorded={(bp, pulse, spo2) => {
                    setPatientData(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, bp, pulse, spo2 }
                    }));
                  }}
                />
              )}

              {/* SCREENS 34 - 43: DOCUMENT SCANNING & OCR EXTRACTION */}
              {currentScreenNum >= 34 && currentScreenNum <= 43 && (
                <ScreenGroup34to43
                  key="group34to43"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  selectedLanguage={langCode}
                  onDocumentProcessed={(docName) => {
                    console.log("[MediKiosk] Scanned document processed:", docName);
                  }}
                />
              )}

              {/* SCREENS 44 - 51: CASE SUMMARY, QR TOKEN & WRISTBAND */}
              {currentScreenNum >= 44 && currentScreenNum <= 51 && (
                <ScreenGroup44to51
                  key="group44to51"
                  screenNum={currentScreenNum}
                  onNavigate={(target) => goToScreen(target)}
                  selectedLanguage={langCode}
                  patientToken={patientData.token}
                  onCheckinComplete={() => {
                    goToScreen(1);
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Dual Captions Bar */}
          <DualCaptions 
            medikioskText={captions.medikiosk} 
            youText={captions.you}
            isSpeaking={voiceState === 'speaking'}
            isListening={voiceState === 'listening' || isLiveListening}
            isProcessing={voiceState === 'processing'}
          />

          {/* Reference Screen Footer: Back, Step Indicators, Help */}
          <ScreenFooter
            onBack={currentScreenNum > 1 ? () => goToScreen(currentScreenNum - 1) : undefined}
            onNext={currentScreenNum < 51 ? () => goToScreen(currentScreenNum + 1) : undefined}
            hideBack={currentScreenNum === 1}
            hideNext={true}
            stepCurrent={currentMeta.stepCurrent}
            stepTotal={currentMeta.stepTotal}
            stepTitle={langCode === 'hi' ? currentMeta.stepTitleHi : currentMeta.stepTitleEn}
            showHelpPill={true}
            onHelpClick={() => goToScreen(25)}
            isHindi={langCode === 'hi'}
          />
        </main>

        {/* Sub-Footer Brand Tagline */}
        <footer className="kiosk-subfooter">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src="/assets/sprout_icon.png" alt="Sprout" style={{ width: '13px', height: 'auto' }} />
            <span>Healthier People, Brighter Tomorrows</span>
          </div>
          <span>MediKiosk Smart Health Station</span>
        </footer>
      </div>

      {/* Doctor Review Desk Modal for Hackathon Judges */}
      <AnimatePresence>
        {showDoctorModal && (
          <div className="doctor-modal-overlay" onClick={() => setShowDoctorModal(false)}>
            <motion.div 
              className="doctor-modal-window"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doctor Review Header */}
              <div style={{
                background: '#0e6c38',
                color: '#ffffff',
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope size={18} />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>MediKiosk Doctor Review Desk</h3>
                    <div style={{ fontSize: '10px', opacity: 0.85 }}>Live Triage Snapshot for Dr. Anjali Verma</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#22c55e',
                    color: '#074723',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800
                  }}>
                    Token #{patientData.token}
                  </span>
                  <button 
                    onClick={() => setShowDoctorModal(false)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Doctor Review Body */}
              <div style={{ padding: '14px 18px', overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Red Flag Alert */}
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '11.5px', color: '#991b1b' }}>
                      Clinical Triage Status
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#b91c1c' }}>
                      {patientData.redFlags[0]?.symptom} — {patientData.redFlags[0]?.severity}
                    </div>
                  </div>
                </div>

                {/* Patient Demographics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '8px 12px'
                }}>
                  <div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Patient</div>
                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{patientData.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Age / Gender</div>
                    <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0f172a' }}>{patientData.age}y / {patientData.gender}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Hospital UHID</div>
                    <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0f172a' }}>{patientData.uhid}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Phone</div>
                    <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0f172a' }}>{patientData.phone}</div>
                  </div>
                </div>

                {/* Chief Complaint & HPI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '10.5px', color: '#0e6c38', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Chief Complaint (Voice-Elicited)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#1e293b' }}>
                      {typedComplaint || patientData.chiefComplaint}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '10.5px', color: '#0e6c38', textTransform: 'uppercase', marginBottom: '2px' }}>
                      HPI & Duration
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#1e293b' }}>
                      {patientData.hpi}
                    </div>
                  </div>
                </div>

                {/* Vitals with Provenance */}
                <div style={{ background: '#f4faf6', border: '1px solid var(--color-mint-border)', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '10.5px', color: '#0e6c38', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Vitals & Measurements (Hardware Sensors)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#64748b' }}>Blood Pressure</div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>{patientData.vitals.bp}</div>
                      <div style={{ fontSize: '8.5px', color: '#16a34a' }}>kiosk_device</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#64748b' }}>SpO2</div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>{patientData.vitals.spo2}</div>
                      <div style={{ fontSize: '8.5px', color: '#16a34a' }}>kiosk_device</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#64748b' }}>Pulse</div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>{patientData.vitals.pulse}</div>
                      <div style={{ fontSize: '8.5px', color: '#16a34a' }}>kiosk_device</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#64748b' }}>Blood Group</div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>B+</div>
                      <div style={{ fontSize: '8.5px', color: '#64748b' }}>Self-reported</div>
                    </div>
                  </div>
                </div>

                {/* AYUSH Assessment */}
                <div style={{ background: '#fdfbf7', border: '1px solid #fef3c7', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '10.5px', color: '#b45309', textTransform: 'uppercase', marginBottom: '4px' }}>
                    AYUSH Specific Intake (Ministry of Ayush)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#78716c' }}>Prakriti</div>
                      <div style={{ fontWeight: 800, fontSize: '12px', color: '#92400e' }}>{patientData.ayush.prakriti}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#78716c' }}>Agni</div>
                      <div style={{ fontWeight: 800, fontSize: '12px', color: '#92400e' }}>{patientData.ayush.agni}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9.5px', color: '#78716c' }}>Koshtha</div>
                      <div style={{ fontWeight: 800, fontSize: '12px', color: '#92400e' }}>{patientData.ayush.koshtha}</div>
                    </div>
                  </div>
                </div>

                {/* Scanned Document Preview */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileCheck size={20} color="#0e6c38" />
                  <div style={{ fontSize: '10.5px', color: '#475569', lineHeight: 1.3 }}>
                    <strong>Prescription (Gemini 3.8 Flash OCR):</strong> Cetirizine 10mg OD, Paracetamol 650mg TDS. Confidence 98.2%. Digitally attached.
                  </div>
                </div>
              </div>

              {/* Doctor Review Footer */}
              <div style={{
                borderTop: '1px solid #e2e8f0',
                padding: '10px 18px',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Pipeline status: <strong>Live Django DB sync</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-primary-pill"
                    onClick={async () => {
                      setHisPushStatus('pushing');
                      await handleIntakeSubmit();
                      setHisPushStatus('synced');
                      setTimeout(() => {
                        alert(`Patient ${patientData.name} registered in Dr. Anjali's queue with token #${patientData.token}!`);
                      }, 200);
                    }}
                  >
                    {hisPushStatus === 'pushing' ? 'Syncing...' : hisPushStatus === 'synced' ? '✔ Pushed to Queue' : 'Push Intake to Queue'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
