'use client';

import React from 'react';
import { PatientRecord } from '@/types';
import { QrCode, Clock, ChevronRight, X } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface JustScannedCardProps {
  patient: PatientRecord | null;
  countdown: number;
  onClear: () => void;
}

export const JustScannedCard: React.FC<JustScannedCardProps> = ({
  patient,
  countdown,
  onClear,
}) => {
  const router = useRouter();

  if (!patient) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, '0');

  return (
    <div className="mb-6 rounded-2xl bg-blue-50/80 border border-blue-200/90 p-5 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-blue-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5">
              Just Scanned (1)
            </div>
            <div className="text-xs text-blue-700/90">
              Patient added via wristband QR scan. Click anywhere on this card to view summary.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Auto moves to queue in {minutes}:{seconds}</span>
          </div>
          <button
            onClick={onClear}
            className="p-1 rounded-full hover:bg-blue-200/50 text-blue-500 hover:text-blue-800 transition-colors cursor-pointer"
            title="Dismiss Just Scanned highlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 font-semibold border-b border-blue-200/40 pb-2">
              <th className="py-2 px-3 w-10">#</th>
              <th className="py-2 px-3">Patient</th>
              <th className="py-2 px-3">Token / UHID</th>
              <th className="py-2 px-3">Age / Gender</th>
              <th className="py-2 px-3">Chief Complaint</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Wait Time</th>
              <th className="py-2 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              onClick={() => router.push(`/patient/${patient.patient.queue_token}`)}
              className="hover:bg-blue-100/50 transition-colors group cursor-pointer"
            >
              <td className="py-3 px-3 font-semibold text-slate-700">
                {patient.queueNumber}
              </td>
              <td className="py-3 px-3">
                <Link
                  href={`/patient/${patient.patient.queue_token}`}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-blue-300 ring-2 ring-blue-400/40">
                    <img
                      src={patient.patient.photo_url}
                      alt={patient.patient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {patient.patient.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      UHID: {patient.patient.uhid}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="py-3 px-3 font-bold text-blue-900">
                {patient.patient.queue_token}
              </td>
              <td className="py-3 px-3 text-slate-700">
                {patient.patient.age} / {patient.patient.gender[0]}
              </td>
              <td className="py-3 px-3 font-medium text-slate-900">
                {patient.chief_complaint}
              </td>
              <td className="py-3 px-3">
                <StatusPill status={patient.status} />
              </td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-xs">
                  <Clock className="w-3 h-3 text-blue-600" />
                  Just now
                </span>
              </td>
              <td className="py-3 px-3 text-right">
                <Link
                  href={`/patient/${patient.patient.queue_token}`}
                  className="p-1 rounded hover:bg-blue-200 inline-flex text-slate-400 group-hover:text-blue-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
