'use client';

import React, { useState } from 'react';
import { Building2, Monitor, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthStepper } from './AuthStepper';
import { NhaTrustBadge } from './NhaTrustBadge';

interface CounterSelectCardProps {
  onComplete: (department: string, desk: string) => void;
  onBack: () => void;
}

export const CounterSelectCard: React.FC<CounterSelectCardProps> = ({
  onComplete,
  onBack,
}) => {
  const [department, setDepartment] = useState<string>('General Medicine OPD');
  const [desk, setDesk] = useState<string>('OPD Desk 4');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onComplete(department, desk);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100"
    >
      {/* Stepper with Step 1 and 2 completed */}
      <AuthStepper currentStep={3} />

      {/* Heading & Subtitle */}
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
        Where are you working today?
      </h2>
      <p className="text-slate-500 text-sm mb-7">
        Select your department and counter to view the relevant patient queue.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Department Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Department
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4 text-emerald-700" />
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46] transition-all cursor-pointer"
            >
              <option value="General Medicine OPD">General Medicine OPD</option>
              <option value="Ayurveda &amp; AYUSH OPD">Ayurveda &amp; AYUSH OPD</option>
              <option value="Cardiology Referral OPD">Cardiology Referral OPD</option>
            </select>
          </div>
        </div>

        {/* Counter / Desk Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Counter / Desk
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Monitor className="w-4 h-4 text-emerald-700" />
            </div>
            <select
              value={desk}
              onChange={(e) => setDesk(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#065f46]/20 focus:border-[#065f46] transition-all cursor-pointer"
            >
              <option value="OPD Desk 4">OPD Desk 4</option>
              <option value="OPD Desk 2">OPD Desk 2</option>
              <option value="OPD Counter 1">OPD Counter 1</option>
            </select>
          </div>
        </div>

        {/* Today's Session Card */}
        <div className="p-4 rounded-2xl bg-[#f0f5f3]/80 border border-[#d6e5df] flex items-start gap-3">
          <Calendar className="w-4 h-4 text-[#065f46] mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-slate-500">Today&apos;s session</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">
              {department} · {desk}
            </span>
            <span className="text-[11px] text-slate-600">Thu, 3 Sep 2026</span>
            <span className="text-[10px] text-slate-500 mt-1">
              Your queue will show patients assigned to this OPD session.
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#065f46] hover:bg-[#044e39] active:bg-[#033c2c] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Continue to Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Back Link */}
        <div className="text-left pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 hover:text-[#065f46] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Verify OTP
          </button>
        </div>
      </form>

      {/* NHA ABDM Trust badge */}
      <NhaTrustBadge />
    </div>
  );
};
