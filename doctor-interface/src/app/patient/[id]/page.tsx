'use client';

import React, { useState, use } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { PatientHeader } from '@/components/summary/PatientHeader';
import { PatientDemographics } from '@/components/summary/PatientDemographics';
import { RedFlagBanner } from '@/components/summary/RedFlagBanner';
import { VitalsGrid } from '@/components/summary/VitalsGrid';
import { ClinicalHistoryGrid } from '@/components/summary/ClinicalHistoryGrid';
import { AyushAssessment } from '@/components/summary/AyushAssessment';
import { ScannedDocsStrip } from '@/components/summary/ScannedDocsStrip';
import { StickyFooter } from '@/components/summary/StickyFooter';

import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EditSummaryModal } from '@/components/modals/EditSummaryModal';
import { RecordOutcomeModal } from '@/components/modals/RecordOutcomeModal';
import { AuditTrailModal } from '@/components/modals/AuditTrailModal';
import { ArrowLeft, UserX } from 'lucide-react';

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientSummaryPage({ params }: PatientPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    getPatient,
    updatePatientSummary,
    confirmAndPushToHis,
    recordOutcome,
    doctor,
    settings,
  } = useApp();

  const patient = getPatient(resolvedParams.id);

  // Modal visibility states
  const [isDocViewerOpen, setIsDocViewerOpen] = useState<boolean>(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState<boolean>(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);

  if (!patient) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Patient Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Could not locate any active summary record matching &quot;{resolvedParams.id}&quot;.
          The patient token may be invalid or expired.
        </p>
        <button
          onClick={() => router.push('/queue')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Queue
        </button>
      </div>
    );
  }

  const handleOpenDocViewer = (docId?: string) => {
    setSelectedDocId(docId);
    setIsDocViewerOpen(true);
  };

  const handleConfirmAndPush = () => {
    confirmAndPushToHis(patient.patient.queue_token);
  };

  return (
    <div className="min-h-screen pb-28 pt-2">
      <div className="max-w-7xl mx-auto space-y-5 px-2 sm:px-0">
        {/* 1. Header: Back button, Title, Status & Token Card */}
        <PatientHeader patient={patient} />

        {/* 2. Demographics Card */}
        <PatientDemographics patient={patient} />

        {/* 3. Red Flag Alert OR Summary Pushed to HIS Banner */}
        <RedFlagBanner
          redFlags={patient.red_flags}
          status={patient.status}
          reviewedAt={patient.reviewedAt}
          onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        />

        {/* 4. Vitals Grid */}
        <VitalsGrid vitals={patient.vitals} />

        {/* 5. Clinical History Grid (CC, HPI, Past, Allergy, Family, Personal, ROS, Investigations) */}
        <ClinicalHistoryGrid patient={patient} />

        {/* 6. AYUSH Assessment (AI-generated Prakriti, Vikriti, Agni, Koshtha) */}
        <AyushAssessment
          ayush={patient.ayush}
          initialExpanded={settings.showAyushDefault}
        />

        {/* 7. Previous Medical Documents (ECG, Lab, Rx) */}
        <ScannedDocsStrip
          documents={patient.documents}
          onOpenViewer={handleOpenDocViewer}
        />
      </div>

      {/* 8. Sticky Viewport Footer */}
      <StickyFooter
        status={patient.status}
        onEditSummary={() => setIsEditModalOpen(true)}
        onConfirmPush={handleConfirmAndPush}
        onRecordOutcome={() => setIsOutcomeModalOpen(true)}
      />

      {/* Modals */}
      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        documents={patient.documents}
        initialDocId={selectedDocId}
      />

      <EditSummaryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onSave={(updates) => updatePatientSummary(patient.patient.queue_token, updates)}
      />

      <RecordOutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        patient={patient}
        doctorName={doctor?.name}
        onSaveOutcome={(outcome) => recordOutcome(patient.patient.queue_token, outcome)}
        pinnedSpecialists={settings.pinnedSpecialists}
      />

      <AuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        patient={patient}
      />
    </div>
  );
}
