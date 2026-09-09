import React from 'react';
import { Volume2, Mic, Sparkles } from 'lucide-react';

interface DualCaptionsProps {
  medikioskText: string;
  youText: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
}

export const DualCaptions: React.FC<DualCaptionsProps> = ({
  medikioskText,
  youText,
  isSpeaking = false,
  isListening = false,
  isProcessing = false,
}) => {
  return (
    <div className="dual-captions-bar">
      {/* Left: MediKiosk Spoken Prompt */}
      <div className={`caption-box ${isSpeaking ? 'active-speaking-card' : ''}`}>
        <div className={`caption-icon-circle ${isSpeaking ? 'active-speaker pulse-speaking' : ''}`}>
          {isProcessing ? <Sparkles size={16} className="spin-sparkle" /> : <Volume2 size={16} />}
        </div>
        <div className="caption-texts">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="caption-author-tag">MediKiosk</span>
            {isSpeaking && <span style={{ fontSize: '9.5px', color: '#0e6c38', fontWeight: 800 }}>● Speaking</span>}
          </div>
          <span className="caption-line-text" title={medikioskText}>
            {medikioskText}
          </span>
        </div>
      </div>

      {/* Right: Patient Mic / Understood Text */}
      <div className={`caption-box ${isListening ? 'active-listening-card' : ''}`}>
        <div className={`caption-icon-circle ${isListening ? 'active-mic pulse-mic' : ''}`}>
          <Mic size={16} />
        </div>
        <div className="caption-texts">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="caption-author-tag">You (Voice or Touch)</span>
            {isListening && <span style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 800 }}>● Listening</span>}
          </div>
          <span className="caption-line-text" title={youText}>
            {youText}
          </span>
        </div>
      </div>
    </div>
  );
};
