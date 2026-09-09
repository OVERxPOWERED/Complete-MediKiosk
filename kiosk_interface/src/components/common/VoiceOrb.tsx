import React from 'react';
import { motion } from 'framer-motion';

interface VoiceOrbProps {
  speechTitle?: string;
  speechSubtitle?: string;
  leftScriptNote?: string;
  rightScriptNote?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  onOrbClick?: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  speechTitle,
  speechSubtitle,
  leftScriptNote = 'Same Care Every Visit',
  rightScriptNote = 'Your Health Journey Our Support',
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onOrbClick,
}) => {
  // Determine orb image variant based on state
  const orbImageSrc = isListening
    ? '/assets/orb_listening.png'
    : isProcessing
    ? '/assets/orb_leaves.png'
    : '/assets/orb_welcome.png';

  return (
    <section className="voice-orb-hero-section">
      <div className="voice-orb-stage">
        {/* Left Handwritten Script Note */}
        {leftScriptNote && (
          <div className="handwritten-note-left">
            <span>{leftScriptNote}</span>
            <svg className="curved-underline" viewBox="0 0 100 20" fill="none">
              <path d="M5 12C30 18 70 18 95 10" stroke="#00796B" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* Right Handwritten Script Note */}
        {rightScriptNote && (
          <div className="handwritten-note-right">
            <span>{rightScriptNote}</span>
            <svg className="curved-underline" viewBox="0 0 100 20" fill="none">
              <path d="M5 10C35 16 65 16 95 8" stroke="#00796B" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* Concentric Pulsating Soundwave Rings */}
        <div className="orb-rings-container">
          <div className={`orb-ring orb-ring-1 ${isListening ? 'active-listen' : isSpeaking ? 'active-speak' : ''}`} />
          <div className={`orb-ring orb-ring-2 ${isSpeaking ? 'active-speak' : ''}`} />
          <div className={`orb-ring orb-ring-3 ${isListening ? 'active-listen' : ''}`} />
        </div>

        {/* Floating Leaves */}
        <img
          src="/assets/sprout_icon.png"
          alt="Plant Leaf"
          className="floating-leaf floating-leaf-left"
        />
        <img
          src="/assets/sprout_icon.png"
          alt="Plant Leaf"
          className="floating-leaf floating-leaf-right"
        />

        {/* The Glowing Cloud Voice Orb Core */}
        <div
          className={`voice-orb-glow ${isListening ? 'listening-pulse' : isSpeaking ? 'speaking-pulse' : ''}`}
          onClick={onOrbClick}
          role="button"
          tabIndex={0}
          title="Tap to speak or listen"
        >
          <img
            src={orbImageSrc}
            alt="MediKiosk Voice Orb"
            className="voice-orb-img"
          />
        </div>

        {/* Mascot Speech Bubble pointing up to the Orb */}
        {(speechTitle || speechSubtitle) && (
          <motion.div
            className="orb-speech-bubble"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="speech-bubble-tail" />
            <div className="speech-bubble-content">
              {/* Green Equalizer Audio Waves Icon */}
              <div className="bubble-equalizer-badge">
                <span className={`eq-bar eq-bar-1 ${isSpeaking ? 'animating' : ''}`} />
                <span className={`eq-bar eq-bar-2 ${isSpeaking ? 'animating' : ''}`} />
                <span className={`eq-bar eq-bar-3 ${isSpeaking ? 'animating' : ''}`} />
                <span className={`eq-bar eq-bar-4 ${isSpeaking ? 'animating' : ''}`} />
              </div>

              <div className="bubble-texts">
                {speechTitle && <h2 className="bubble-title">{speechTitle}</h2>}
                {speechSubtitle && <p className="bubble-subtitle">{speechSubtitle}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
