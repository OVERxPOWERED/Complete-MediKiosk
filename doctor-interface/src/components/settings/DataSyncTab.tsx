'use client';

import React, { useState } from 'react';
import { SyncAction } from '@/types';
import {
  Cloud,
  RefreshCw,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Check,
  RotateCw,
  MoreVertical,
  ArrowRight,
  Info,
} from 'lucide-react';

interface DataSyncTabProps {
  syncActions: SyncAction[];
  isOnline: boolean;
  onSyncNow: () => void;
  onToggleOnline: () => void;
}

export const DataSyncTab: React.FC<DataSyncTabProps> = ({
  syncActions,
  isOnline,
  onSyncNow,
  onToggleOnline,
}) => {
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);
  const pendingActions = syncActions.filter((s) => s.status === 'Pending');
  const syncedActions = syncActions.filter((s) => s.status === 'Synced');
  const displayedSynced = showAllHistory ? syncedActions : syncedActions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Sync Status Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Cloud className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    pendingActions.length > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {pendingActions.length} actions pending sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isOnline
                  ? 'Connected to Hospital Information System (HIS) API gateway.'
                  : 'Actions are cached in local browser storage and will synchronize when connection restores.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={onToggleOnline}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Simulate {isOnline ? 'Offline' : 'Online'}
            </button>

            <button
              onClick={onSyncNow}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync now
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Workstation: Tables on Left, Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Actions & Recent Sync History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pending Sync Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Pending Sync ({pendingActions.length})
                </h3>
              </div>

              {pendingActions.length > 0 && (
                <button
                  onClick={onSyncNow}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Retry All
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              These actions are saved locally and will be pushed to HIS.
            </p>

            {pendingActions.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                All consultation records and summaries are in sync with HIS.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Patient / UHID</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingActions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">
                            {item.patient_token}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {item.uhid}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {item.action_type}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {item.timestamp}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={onSyncNow}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3 text-slate-400" />
                              Retry
                            </button>
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Sync History Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-800">
                  Recent Sync History
                </h3>
              </div>

              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                {showAllHistory ? 'Show Less' : 'View All'}
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showAllHistory ? 'rotate-90' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {showAllHistory ? `Showing all ${syncedActions.length} sync events.` : 'Last 4 sync events.'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Patient / UHID</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedSynced.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          {item.patient_token}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {item.uhid}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {item.action_type}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Synced
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: About Sync & Storage Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* About Sync Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Info className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold">About Sync</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consultation data is automatically saved offline and synced with the hospital server when a connection is available.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Patient summaries</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Consultation outcomes</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Prescriptions and advice</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Attachments and notes</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Your data is safe. It will sync automatically when you&apos;re back online.
              </span>
            </div>
          </div>

          {/* Storage & App Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <HardDrive className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold">Storage &amp; App Information</h3>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Local Data Usage</span>
                <span className="text-slate-400">1 GB limit</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[12%]" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>124 MB used</span>
                <span>876 MB free</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Offline data is encrypted and stored securely on this device.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">App Version</span>
                <span className="font-semibold text-slate-800">
                  v1.0.0 <span className="text-emerald-700 font-bold ml-1">✓ Up to date</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-semibold text-slate-800">28 Aug 2026, 06:12 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
