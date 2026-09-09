'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const NhaTrustBadge: React.FC = () => {
  return (
    <div className="mt-8 p-3.5 sm:p-4 rounded-2xl bg-[#f0f5f3]/80 border border-[#d6e5df] flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Official NHA Logo */}
        <div className="h-10 w-28 shrink-0 flex items-center">
          <img
            src="/nha-logo.svg"
            alt="National Health Authority"
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="h-8 w-px bg-slate-200 shrink-0" />

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-slate-800 leading-tight">
            Verified healthcare professional access
          </span>
          <span className="text-[11px] text-slate-600 leading-tight mt-0.5">
            Part of India&apos;s Digital Health Mission
          </span>
          <span className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
            Authenticated via Healthcare Professionals Registry (HPR)
          </span>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-5 h-5" />
      </div>
    </div>
  );
};
