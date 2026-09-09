import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface CameraPipWidgetProps {
  stream?: MediaStream | null;
  className?: string;
  isHindi?: boolean;
}

export const CameraPipWidget: React.FC<CameraPipWidgetProps> = ({
  stream,
  className = '',
  isHindi = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`camera-pip-widget ${className}`}>
      <div className="camera-pip-status">
        <span className="camera-pip-dot" />
        <span className="camera-pip-label">{isHindi ? 'कैमरा चालू' : 'Camera On'}</span>
      </div>

      <div className="camera-pip-feed">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-pip-video"
          />
        ) : (
          <div className="camera-pip-placeholder">
            <div className="camera-pip-avatar" />
          </div>
        )}

        {/* Viewfinder corner reticles */}
        <div className="corner-reticle top-left" />
        <div className="corner-reticle top-right" />
        <div className="corner-reticle bottom-left" />
        <div className="corner-reticle bottom-right" />
      </div>

      <div className="camera-pip-badge">
        <span className="badge-check-icon">
          <Check size={11} strokeWidth={3} />
        </span>
        <span className="badge-text">{isHindi ? 'आप फ्रेम में हैं' : "You're in frame"}</span>
      </div>
    </div>
  );
};
