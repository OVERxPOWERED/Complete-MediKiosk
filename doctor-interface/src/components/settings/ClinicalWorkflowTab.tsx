'use client';

import React, { useState } from 'react';
import {
  Leaf,
  Plus,
  X,
  GripVertical,
  Heart,
  Brain,
  Bone,
  Flame,
  Globe,
  Settings2,
  FileText,
  MoreVertical,
  ArrowRight,
  Info,
} from 'lucide-react';
import { NoteTemplateModal, NoteTemplateItem } from '@/components/modals/NoteTemplateModal';

interface ClinicalWorkflowTabProps {
  showAyushDefault: boolean;
  onToggleAyush: (val: boolean) => void;
  pinnedSpecialists: string[];
  onUpdateSpecialists: (specs: string[]) => void;
  highlightAbnormalVitals: boolean;
  onToggleHighlightVitals: (val: boolean) => void;
  confirmBeforePush: boolean;
  onToggleConfirmPush: (val: boolean) => void;
}

export const ClinicalWorkflowTab: React.FC<ClinicalWorkflowTabProps> = ({
  showAyushDefault,
  onToggleAyush,
  pinnedSpecialists,
  onUpdateSpecialists,
  highlightAbnormalVitals,
  onToggleHighlightVitals,
  confirmBeforePush,
  onToggleConfirmPush,
}) => {
  const [autoOpenDocs, setAutoOpenDocs] = useState(true);
  const [showVitalsAtTop, setShowVitalsAtTop] = useState(true);

  // Default Instructions
  const [instructions, setInstructions] = useState([
    'Rest and hydration',
    'Continue prescribed medication',
    'Follow up in 2 weeks',
    'Report immediately if symptoms worsen',
  ]);

  // Add Specialist inline state
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');

  // Add Instruction inline state
  const [isAddingInstr, setIsAddingInstr] = useState(false);
  const [newInstrText, setNewInstrText] = useState('');

  const handleRemoveSpecialist = (spec: string) => {
    onUpdateSpecialists(pinnedSpecialists.filter((s) => s !== spec));
  };

  const handleAddSpecialist = () => {
    if (!newSpecName.trim()) return;
    if (!pinnedSpecialists.includes(newSpecName.trim())) {
      onUpdateSpecialists([...pinnedSpecialists, newSpecName.trim()]);
    }
    setNewSpecName('');
    setIsAddingSpec(false);
  };

  const handleRemoveInstruction = (instr: string) => {
    setInstructions((prev) => prev.filter((i) => i !== instr));
  };

  const handleAddInstruction = () => {
    if (!newInstrText.trim()) return;
    setInstructions((prev) => [...prev, newInstrText.trim()]);
    setNewInstrText('');
    setIsAddingInstr(false);
  };

  // Note Templates state and handlers
  const [noteTemplates, setNoteTemplates] = useState<NoteTemplateItem[]>([
    {
      id: 'tmpl-1',
      title: 'General Follow-up Note',
      category: 'General Medicine',
      content:
        'Patient review satisfactory. Vitals within normal limits. Advised continuation of current treatment plan and follow-up in 4 weeks.',
    },
    {
      id: 'tmpl-2',
      title: 'Hypertension Review',
      category: 'Cardiology',
      content:
        'Hypertension follow-up. Home BP readings reviewed. Medication compliance verified. Low salt diet and regular aerobic exercise reinforced.',
    },
    {
      id: 'tmpl-3',
      title: 'Diabetes Follow-up',
      category: 'Endocrinology',
      content:
        'Fasting and post-prandial blood sugars reviewed. HbA1c monitored. Dietary adherence checked. Advised daily foot inspection.',
    },
    {
      id: 'tmpl-4',
      title: 'Post-operative Review',
      category: 'General Medicine',
      content:
        'Surgical site clean and healthy. No erythema or discharge. Sutures intact. Analgesic tapering advised.',
    },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplateItem | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);

  const handleOpenNewTemplate = () => {
    setSelectedTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (tmpl: NoteTemplateItem) => {
    setSelectedTemplate(tmpl);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (saved: NoteTemplateItem) => {
    setNoteTemplates((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      if (exists) {
        return prev.map((t) => (t.id === saved.id ? saved : t));
      }
      return [...prev, saved];
    });
  };

  const getSpecialistIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cardiology':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'neurology':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'orthopedics':
        return <Bone className="w-4 h-4 text-blue-500" />;
      case 'endocrinology':
        return <Flame className="w-4 h-4 text-amber-500" />;
      default:
        return <Heart className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Preferences, Pinned Specialists, Default Instructions */}
      <div className="lg:col-span-7 space-y-6">
        {/* AYUSH Assessment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Clinical &amp; Workflow Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your consultation workflow to suit your practice.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  AYUSH Assessment
                </h4>
                <p className="text-xs text-slate-500">
                  Show AYUSH assessment by default on Patient Summary.
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => onToggleAyush(!showAyushDefault)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                showAyushDefault ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAyushDefault ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              When enabled, the AYUSH section will be expanded by default for every new patient.
            </span>
          </div>
        </div>

        {/* Pinned Specialists Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Pinned Specialists
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select and manage your frequently referred specialists. Pinned specialists will appear at the top of the referral list in the Record Outcome flow.
              </p>
            </div>

            <button
              onClick={() => setIsAddingSpec(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Specialist
            </button>
          </div>

          {/* Add Specialist Inline Input */}
          {isAddingSpec && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <input
                type="text"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                placeholder="Department name (e.g. Pulmonology)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleAddSpecialist}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingSpec(false)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Specialists List */}
          <div className="space-y-2">
            {pinnedSpecialists.map((spec) => (
              <div
                key={spec}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {getSpecialistIcon(spec)}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{spec}</span>
                </div>

                <button
                  onClick={() => handleRemoveSpecialist(spec)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Remove from pinned"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Default Instructions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Default Instructions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set commonly used instructions (optional). These can be selected quickly while recording outcome.
              </p>
            </div>

            <button
              onClick={() => setIsAddingInstr(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Instruction
            </button>
          </div>

          {/* Add Instruction Inline */}
          {isAddingInstr && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <input
                type="text"
                value={newInstrText}
                onChange={(e) => setNewInstrText(e.target.value)}
                placeholder="New instruction text..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleAddInstruction}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
              >
                Save
              </button>
              <button
                onClick={() => setIsAddingInstr(false)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Instructions Chips */}
          <div className="flex flex-wrap gap-2">
            {instructions.map((instr) => (
              <span
                key={instr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium hover:bg-slate-200/70 transition-colors"
              >
                <span>{instr}</span>
                <button
                  onClick={() => handleRemoveInstruction(instr)}
                  className="text-slate-400 hover:text-red-600 rounded-full cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Consultation Preferences, Note Templates, Language */}
      <div className="lg:col-span-5 space-y-6">
        {/* Consultation Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 mb-2">
            <Settings2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold">Consultation Preferences</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">
                Auto-open document viewer when documents are available.
              </span>
              <button
                onClick={() => setAutoOpenDocs(!autoOpenDocs)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  autoOpenDocs ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    autoOpenDocs ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">
                Show vital signs at the top of patient summary.
              </span>
              <button
                onClick={() => setShowVitalsAtTop(!showVitalsAtTop)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  showVitalsAtTop ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    showVitalsAtTop ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">
                Highlight abnormal vitals.
              </span>
              <button
                onClick={() => onToggleHighlightVitals(!highlightAbnormalVitals)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  highlightAbnormalVitals ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    highlightAbnormalVitals ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-700 font-medium">
                Confirm before pushing to HIS.
              </span>
              <button
                onClick={() => onToggleConfirmPush(!confirmBeforePush)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  confirmBeforePush ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    confirmBeforePush ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Note Templates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText className="w-4 h-4 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold">Note Templates</h3>
                <p className="text-[11px] text-slate-400">Save and manage reusable clinical note templates.</p>
              </div>
            </div>

            <button
              onClick={handleOpenNewTemplate}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              + New Template
            </button>
          </div>

          <div className="space-y-2">
            {noteTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleEditTemplate(tmpl)}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 text-xs font-semibold text-slate-700 cursor-pointer transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-900">
                    {tmpl.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                    {tmpl.category} · {tmpl.content.slice(0, 45)}...
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTemplate(tmpl);
                  }}
                  className="text-slate-400 group-hover:text-emerald-700 p-1 rounded hover:bg-white"
                  title="Edit Template"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleOpenNewTemplate}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            View all templates
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Note Template Edit/Create Modal */}
        <NoteTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          template={selectedTemplate}
          onSave={handleSaveTemplate}
        />

        {/* Language & Terminology */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800">
            <Globe className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold">Language &amp; Terminology</h3>
              <p className="text-[11px] text-slate-400">Display clinical terms in:</p>
            </div>
          </div>

          <select
            defaultValue="English (Default)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          >
            <option value="English (Default)">English (Default)</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Hinglish">Hinglish</option>
          </select>
        </div>
      </div>
    </div>
  );
};
