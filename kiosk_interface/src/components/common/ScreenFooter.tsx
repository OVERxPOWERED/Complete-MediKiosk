import React from 'react';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface ScreenFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideBack?: boolean;
  hideNext?: boolean;
  stepCurrent?: number;
  stepTotal?: number;
  stepTitle?: string;
  showHelpPill?: boolean;
  onHelpClick?: () => void;
  isHindi?: boolean;
}

export const ScreenFooter: React.FC<ScreenFooterProps> = ({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  hideBack = false,
  hideNext = false,
  stepCurrent,
  stepTotal,
  stepTitle,
  showHelpPill = true,
  onHelpClick,
  isHindi = false,
}) => {
  return (
    <footer className="screen-footer-container">
      {/* Navigation controls row */}
      <div className="footer-nav-row">
        {/* Left: Back button */}
        <div className="footer-left-col">
          {!hideBack && onBack && (
            <button
              className="footer-back-pill"
              onClick={onBack}
              aria-label={isHindi ? 'वापस जाएं' : 'Go back'}
            >
              <ArrowLeft size={16} />
              <span>{isHindi ? 'वापस' : 'Back'}</span>
            </button>
          )}
        </div>

        {/* Center: Step indicators */}
        <div className="footer-center-col">
          {stepCurrent && stepTotal ? (
            <div className="step-indicator-block">
              <div className="step-dots-row">
                {Array.from({ length: stepTotal }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`step-dot ${idx + 1 === stepCurrent ? 'active' : ''} ${
                      idx + 1 < stepCurrent ? 'completed' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="step-label">
                {isHindi ? `चरण ${stepCurrent} / ${stepTotal}` : `Step ${stepCurrent} of ${stepTotal}`}
              </div>
              {stepTitle && <div className="step-title">{stepTitle}</div>}
            </div>
          ) : null}
        </div>

        {/* Right: Action button or Help pill */}
        <div className="footer-right-col">
          {!hideNext && onNext ? (
            <button
              className="footer-primary-pill"
              onClick={onNext}
              disabled={nextDisabled}
            >
              <span>{nextLabel}</span>
              <ArrowRight size={18} />
            </button>
          ) : showHelpPill ? (
            <button className="footer-help-pill" onClick={onHelpClick}>
              <HelpCircle size={18} />
              <div className="help-pill-texts">
                <span className="help-title">{isHindi ? 'सहायता चाहिए?' : 'Need help?'}</span>
                <span className="help-sub">{isHindi ? 'मुझसे पूछें या टैप करें' : 'Talk to me or tap here'}</span>
              </div>
            </button>
          ) : null}
        </div>
      </div>

      {/* Bottom hospital branding banner */}
      <div className="footer-branding-banner">
        <div className="branding-left">
          <svg className="branding-leaf-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C8 3 4 8 4 14C4 18 7 21 12 21C17 21 20 18 20 14C20 8 16 3 12 3Z"
              fill="#10B981"
              opacity="0.25"
            />
            <path
              d="M12 5C9 8 7 12 8 16C9 18 10 19 12 20C14 19 15 18 16 16C17 12 15 8 12 5Z"
              fill="#059669"
            />
            <path d="M12 21V10" stroke="#004D40" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="branding-names">
            <span className="branding-headline">Healthier People</span>
            <span className="branding-tagline">Brighter Tomorrows</span>
          </div>
        </div>

        <div className="branding-right">
          <span className="community-tag">A smarter tomorrow for healthier communities</span>
          <span className="teal-accent-line" />
        </div>
      </div>
    </footer>
  );
};
