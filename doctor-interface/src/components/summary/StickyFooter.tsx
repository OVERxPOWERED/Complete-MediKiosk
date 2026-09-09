'use client';

import React from 'react';
import { PatientStatus } from '@/types';
import { RefreshCw, Edit3, Check, FileCheck, ArrowRight } from 'lucide-react';

interface StickyFooterProps {
  status: PatientStatus;
  onEditSummary: () => void;
  onConfirmPush: () => void;
  onRecordOutcome: () => void;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  status,
  onEditSummary,
  onConfirmPush,
  onRecordOutcome,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-60 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3.5 px-4 sm:px-8 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Sync / Refresh Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
          <span>Last updated: 09:14 AM</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">Auto-refreshed 30 seconds ago</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Edit Summary Button - Always Available */}
          <button
            onClick={onEditSummary}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:border-slate-400 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Summary</span>
          </button>

          {/* Primary Action Button based on Status */}
          {status === 'New' ? (
            <button
              onClick={onConfirmPush}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
              <span>Confirm & Push to HIS</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={onRecordOutcome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-sm font-semibold shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-teal-200" />
              <span>Record Outcome</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
