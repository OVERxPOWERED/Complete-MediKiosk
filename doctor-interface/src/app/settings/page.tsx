'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AccountWorkspaceTab } from '@/components/settings/AccountWorkspaceTab';
import { ClinicalWorkflowTab } from '@/components/settings/ClinicalWorkflowTab';
import { DataSyncTab } from '@/components/settings/DataSyncTab';
import { User, SlidersHorizontal, Cloud, RefreshCw } from 'lucide-react';

type SettingsTab = 'account' | 'workflow' | 'sync';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const {
    doctor,
    currentWorkspace,
    setWorkspace,
    settings,
    updateSettings,
    syncActions,
    isOnline,
    toggleOnlineStatus,
    syncNow,
  } = useApp();

  const pendingCount = syncActions.filter((s) => s.status === 'Pending').length;

  return (
    <div className="min-h-screen pb-24 pt-2">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your account, clinical preferences, and sync settings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {isOnline ? 'Online' : 'Offline'}
            </span>

            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                <span>{pendingCount} pending sync</span>
                <RefreshCw className="w-3 h-3 text-amber-600 animate-spin-slow" />
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 max-w-xl">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account &amp; Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Clinical &amp; Workflow</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Data &amp; Sync</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <AccountWorkspaceTab
            doctor={doctor}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={setWorkspace}
          />
        )}

        {activeTab === 'workflow' && (
          <ClinicalWorkflowTab
            showAyushDefault={settings.showAyushDefault}
            onToggleAyush={(val) => updateSettings({ showAyushDefault: val })}
            pinnedSpecialists={settings.pinnedSpecialists}
            onUpdateSpecialists={(specs) => updateSettings({ pinnedSpecialists: specs })}
            highlightAbnormalVitals={settings.highlightAbnormalVitals}
            onToggleHighlightVitals={(val) =>
              updateSettings({ highlightAbnormalVitals: val })
            }
            confirmBeforePush={settings.confirmBeforePush}
            onToggleConfirmPush={(val) => updateSettings({ confirmBeforePush: val })}
          />
        )}

        {activeTab === 'sync' && (
          <DataSyncTab
            syncActions={syncActions}
            isOnline={isOnline}
            onSyncNow={syncNow}
            onToggleOnline={toggleOnlineStatus}
          />
        )}
      </div>

      {/* Persistent Settings Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Last synced: Today, 11:38 AM</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {pendingCount} actions pending sync
            </span>
            <button
              onClick={syncNow}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              Sync now
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>App Version v1.0.0</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
