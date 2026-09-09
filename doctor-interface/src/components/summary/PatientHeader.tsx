'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PatientRecord } from '@/types';

interface PatientHeaderProps {
  patient: PatientRecord;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({ patient }) => {
  const isReviewed = patient.status === 'Reviewed';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Back button & Page Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/queue"
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-white hover:bg-teal-50 px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Queue</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Summary
          </h1>
          <p className="text-xs text-slate-500">
            Review the patient information collected from MediKiosk.
          </p>
        </div>
      </div>

      {/* Status & Token Badges */}
      <div className="flex items-center gap-3">
        {/* Status Pill Card */}
        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-right shadow-2xs">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Status
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            {isReviewed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Reviewed
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                New
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isReviewed ? `Pushed to HIS at ${patient.reviewedAt || '10:28 AM'}` : `Arrived at ${patient.arrivedAt}`}
          </div>
        </div>

        {/* Token Number Card */}
        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-right shadow-2xs min-w-[90px]">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Token No
          </div>
          <div className="text-xl font-extrabold text-slate-900 leading-tight">
            {patient.patient.queue_token}
          </div>
        </div>
      </div>
    </div>
  );
};
