'use client';

import React from 'react';
import { QrCode, Users, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface EmptyQueueViewProps {
  onScanClick: () => void;
  onResetPatients?: () => void;
}

export const EmptyQueueView: React.FC<EmptyQueueViewProps> = ({
  onScanClick,
  onResetPatients,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 lg:p-14 flex flex-col items-center text-center shadow-2xs">
      {/* Clinic illustration */}
      <div className="w-56 h-36 mb-6 text-teal-800/80">
        <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Wall Clock */}
          <circle cx="170" cy="30" r="14" fill="#f0fdf4" stroke="#059669" strokeWidth="2" />
          <path d="M170 22v8l5 3" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />

          {/* Plant */}
          <path d="M35 85c-10-20-5-40 5-45 5 15 5 35-5 45z" fill="#10b981" fillOpacity="0.4" />
          <path d="M38 85c10-20 5-40-5-45-5 15-5 35 5 45z" fill="#065f46" fillOpacity="0.3" />
          <path d="M28 85h20l-4 15h-12z" fill="#94a3b8" />

          {/* Clinic Chairs */}
          <rect x="70" y="65" width="30" height="32" rx="4" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
          <rect x="105" y="65" width="30" height="32" rx="4" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
          <rect x="140" y="65" width="30" height="32" rx="4" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
          <path d="M65 97h110M78 97v15M112 97v15M148 97v15M167 97v15" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
        No patients in queue
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        All caught up! There are currently no patients waiting at your desk.
      </p>

      {/* 3 Action Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <button
          onClick={onScanClick}
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 transition-all text-left cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                Scan Patient QR
              </div>
              <div className="text-[11px] text-slate-500">
                Scan wristband to add patient
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={onResetPatients}
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 transition-all text-left cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                View All Patients
              </div>
              <div className="text-[11px] text-slate-500">
                Reset or load queue patients
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
        </button>

        <Link
          href="/settings"
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 transition-all text-left group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                Check Settings
              </div>
              <div className="text-[11px] text-slate-500">
                Manage your OPD preferences
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
};
