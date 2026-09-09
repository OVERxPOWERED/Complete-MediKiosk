import React from 'react';
import { Clock, Headphones } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  currentTime: string;
  onHelpClick?: () => void;
  langCode?: 'en' | 'hi';
}

export const Header: React.FC<HeaderProps> = ({ 
  currentDate, 
  currentTime, 
  onHelpClick, 
  langCode = 'en' 
}) => {
  const isHi = langCode === 'hi';

  return (
    <header className="kiosk-header">
      <div className="header-brand">
        <svg className="medikiosk-cross-icon" viewBox="0 0 100 100" fill="none">
          <rect x="33" y="10" width="34" height="80" rx="17" fill="#22C55E" />
          <rect x="10" y="33" width="80" height="34" rx="17" fill="#22C55E" />
          <circle cx="50" cy="50" r="14" fill="#ffffff" />
          <ellipse cx="44" cy="46" rx="8" ry="6" transform="rotate(-30 44 46)" fill="#22C55E" />
          <ellipse cx="56" cy="54" rx="8" ry="6" transform="rotate(-30 56 54)" fill="#22C55E" />
        </svg>
        <div className="header-titles">
          <span className="header-name">MediKiosk</span>
          <span className="header-tagline">
            {isHi ? "स्वास्थ्य सेवा आपके निकट" : "Care Closer to You"}
          </span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-datetime">
          <Clock size={14} color="#168d4d" />
          <span>{currentDate} · {currentTime}</span>
        </div>
        <button 
          className="header-help-btn" 
          onClick={onHelpClick}
          aria-label={isHi ? "सहायता प्राप्त करें" : "Get Assistance"}
        >
          <Headphones size={13} />
          <span>{isHi ? "सहायता" : "Help"}</span>
        </button>
      </div>
    </header>
  );
};
