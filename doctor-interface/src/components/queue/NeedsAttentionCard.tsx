'use client';

import React from 'react';
import { PatientRecord } from '@/types';
import { AlertTriangle, ChevronRight, Activity, Thermometer, Heart } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NeedsAttentionCardProps {
  patients: PatientRecord[];
}

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({ patients }) => {
  const router = useRouter();

  // Only show patients with red flags that are not yet reviewed or have active alerts
  const alertPatients = patients.filter(
    (p) => p.red_flags && p.red_flags.length > 0 && p.status === 'New'
  );

  if (alertPatients.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl bg-red-50/70 border border-red-200/80 p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-red-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 fill-red-500 text-white" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-red-900 flex items-center gap-1.5">
              Needs Attention ({alertPatients.length})
            </div>
            <div className="text-xs text-red-700/90">
              Patients with critical vitals or high-risk indicators. Shown for your awareness.
            </div>
          </div>
        </div>

        <div className="text-[11px] font-medium text-red-700 bg-red-100/80 px-3 py-1 rounded-full border border-red-200 self-start sm:self-auto">
          These patients remain in their original queue order.
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 font-semibold border-b border-red-200/40 pb-2">
              <th className="py-2 px-3 w-10">#</th>
              <th className="py-2 px-3">Patient</th>
              <th className="py-2 px-3">Token / UHID</th>
              <th className="py-2 px-3">Age / Gender</th>
              <th className="py-2 px-3">Chief Complaint / Indicators</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Wait Time</th>
              <th className="py-2 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {alertPatients.map((p) => (
              <tr
                key={p.patient.queue_token}
                onClick={() => router.push(`/patient/${p.patient.queue_token}`)}
                className="hover:bg-red-100/50 transition-colors group cursor-pointer"
              >
                <td className="py-3 px-3 font-semibold text-slate-700">
                  {p.queueNumber}
                </td>
                <td className="py-3 px-3">
                  <Link
                    href={`/patient/${p.patient.queue_token}`}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      <img
                        src={p.patient.photo_url}
                        alt={p.patient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-red-900 transition-colors">
                        {p.patient.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        UHID: {p.patient.uhid}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  {p.patient.queue_token}
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {p.patient.age} / {p.patient.gender[0]}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-900 mb-1">
                    {p.chief_complaint}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.red_flags.map((rf, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          rf.badgeType === 'gray'
                            ? 'bg-slate-200/80 text-slate-700'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {rf.badgeLabel?.includes('BP') ? (
                          <Activity className="w-3 h-3" />
                        ) : rf.badgeLabel?.includes('Fever') ? (
                          <Thermometer className="w-3 h-3" />
                        ) : (
                          <Heart className="w-3 h-3" />
                        )}
                        {rf.badgeLabel || rf.symptom}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="py-3 px-3 text-slate-600 font-medium">
                  {p.waitTime}
                </td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/patient/${p.patient.queue_token}`}
                    className="p-1 rounded hover:bg-red-200/60 inline-flex text-slate-400 group-hover:text-red-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
