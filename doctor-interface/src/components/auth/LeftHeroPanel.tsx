'use client';

import React from 'react';
import { Activity, Users } from 'lucide-react';

export const LeftHeroPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-[42%] relative bg-gradient-to-br from-[#e8f5f0] via-[#f2faf7] to-[#ffffff] text-slate-800 p-10 xl:p-14 flex-col justify-between overflow-hidden border-r border-[#d6e5df]">
      {/* Background Graphic elements: Subtle medical curves & glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-24 w-[480px] h-[480px] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-20 right-0 w-[420px] h-[420px] rounded-full bg-teal-100/60 blur-3xl" />
        {/* Curved decorative wave line */}
        <svg
          className="absolute right-0 top-0 h-full w-48 text-white/70"
          viewBox="0 0 100 800"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0 C60,200 80,400 30,600 C0,720 10,800 50,800 L100,800 L100,0 Z" />
        </svg>
      </div>

      {/* Top Brand Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-300">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              MediKiosk
            </div>
            <div className="text-xs text-teal-800 font-semibold tracking-wide">
              Care Closer to You
            </div>
          </div>
        </div>
      </div>

      {/* Center Hero Copy - Harmonized across all login steps */}
      <div className="relative z-10 my-auto py-8">
        <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-3">
          Smarter
          <span className="block text-slate-900">Patient Insights.</span>
          <span className="block text-[#065f46]">Faster Care.</span>
        </h1>
        <p className="text-slate-600 text-sm xl:text-base leading-relaxed mb-8 max-w-sm">
          Kiosk-powered summaries. More time for what matters.
        </p>

        {/* 2 Benefit Cards matching 1A reference image */}
        <div className="space-y-3.5 max-w-sm">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-emerald-100 shadow-2xs backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#065f46] flex items-center justify-center shrink-0 border border-emerald-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Prepared Patients</div>
              <div className="text-xs text-slate-500">Structured, reliable information</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-emerald-100 shadow-2xs backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#065f46] flex items-center justify-center shrink-0 border border-emerald-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Smoother Consultations</div>
              <div className="text-xs text-slate-500">Focus on care, not paperwork</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tagline with Botanical Graphic */}
      <div className="relative z-10 pt-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 2L12 22M12 12C16 8 20 8 20 12C20 16 16 16 12 12ZM12 12C8 8 4 8 4 12C4 16 8 16 12 12Z" />
          </svg>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-800 block">A healthier today.</span>
          <span className="text-xs text-slate-500 block">A brighter tomorrow.</span>
        </div>
      </div>
    </div>
  );
};
