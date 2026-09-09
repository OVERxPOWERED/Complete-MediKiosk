'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthStepper } from './AuthStepper';
import { NhaTrustBadge } from './NhaTrustBadge';

interface OtpVerifyCardProps {
  hprId: string;
  onNext: () => void;
  onBack: () => void;
}

export const OtpVerifyCard: React.FC<OtpVerifyCardProps> = ({
  onNext,
  onBack,
}) => {
  const [otp, setOtp] = useState<string[]>(['4', '2', '1', '9', '', '']);
  const [countdown, setCountdown] = useState<number>(24);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onNext();
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100">
      {/* Stepper matching Image 4 (1B): Step 1 completed, Step 2 active */}
      <AuthStepper currentStep={2} />

      {/* Heading & Subtitle */}
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
        Verify your identity
      </h2>
      <p className="text-slate-500 text-sm mb-7">
        Enter the 6-digit OTP sent to <span className="font-semibold text-slate-800">+91 ******4219</span>
      </p>

      {/* OTP Inputs */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46] transition-all"
            />
          ))}
        </div>

        {/* Resend & Change mobile row */}
        <div className="flex flex-col items-center gap-2 text-xs">
          <div className="text-slate-600 font-medium">
            {countdown > 0 ? (
              <span>Resend OTP in <strong className="text-[#065f46] font-bold">{countdown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={() => setCountdown(30)}
                className="text-[#065f46] font-bold hover:underline cursor-pointer"
              >
                Resend OTP Now
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-[#065f46] hover:text-[#044e39] font-medium underline cursor-pointer"
          >
            Change HPR ID / Mobile
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#065f46] hover:bg-[#044e39] active:bg-[#033c2c] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Verify &amp; Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* NHA ABDM Trust badge */}
      <NhaTrustBadge />
    </div>
  );
};
