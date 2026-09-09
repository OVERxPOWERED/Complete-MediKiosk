'use client';

import React, { useState } from 'react';
import { PatientRecord } from '@/types';
import { Check, Copy, Phone, MapPin, User, ShieldCheck } from 'lucide-react';

interface PatientDemographicsProps {
  patient: PatientRecord;
}

export const PatientDemographics: React.FC<PatientDemographicsProps> = ({ patient }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyUhid = () => {
    navigator.clipboard.writeText(patient.patient.uhid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 lg:p-6 mb-6 shadow-2xs">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Avatar + Name + Identifiers */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-200 shrink-0 shadow-xs">
            <img
              src={patient.patient.photo_url}
              alt={patient.patient.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {patient.patient.name}
            </h2>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {patient.patient.age} years · {patient.patient.gender}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-slate-200">
                <span>UHID: {patient.patient.uhid}</span>
                <button
                  onClick={handleCopyUhid}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                  title="Copy UHID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>

              {patient.patient.abha_id && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ABHA Linked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-xs text-slate-600 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800">{patient.patient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]" title={patient.patient.address || 'Bhopal, Madhya Pradesh'}>
              {patient.patient.address || 'Bhopal, Madhya Pradesh'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Attendant: <strong className="text-slate-800 font-semibold">{patient.patient.attendant || 'Self'}</strong></span>
          </div>
        </div>

        {/* Right: Emergency Contact Card */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[220px]">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Emergency Contact
          </div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">
            {patient.patient.emergency_contact.name} ({patient.patient.emergency_contact.relation})
          </div>
          <div className="flex items-center gap-1 text-xs text-teal-800 font-semibold mt-1">
            <Phone className="w-3 h-3 text-teal-700" />
            <span>{patient.patient.emergency_contact.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
