'use client';

import React, { useState } from 'react';
import { PatientRecord } from '@/types';
import {
  X,
  Edit3,
  User,
  FileText,
  Leaf,
  Activity,
  Lock,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface EditSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord;
  onSave: (updatedRecord: Partial<PatientRecord>) => void;
}

type TabType = 'details' | 'clinical' | 'ayush' | 'vitals';

export const EditSummaryModal: React.FC<EditSummaryModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');

  // Form states initialized with patient record
  const [name, setName] = useState(patient.patient.name);
  const [age, setAge] = useState(patient.patient.age);
  const [gender, setGender] = useState(patient.patient.gender);
  const [phone, setPhone] = useState(patient.patient.phone);
  const [address, setAddress] = useState(patient.patient.address || 'E-102, Arera Colony, Bhopal, Madhya Pradesh - 462016');
  const [bloodGroup, setBloodGroup] = useState(patient.vitals.blood_group.value);
  const [emergencyName, setEmergencyName] = useState(patient.patient.emergency_contact.name);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.patient.emergency_contact.phone);

  // Clinical history states
  const [chiefComplaint, setChiefComplaint] = useState(patient.chief_complaint);
  const [hpi, setHpi] = useState(patient.history_of_present_illness);
  const [pastHistoryText, setPastHistoryText] = useState(patient.past_history.join('\n'));
  const [allergyName, setAllergyName] = useState(patient.drug_allergy_history.allergy);
  const [allergyReaction, setAllergyReaction] = useState(patient.drug_allergy_history.reaction);
  const [currentMedsText, setCurrentMedsText] = useState(patient.drug_allergy_history.currentMeds?.join(', ') || '');
  const [familyHistoryText, setFamilyHistoryText] = useState(patient.family_history.join('\n'));
  const [personalHistoryText, setPersonalHistoryText] = useState(patient.personal_history.join('\n'));

  // AYUSH states
  const [prakriti, setPrakriti] = useState(patient.ayush.prakriti);
  const [vikriti, setVikriti] = useState(patient.ayush.vikriti);
  const [agni, setAgni] = useState(patient.ayush.agni);
  const [koshtha, setKoshtha] = useState(patient.ayush.koshtha);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedRecord: Partial<PatientRecord> = {
      patient: {
        ...patient.patient,
        name,
        age: Number(age),
        gender,
        phone,
        address,
        emergency_contact: {
          ...patient.patient.emergency_contact,
          name: emergencyName,
          phone: emergencyPhone,
        },
      },
      vitals: {
        ...patient.vitals,
        blood_group: {
          ...patient.vitals.blood_group,
          value: bloodGroup,
          source: 'self_reported',
        },
      },
      chief_complaint: chiefComplaint,
      history_of_present_illness: hpi,
      past_history: pastHistoryText.split('\n').filter((l) => l.trim().length > 0),
      drug_allergy_history: {
        allergy: allergyName,
        reaction: allergyReaction,
        currentMeds: currentMedsText.split(',').map((s) => s.trim()).filter(Boolean),
      },
      family_history: familyHistoryText.split('\n').filter((l) => l.trim().length > 0),
      personal_history: personalHistoryText.split('\n').filter((l) => l.trim().length > 0),
      ayush: {
        prakriti,
        vikriti,
        agni,
        koshtha,
      },
    };

    onSave(updatedRecord);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSave();
        }
      } else {
        e.preventDefault();
        handleSave();
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

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          onKeyDown={handleKeyDown}
          className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Edit Patient Summary <span className="text-xs font-normal text-slate-400">(3A)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  You can edit and correct the patient information collected from MediKiosk.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden md:inline-block text-xs text-slate-400 font-medium">
                Press Esc or click outside to close
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: 3-Column layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
            {/* Left Nav Tabs */}
            <div className="lg:col-span-3 border-r border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
              <button
                onClick={() => setActiveTab('details')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                Patient Details
              </button>

              <button
                onClick={() => setActiveTab('clinical')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ${
                  activeTab === 'clinical'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                Clinical History
              </button>

              <button
                onClick={() => setActiveTab('ayush')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ${
                  activeTab === 'ayush'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Leaf className="w-4 h-4 text-emerald-600" />
                AYUSH Assessment
              </button>

              <button
                onClick={() => setActiveTab('vitals')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ${
                  activeTab === 'vitals'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                Other Details (Vitals)
              </button>
            </div>

            {/* Center Form Area */}
            <div className="lg:col-span-6 p-6 overflow-y-auto max-h-[calc(92vh-150px)]">
              {/* Tab 1: Patient Details */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Patient Details</h3>
                    <p className="text-xs text-slate-500">
                      Basic demographic and administrative information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          className="w-full px-3 py-2 pr-12 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium select-none">
                          years
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="AB-">AB-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>

                    {/* Locked UHID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">UHID</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm select-none">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-medium">{patient.patient.uhid}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">UHID cannot be edited.</p>
                    </div>

                    {/* Locked ABHA ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ABHA ID</label>
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm select-none">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-xs">{patient.patient.abha_id}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Linked
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">ABHA ID cannot be edited.</p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Emergency Contact Number
                      </label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Clinical History */}
              {activeTab === 'clinical' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Clinical History</h3>
                    <p className="text-xs text-slate-500">
                      Chief complaint, history of present illness, allergies and history.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chief Complaint
                    </label>
                    <textarea
                      rows={2}
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      History of Present Illness (HPI)
                    </label>
                    <textarea
                      rows={3}
                      value={hpi}
                      onChange={(e) => setHpi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Known Drug Allergy
                      </label>
                      <input
                        type="text"
                        value={allergyName}
                        onChange={(e) => setAllergyName(e.target.value)}
                        placeholder="e.g., Penicillin"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Allergic Reaction
                      </label>
                      <input
                        type="text"
                        value={allergyReaction}
                        onChange={(e) => setAllergyReaction(e.target.value)}
                        placeholder="e.g., Rash, Urticaria"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Medications (comma separated)
                    </label>
                    <input
                      type="text"
                      value={currentMedsText}
                      onChange={(e) => setCurrentMedsText(e.target.value)}
                      placeholder="e.g., Amlodipine 5 mg (OD), Metformin 500 mg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Past Medical History (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={pastHistoryText}
                      onChange={(e) => setPastHistoryText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Family History (one per line)
                    </label>
                    <textarea
                      rows={2}
                      value={familyHistoryText}
                      onChange={(e) => setFamilyHistoryText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: AYUSH Assessment */}
              {activeTab === 'ayush' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">AYUSH Assessment</h3>
                    <p className="text-xs text-slate-500">
                      Traditional constitution, dosha state, digestive fire, and bowel tone.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Prakriti</label>
                      <select
                        value={prakriti}
                        onChange={(e) => setPrakriti(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        <option value="Vata-Pitta">Vata-Pitta</option>
                        <option value="Pitta-Kapha">Pitta-Kapha</option>
                        <option value="Vata-Kapha">Vata-Kapha</option>
                        <option value="Vata">Vata</option>
                        <option value="Pitta">Pitta</option>
                        <option value="Kapha">Kapha</option>
                        <option value="Tridoshic">Tridoshic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Vikriti</label>
                      <input
                        type="text"
                        value={vikriti}
                        onChange={(e) => setVikriti(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Agni</label>
                      <select
                        value={agni}
                        onChange={(e) => setAgni(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        <option value="Madhyama">Madhyama (Balanced)</option>
                        <option value="Tikshna">Tikshna (Intense)</option>
                        <option value="Manda">Manda (Sluggish)</option>
                        <option value="Vishama">Vishama (Irregular)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Koshtha</label>
                      <select
                        value={koshtha}
                        onChange={(e) => setKoshtha(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        <option value="Madhyama">Madhyama (Regular)</option>
                        <option value="Krura">Krura (Hard/Constipated)</option>
                        <option value="Mridu">Mridu (Soft/Loose)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Vitals & Locked Rules */}
              {activeTab === 'vitals' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Hardware Vitals Review</h3>
                    <p className="text-xs text-slate-500">
                      Hardware-measured physiological vitals are locked to maintain clinical integrity.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Immutable Device Readings
                      </h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        These vitals were measured directly by MediKiosk connected sensors. Under clinical governance protocols, automated hardware readings cannot be manually modified by the doctor.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">Blood Pressure</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {patient.vitals.blood_pressure.value}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Lock className="w-2.5 h-2.5" /> Kiosk Device
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">Pulse</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {patient.vitals.pulse.value}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Lock className="w-2.5 h-2.5" /> Kiosk Device
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">SpO₂</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {patient.vitals.spo2.value}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Lock className="w-2.5 h-2.5" /> Kiosk Device
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">Temperature</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {patient.vitals.temperature.value}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Lock className="w-2.5 h-2.5" /> Kiosk Device
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">Weight</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {patient.vitals.weight.value}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Lock className="w-2.5 h-2.5" /> Kiosk Device
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">Blood Sugar</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">
                        {patient.vitals.blood_sugar.value}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Lock className="w-2.5 h-2.5" /> {patient.vitals.blood_sugar.source}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Rules & Patient Card */}
            <div className="hidden lg:block lg:col-span-3 border-l border-slate-200 p-5 bg-slate-50/40 space-y-4">
              {/* Mini Patient Profile */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img
                    src={patient.patient.photo_url || '/doctor-avatar.jpg'}
                    alt={patient.patient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {patient.patient.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {patient.patient.age} years • {patient.patient.gender}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {patient.patient.uhid}
                  </p>
                </div>
              </div>

              {/* Field Editing Rules Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Info className="w-4 h-4 text-blue-600" />
                  Field Editing Rules
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Editable</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                        Most demographic details, blood group and clinical information can be edited.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Not Editable</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                        UHID, ABHA ID and vitals cannot be edited.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Purpose</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                        Ensure data accuracy while maintaining audit trail and integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Tip:</strong> Use the tabs on the left to edit clinical history, AYUSH assessment, and other details.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
