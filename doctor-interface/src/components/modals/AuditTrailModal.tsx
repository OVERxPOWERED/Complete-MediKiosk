'use client';

import React from 'react';
import { PatientRecord } from '@/types';
import { X, History, CheckCircle2, ShieldCheck, Clock, Server, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  if (!isOpen) return null;

  const timelineEvents = [
    {
      time: patient.consultation_outcome?.recorded_at || '11:42 AM, 03 Sep 2026',
      title: 'Consultation Outcome Recorded & Synced',
      actor: `Dr. Anjali Verma (HPR123456)`,
      details: `Outcome type: ${patient.consultation_outcome?.outcome_type || 'Treated & Discharged'}. Pushed to HIS and pharmacy queue.`,
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      time: patient.reviewedAt || '10:28 AM, 03 Sep 2026',
      title: 'Pre-consultation Summary Confirmed & Pushed to HIS',
      actor: 'Dr. Anjali Verma (HPR123456)',
      details: 'Physician validated clinical history, verified vitals readings, and signed draft.',
      icon: ShieldCheck,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      time: '09:14 AM, 03 Sep 2026',
      title: 'Clinical Summary Structured & Routed to OPD Desk 4',
      actor: 'MediKiosk Engine (v2.4.1)',
      details: `Structured pre-consultation summary generated and queued for Token ${patient.patient.queue_token}.`,
      icon: Server,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      time: '09:12 AM, 03 Sep 2026',
      title: 'Hardware Sensor Readings Captured & Locked',
      actor: 'MediKiosk Sensor Suite',
      details: `BP: ${patient.vitals.blood_pressure.value}, Pulse: ${patient.vitals.pulse.value}, SpO2: ${patient.vitals.spo2.value}, Temp: ${patient.vitals.temperature.value}. Immutable record generated.`,
      icon: Monitor,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      time: '09:10 AM, 03 Sep 2026',
      title: 'Self-Reported History & Document Scan Completed',
      actor: `${patient.patient.name} (Patient Self-Intake)`,
      details: `Chief complaint recorded: "${patient.chief_complaint}". 3 previous records scanned via high-speed kiosk camera.`,
      icon: Clock,
      badgeColor: 'bg-slate-100 text-slate-800',
    },
    {
      time: patient.arrivedAt || '09:08 AM, 03 Sep 2026',
      title: 'Wristband Scanned / Token Generated',
      actor: 'MediKiosk Terminal 02',
      details: `Patient registered under UHID ${patient.patient.uhid}, ABHA verified and token ${patient.patient.queue_token} assigned.`,
      icon: History,
      badgeColor: 'bg-slate-100 text-slate-800',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  ABDM & HIS Audit Trail
                </h2>
                <p className="text-xs text-slate-500">
                  Immutable event log for Patient {patient.patient.name} ({patient.patient.queue_token})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Timeline */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {timelineEvents.map((evt, idx) => {
                const IconComp = evt.icon;
                return (
                  <div key={idx} className="relative pl-6">
                    {/* Circle Node */}
                    <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shadow-2xs">
                      <IconComp className="w-4 h-4 text-emerald-700" />
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {evt.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {evt.time}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-800 mb-1.5">
                        {evt.actor}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {evt.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-400">
              ABDM Milestone M1/M2 Compliant Audit Chain
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
