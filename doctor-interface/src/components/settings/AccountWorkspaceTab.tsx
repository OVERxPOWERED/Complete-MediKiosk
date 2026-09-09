'use client';

import React from 'react';
import { DoctorProfile } from '@/types';
import {
  Lock,
  Building2,
  CheckCircle2,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import Image from 'next/image';

interface AccountWorkspaceTabProps {
  doctor: DoctorProfile | null;
  currentWorkspace: { department: string; desk: string; hospital: string };
  onWorkspaceChange: (ws: { department: string; desk: string; hospital: string }) => void;
}

export const AccountWorkspaceTab: React.FC<AccountWorkspaceTabProps> = ({
  doctor,
  currentWorkspace,
  onWorkspaceChange,
}) => {
  const workspaces = [
    { department: 'General Medicine OPD', desk: 'Desk 4', hospital: 'District Hospital, Bhopal' },
    { department: 'General Medicine OPD', desk: 'Desk 2', hospital: 'District Hospital, Bhopal' },
    { department: 'Emergency Medicine', desk: 'Desk 1', hospital: 'District Hospital, Bhopal' },
    { department: 'Cardiology OPD', desk: 'Desk 3', hospital: 'District Hospital, Bhopal' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Profile & Account Information */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Profile &amp; Account Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your account details are managed by the hospital administration and ABDM.
          </p>
        </div>

        {/* Doctor Identity Header */}
        <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
          <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-emerald-600/30 flex-shrink-0">
            <Image
              src="/doctor-avatar.jpg"
              alt="Dr. Anjali Verma"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800">
              {doctor?.name || 'Dr. Anjali Verma'}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {doctor?.degrees || 'MBBS, MD (Internal Medicine)'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {doctor?.designation || 'Consultant'} – {doctor?.department || 'General Medicine'}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified via ABDM
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields (Read-only ABDM synced) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              HPR ID
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-mono">
              <span>{doctor?.hpr_id || 'HPR123456'}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sourced from HPR portal. Cannot be edited.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Full Name
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold">
              <span>{doctor?.name || 'Dr. Anjali Verma'}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Department
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs">
              <span>{doctor?.department || 'General Medicine'}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Assigned by hospital administration.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Designation
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs">
              <span>{doctor?.designation || 'Consultant'}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              OPD
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs">
              <span>General Medicine OPD</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email (Official)
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-mono">
              <span>{doctor?.email || 'anjali.verma@bhopalhosp.gov.in'}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mobile Number (Official)
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-mono">
              <span>{doctor?.phone || '+91 98765 43210'}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Account Status
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs">
              <span className="font-semibold text-emerald-700">Active</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Workspace Information & Switcher */}
      <div className="lg:col-span-5 space-y-6">
        {/* Workspace Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-800">
            Workspace Information
          </h3>

          <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {currentWorkspace.hospital}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                E-102, Arera Colony, Bhopal, Madhya Pradesh - 462016
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs space-y-3">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Current OPD</span>
              <span className="font-semibold text-slate-800">{currentWorkspace.department}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Current Desk</span>
              <span className="font-semibold text-slate-800">{currentWorkspace.desk}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Timings</span>
              <span className="font-semibold text-slate-800">09:00 AM – 04:00 PM</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Session Date</span>
              <span className="font-semibold text-slate-800">03 Sep 2026</span>
            </div>
          </div>
        </div>

        {/* Switch Workspace */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold">Switch Workspace</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            If you are assigned to multiple OPDs, you can switch your current workspace.
          </p>

          <div>
            <select
              value={`${currentWorkspace.department} – ${currentWorkspace.desk}`}
              onChange={(e) => {
                const val = e.target.value;
                const found = workspaces.find((w) => `${w.department} – ${w.desk}` === val);
                if (found) onWorkspaceChange(found);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {workspaces.map((ws, idx) => (
                <option key={idx} value={`${ws.department} – ${ws.desk}`}>
                  {ws.department} – {ws.desk}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Workspace assignments are managed by the hospital administration.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
