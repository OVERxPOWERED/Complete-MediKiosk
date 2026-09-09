'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { QueueHeaderMetrics } from '@/components/queue/QueueHeaderMetrics';
import { QueueFilterBar } from '@/components/queue/QueueFilterBar';
import { NeedsAttentionCard } from '@/components/queue/NeedsAttentionCard';
import { JustScannedCard } from '@/components/queue/JustScannedCard';
import { QueueTable } from '@/components/queue/QueueTable';
import { EmptyQueueView } from '@/components/queue/EmptyQueueView';
import { QrScannerModal } from '@/components/modals/QrScannerModal';
import { mockInitialPatients } from '@/services/mockData';

export default function QueuePage() {
  const {
    patients,
    justScannedPatient,
    justScannedCountdown,
    scanWristband,
    clearJustScanned,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'New' | 'Reviewed'>('all');
  const [sortBy, setSortBy] = useState<'queue' | 'wait' | 'priority'>('queue');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // USB HID barcode scanner auto-listener (keyboard wedge)
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 150) {
        barcodeBuffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          scanWristband(barcodeBuffer.trim());
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanWristband]);

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient.queue_token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chief_complaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'wait') {
      return a.queueNumber - b.queueNumber;
    }
    if (sortBy === 'priority') {
      const aAlert = a.red_flags && a.red_flags.length > 0 ? 1 : 0;
      const bAlert = b.red_flags && b.red_flags.length > 0 ? 1 : 0;
      return bAlert - aAlert;
    }
    return a.queueNumber - b.queueNumber;
  });

  const waitingCount = patients.filter((p) => p.status === 'New').length;

  return (
    <div>
      {/* Top Metrics & CTA */}
      <QueueHeaderMetrics
        waitingCount={waitingCount}
        onScanClick={() => setIsScannerOpen(true)}
      />

      {/* Filter and Search Bar */}
      <QueueFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Screen 2C: Just Scanned Card (when a patient is freshly scanned) */}
      <JustScannedCard
        patient={justScannedPatient}
        countdown={justScannedCountdown}
        onClear={clearJustScanned}
      />

      {/* Screen 2B: Needs Attention Card (Red flags) */}
      <NeedsAttentionCard patients={sortedPatients} />

      {/* Screen 2A: Main Queue Table or Screen 2D: Empty Queue */}
      {sortedPatients.length > 0 ? (
        <QueueTable patients={sortedPatients} />
      ) : (
        <EmptyQueueView
          onScanClick={() => setIsScannerOpen(true)}
          onResetPatients={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('medikiosk_patients', JSON.stringify(mockInitialPatients));
              window.location.reload();
            }
          }}
        />
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={scanWristband}
      />
    </div>
  );
}
