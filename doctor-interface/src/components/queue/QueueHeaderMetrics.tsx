'use client';

import React from 'react';
import { Users, QrCode, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface QueueHeaderMetricsProps {
  onScanClick: () => void;
  waitingCount: number;
}

export const QueueHeaderMetrics: React.FC<QueueHeaderMetricsProps> = ({
  onScanClick,
  waitingCount,
}) => {
  const { doctor, currentWorkspace } = useApp();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Good Morning, {doctor?.name ? doctor.name.split(' ')[0] + ' ' + doctor.name.split(' ')[1] : 'Dr. Anjali'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s your patient queue for {currentWorkspace.department}.
        </p>
      </div>

      {/* Metrics & Action Button */}
      <div className="flex items-center gap-3">
        {/* Waiting Count Card */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-teal-50/80 border border-teal-200/70 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-teal-950 leading-none">
              {waitingCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">
              Patients Waiting
            </span>
          </div>
        </div>

        {/* Scan Patient QR CTA */}
        <button
          onClick={onScanClick}
          className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group border border-teal-700"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1">
              Scan Patient QR
              <ChevronRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="text-[10px] text-teal-200/90 leading-tight mt-0.5">
              Scan wristband to add patient
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
