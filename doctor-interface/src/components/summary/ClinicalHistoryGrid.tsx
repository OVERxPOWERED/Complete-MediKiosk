'use client';

import React from 'react';
import { PatientRecord } from '@/types';
import {
  ShieldAlert,
  FileText,
  Clock,
  Pill,
  Users,
  User,
  ListChecks,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';

interface ClinicalHistoryGridProps {
  patient: PatientRecord;
}

export const ClinicalHistoryGrid: React.FC<ClinicalHistoryGridProps> = ({ patient }) => {
  const {
    chief_complaint,
    history_of_present_illness,
    past_history,
    drug_allergy_history,
    family_history,
    personal_history,
    review_of_systems,
    prior_investigations_summary,
  } = patient;

  const hasAllergy =
    drug_allergy_history.allergy &&
    drug_allergy_history.allergy.toLowerCase() !== 'none' &&
    drug_allergy_history.allergy.toLowerCase() !== 'nkda';

  return (
    <div className="space-y-4 mb-6">
      {/* Top 2 Columns: Chief Complaint + HPI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chief Complaint */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1 rounded-lg bg-teal-50 text-teal-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Chief Complaint
            </h4>
          </div>
          <div className="text-sm font-semibold text-slate-900 leading-relaxed">
            {chief_complaint || 'No complaint recorded.'}
          </div>
        </div>

        {/* History of Present Illness */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1 rounded-lg bg-teal-50 text-teal-800">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              History of Present Illness
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {history_of_present_illness || 'No history of present illness recorded.'}
          </p>
        </div>
      </div>

      {/* 2x3 Grid of Clinical Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Past History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Past History
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {past_history && past_history.length > 0 ? (
                past_history.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No previous medical history reported</li>
              )}
            </ul>
          </div>
        </div>

        {/* 2. Drug / Allergy History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-teal-50 text-teal-800">
                <Pill className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Drug / Allergy History
              </h4>
            </div>

            {hasAllergy ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-amber-900">
                  {drug_allergy_history.allergy} — {drug_allergy_history.reaction}
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-emerald-800 mb-3">
                ✓ NKDA (No Known Drug Allergies)
              </div>
            )}

            {drug_allergy_history.currentMeds && drug_allergy_history.currentMeds.length > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-1">Current Medications:</span>
                <ul className="space-y-1">
                  {drug_allergy_history.currentMeds.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 3. Family History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Family History
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {family_history && family_history.length > 0 ? (
                family_history.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">Not asked this session</li>
              )}
            </ul>
          </div>
        </div>

        {/* 4. Personal History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <User className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Personal History
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {personal_history && personal_history.length > 0 ? (
                personal_history.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No personal habits noted</li>
              )}
            </ul>
          </div>
        </div>

        {/* 5. Review of Systems */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <ListChecks className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Review of Systems
              </h4>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {review_of_systems.respiratory && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span><strong>Respiratory:</strong> {review_of_systems.respiratory}</span>
                </div>
              )}
              {review_of_systems.cardiovascular && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span><strong>Cardiovascular:</strong> {review_of_systems.cardiovascular}</span>
                </div>
              )}
              {review_of_systems.gastrointestinal && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span><strong>GI:</strong> {review_of_systems.gastrointestinal}</span>
                </div>
              )}
              {review_of_systems.others && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span><strong>Others:</strong> {review_of_systems.others}</span>
                </div>
              )}
              {!review_of_systems.respiratory &&
                !review_of_systems.cardiovascular &&
                !review_of_systems.gastrointestinal &&
                !review_of_systems.others && (
                  <div className="text-slate-400 italic">No system abnormalities reported</div>
                )}
            </div>
          </div>
        </div>

        {/* 6. Prior Investigations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <FlaskConical className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prior Investigations
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {prior_investigations_summary && prior_investigations_summary.length > 0 ? (
                prior_investigations_summary.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No prior test records reported</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
