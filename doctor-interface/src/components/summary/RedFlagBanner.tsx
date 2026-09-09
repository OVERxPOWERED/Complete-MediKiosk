'use client';

import React from 'react';
import { RedFlag, PatientStatus } from '@/types';
import { AlertTriangle, CheckCircle2, History } from 'lucide-react';

interface RedFlagBannerProps {
  redFlags: RedFlag[];
  status: PatientStatus;
  reviewedAt?: string;
  onOpenAuditTrail: () => void;
}

export const RedFlagBanner: React.FC<RedFlagBannerProps> = ({
  redFlags,
  status,
  reviewedAt,
  onOpenAuditTrail,
}) => {
  const isReviewed = status === 'Reviewed';

  // If patient has been reviewed, display the green "Summary Pushed to HIS" confirmation with Audit Trail
  if (isReviewed) {
    return (
      <div className="mb-6 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-xs font-bold text-emerald-950">
              Summary Pushed to HIS
            </span>
            <span className="text-xs text-emerald-800">
              Reviewed by Dr. Anjali Verma at {reviewedAt || '10:28 AM, 03 Sep 2026'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAuditTrail}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          <History className="w-3.5 h-3.5 text-emerald-700" />
          <span>View Audit Trail</span>
        </button>
      </div>
    );
  }

  // If not reviewed, display red flag if present
  if (redFlags.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl bg-red-50/90 border border-red-200/90 px-4 py-3 flex items-center gap-3 shadow-2xs">
      <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 fill-red-500 text-white" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
        <span className="font-extrabold text-red-900">
          Needs Attention
        </span>
        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-red-800 font-medium">
          {redFlags[0].symptom}
        </span>
      </div>
    </div>
  );
};
