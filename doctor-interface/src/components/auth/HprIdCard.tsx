'use client';

import React, { useState } from 'react';
import { User, ArrowRight, Zap } from 'lucide-react';
import { AuthStepper } from './AuthStepper';
import { NhaTrustBadge } from './NhaTrustBadge';

interface HprIdCardProps {
  onNext: (hprId: string) => void;
  onQuickLogin: () => void;
}

export const HprIdCard: React.FC<HprIdCardProps> = ({ onNext, onQuickLogin }) => {
  const [hprId, setHprId] = useState<string>('HPR123456');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (hprId.trim()) {
      onNext(hprId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100">
      {/* 3-Step Progress Stepper (Requested by user for Screen 1A) */}
      <AuthStepper currentStep={1} />

      {/* Doctor Access Sub-tag */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-[#065f46] tracking-widest uppercase mb-3">
        <span className="w-4 h-0.5 bg-[#065f46] inline-block" />
        DOCTOR ACCESS
      </div>

      {/* Title & Subtitle */}
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
        Welcome Doctor
      </h2>
      <p className="text-slate-500 text-sm mb-7">
        Sign in with your HPR credentials to continue
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            HPR ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={hprId}
              onChange={(e) => setHprId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your HPR ID or registered username"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46] transition-all"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Your HPR ID is issued under the National Health Authority (ABDM).
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#065f46] hover:bg-[#044e39] active:bg-[#033c2c] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Send OTP</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Forgot HPR ID & Demo Bypass Button */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onQuickLogin}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#065f46] hover:text-[#044e39] bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-emerald-200/70"
            title="Bypass login and jump straight to the queue as Dr. Anjali Verma"
          >
            <Zap className="w-3.5 h-3.5 fill-[#065f46] text-[#065f46]" />
            <span>⚡ Quick Demo Login</span>
          </button>

          <button
            type="button"
            className="text-xs font-semibold text-[#065f46] hover:underline cursor-pointer"
          >
            Forgot HPR ID?
          </button>
        </div>
      </form>

      {/* Official NHA Trust Badge */}
      <NhaTrustBadge />
    </div>
  );
};
