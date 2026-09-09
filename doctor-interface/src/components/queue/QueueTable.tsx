'use client';

import React from 'react';
import { PatientRecord } from '@/types';
import { ChevronRight, RefreshCw, ChevronLeft, Users } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QueueTableProps {
  patients: PatientRecord[];
}

export const QueueTable: React.FC<QueueTableProps> = ({ patients }) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Section Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-800" />
          <h2 className="text-sm font-bold text-slate-900">
            Queue ({patients.length})
          </h2>
          <span className="text-xs text-slate-400">· Patients in order of arrival</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Token / UHID</th>
              <th className="py-3 px-4">Age / Gender</th>
              <th className="py-3 px-4">Chief Complaint</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Wait Time</th>
              <th className="py-3 px-4 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p, idx) => (
              <tr
                key={p.patient.queue_token}
                onClick={() => router.push(`/patient/${p.patient.queue_token}`)}
                className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
              >
                <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                  {idx + 1}
                </td>
                <td className="py-3.5 px-4">
                  <Link
                    href={`/patient/${p.patient.queue_token}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      <img
                        src={p.patient.photo_url}
                        alt={p.patient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {p.patient.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        UHID: {p.patient.uhid}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {p.patient.queue_token}
                </td>
                <td className="py-3.5 px-4 text-slate-700">
                  {p.patient.age} / {p.patient.gender[0]}
                </td>
                <td className="py-3.5 px-4 text-slate-800 font-medium max-w-xs truncate">
                  {p.chief_complaint}
                </td>
                <td className="py-3.5 px-4">
                  <StatusPill status={p.status} />
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {p.waitTime}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Link
                    href={`/patient/${p.patient.queue_token}`}
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 inline-flex text-slate-400 group-hover:text-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Last updated: 09:14 AM</span>
          <span className="text-slate-300">·</span>
          <span>Auto-refreshing every 30 seconds</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Showing {patients.length} of {patients.length} patients</span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="p-1 rounded border border-slate-200 bg-white text-slate-300 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 rounded bg-teal-800 text-white font-bold text-xs">
              1
            </span>
            <button className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
