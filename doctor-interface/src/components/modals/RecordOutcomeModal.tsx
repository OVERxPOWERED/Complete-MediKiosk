'use client';

import React, { useState } from 'react';
import {
  PatientRecord,
  OutcomeType,
  PrescribedMedication,
  ConsultationOutcomeData,
} from '@/types';
import {
  X,
  CalendarCheck,
  Home,
  UserCheck,
  FlaskConical,
  Bed,
  Calendar,
  Plus,
  Pill,
  CheckCircle2,
  CalendarDays,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface RecordOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord;
  doctorName?: string;
  onSaveOutcome: (outcome: ConsultationOutcomeData) => void;
  pinnedSpecialists?: string[];
}

export const RecordOutcomeModal: React.FC<RecordOutcomeModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctorName = 'Dr. Anjali Verma',
  onSaveOutcome,
  pinnedSpecialists = ['Cardiology', 'Neurology', 'Orthopedics', 'Endocrinology'],
}) => {
  const [outcomeType, setOutcomeType] = useState<OutcomeType>(
    patient.consultation_outcome?.outcome_type || 'Treated & Discharged'
  );

  const [clinicalNotes, setClinicalNotes] = useState<string>(
    patient.consultation_outcome?.clinical_notes ||
      'Patient evaluated for chest pain. Vitals stable. Likely musculoskeletal in origin. Advised analgesics and lifestyle modification.'
  );

  const [prescriptions, setPrescriptions] = useState<PrescribedMedication[]>(
    patient.consultation_outcome?.prescriptions || [
      {
        id: 'rx-1',
        name: 'Amlodipine 5 mg (OD)',
        dosage: '1 tablet once daily',
        duration: '30 days',
      },
    ]
  );

  const [followUpDate, setFollowUpDate] = useState<string>(
    patient.consultation_outcome?.follow_up_date || '2026-09-17'
  );
  const [remindSms, setRemindSms] = useState<boolean>(
    patient.consultation_outcome?.remind_sms ?? true
  );

  const [referredSpecialist, setReferredSpecialist] = useState<string>(
    patient.consultation_outcome?.referred_specialist || 'Cardiology'
  );

  const [additionalInstructions, setAdditionalInstructions] = useState<string>(
    patient.consultation_outcome?.additional_instructions || ''
  );

  // New prescription inline input states
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('5 days');

  if (!isOpen) return null;

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const newRx: PrescribedMedication = {
      id: `rx-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 tablet once daily',
      duration: newMedDuration.trim() || '5 days',
    };
    setPrescriptions((prev) => [...prev, newRx]);
    setNewMedName('');
    setNewMedDosage('');
    setIsAddingMed(false);
  };

  const handleRemoveMed = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = () => {
    const outcomeData: ConsultationOutcomeData = {
      outcome_type: outcomeType,
      clinical_notes: clinicalNotes,
      prescriptions,
      advice: ['Rest and hydration', 'Low salt diet', 'Avoid strenuous exertion'],
      follow_up_date: followUpDate || undefined,
      remind_sms: remindSms,
      referred_specialist:
        outcomeType === 'Referred to Specialist' ? referredSpecialist : undefined,
      additional_instructions: additionalInstructions || undefined,
      recorded_at: '11:42 AM, 03 Sep 2026',
      doctor_name: doctorName,
      pushed_to_his: true,
    };

    onSaveOutcome(outcomeData);
    onClose();
  };

  const outcomeOptions: {
    type: OutcomeType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { type: 'Treated & Discharged', label: 'Treated & Discharged', icon: Home },
    { type: 'Referred to Specialist', label: 'Referred to Specialist', icon: UserCheck },
    { type: 'Advised Investigation', label: 'Advised Investigation', icon: FlaskConical },
    { type: 'Admitted', label: 'Admitted', icon: Bed },
    { type: 'Follow-up', label: 'Follow-up', icon: Calendar },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (!isAddingMed) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          onKeyDown={handleKeyDown}
          className="relative z-10 w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Record Outcome</h2>
                <p className="text-xs text-slate-500">
                  Add consultation outcome, plan, and next steps for the patient.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Left Form + Right Summary Panel */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
            {/* Left Form Area */}
            <div className="lg:col-span-8 p-6 overflow-y-auto max-h-[calc(94vh-140px)] space-y-5">
              {/* 1. Consultation Outcome */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Consultation Outcome <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-2.5">
                  Select the outcome of this visit.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {outcomeOptions.map((opt) => {
                    const isSelected = outcomeType === opt.type;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setOutcomeType(opt.type)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-600/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-emerald-950' : 'text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border mt-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Clinical Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Clinical Notes <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Brief notes from today&apos;s consultation.
                </p>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    placeholder="Enter doctor clinical assessment and recommendations..."
                  />
                  <span className="text-[11px] text-slate-400 absolute right-3 bottom-2 select-none">
                    {clinicalNotes.length}/1000
                  </span>
                </div>
              </div>

              {/* 3. Prescription / Advice */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    3. Prescription / Advice
                  </label>
                </div>
                <p className="text-xs text-slate-400 mb-2.5">
                  Add medications or general advice given.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingMed(true)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                        Add Prescription
                      </div>
                      <div className="text-[11px] text-slate-400">Search and add medicines</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const preset = '• Advised: Low sodium diet, 30 min daily light walking, adequate hydration, avoid strenuous exertion.';
                      if (!clinicalNotes.includes('Low sodium diet')) {
                        setClinicalNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${preset}` : preset));
                      }
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                        Add Advice
                      </div>
                      <div className="text-[11px] text-slate-400">Diet, lifestyle, precautions</div>
                    </div>
                  </button>
                </div>

                {/* Inline Add Medicine Form */}
                {isAddingMed && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-3 space-y-2">
                    <div className="text-xs font-bold text-emerald-900">Add New Medicine</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Drug name (e.g. Paracetamol 500mg)"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1 tab TDS)"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 days)"
                        value={newMedDuration}
                        onChange={(e) => setNewMedDuration(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingMed(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMedication}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg"
                      >
                        Add to Rx
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Prescriptions List */}
                <div className="space-y-2">
                  {prescriptions.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{med.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {med.dosage}, {med.duration}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(med.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Follow-up & Department / Specialist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Follow-up <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-2">Next review date (if required)</p>

                  <div className="relative">
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remindSms}
                      onChange={(e) => setRemindSms(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-600">Remind patient (SMS)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Specialist
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    {outcomeType === 'Referred to Specialist'
                      ? 'Select referral department'
                      : 'Not required for treated & discharged patients.'}
                  </p>

                  <select
                    disabled={outcomeType !== 'Referred to Specialist'}
                    value={referredSpecialist}
                    onChange={(e) => setReferredSpecialist(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {outcomeType !== 'Referred to Specialist' ? (
                      <option value="N/A">N/A</option>
                    ) : (
                      pinnedSpecialists.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* 5. Additional Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Additional Instructions{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g., warning signs, when to return, contact details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Right Panel: Patient Card & Today's Summary */}
            <div className="hidden lg:block lg:col-span-4 border-l border-slate-200 p-5 bg-slate-50/40 space-y-4 overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Patient Details
                </h4>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    <img
                      src={patient.patient.photo_url || '/doctor-avatar.jpg'}
                      alt={patient.patient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-slate-800 truncate">
                      {patient.patient.name}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {patient.patient.age} years • {patient.patient.gender}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {patient.patient.uhid}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ABHA Linked
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800">Today&apos;s Summary</h4>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400">Visit Date</div>
                      <div className="font-semibold text-slate-800">
                        {patient.arrivedAt || '03 Sep 2026, 09:08 AM'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400">Seen by</div>
                      <div className="font-semibold text-slate-800">{doctorName}</div>
                      <div className="text-[11px] text-slate-500">General Medicine OPD</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400">Chief Complaint</div>
                      <div className="font-medium text-slate-700">{patient.chief_complaint}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Pill className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400">Current Medications</div>
                      <div className="font-medium text-slate-700">
                        {patient.drug_allergy_history.currentMeds?.join(', ') || 'None reported'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50/70">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Push to HIS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
