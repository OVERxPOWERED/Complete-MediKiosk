'use client';

import React, { useState, useEffect } from 'react';
import { ScannedDocument } from '@/types';
import {
  X,
  FileText,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Download,
  Printer,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  Minimize2,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: ScannedDocument[];
  initialDocId?: string;
  onFlagForRescan?: (docId: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDocId,
  onFlagForRescan,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocId || documents[0]?.id || ''
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isReportFullscreen, setIsReportFullscreen] = useState<boolean>(false);
  const [flaggedDocs, setFlaggedDocs] = useState<Record<string, boolean>>({});
  const [annotations, setAnnotations] = useState<Record<string, string[]>>({});
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');

  useEffect(() => {
    if (initialDocId) {
      setSelectedDocId(initialDocId);
      setCurrentPage(1);
      setZoomLevel(100);
      setRotation(0);
    } else if (documents.length > 0 && !selectedDocId) {
      setSelectedDocId(documents[0].id);
    }
  }, [initialDocId, documents]);

  // Keyboard shortcut: Esc to exit fullscreen or close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isReportFullscreen) {
          setIsReportFullscreen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isReportFullscreen, onClose]);

  if (!isOpen) return null;

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const totalPages = currentDoc?.pagesList?.length || currentDoc?.pages || 1;
  const activePageObj = currentDoc?.pagesList?.[currentPage - 1];
  const activeImageUrl = activePageObj?.imageUrl || currentDoc?.previewUrl || '/ecg_p1.svg';

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setCurrentPage(1);
    setZoomLevel(100);
    setRotation(0);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 25, 50));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleFlagRescan = () => {
    if (currentDoc) {
      setFlaggedDocs((prev) => ({
        ...prev,
        [currentDoc.id]: !prev[currentDoc.id],
      }));
      if (onFlagForRescan) {
        onFlagForRescan(currentDoc.id);
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-7xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Document Viewer
                </h2>
                <p className="text-xs text-slate-500">
                  Review scanned documents from MediKiosk
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

          {/* Body: 3-Column Workstation */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden bg-slate-100/60">
            {/* Column 1: Document Drawer (Left) */}
            <div className="hidden lg:block lg:col-span-3 border-r border-slate-200 bg-white p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  All Documents ({documents.length})
                </span>
              </div>

              <div className="space-y-2.5">
                {documents.map((doc) => {
                  const isSelected = doc.id === currentDoc?.id;
                  const isFlagged = flaggedDocs[doc.id];
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 relative overflow-hidden">
                          {doc.previewUrl ? (
                            <Image
                              src={doc.previewUrl}
                              alt={doc.doc_type}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-400 m-auto mt-3" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-emerald-950 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {doc.doc_type}
                          </h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            • {doc.pages} {doc.pages === 1 ? 'page' : 'pages'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            • {doc.date} {doc.time ? `· ${doc.time}` : ''}
                          </div>
                          {isFlagged && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              Flagged for Rescan
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? 'text-emerald-700' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Document Viewer Canvas (Center) */}
            <div className="lg:col-span-6 flex flex-col bg-slate-900/5 min-h-0 border-r border-slate-200">
              {/* Viewer Control Bar */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {currentDoc?.doc_type}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-700 w-12 text-center select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-300 mx-1" />

                  <button
                    onClick={() => setIsReportFullscreen(true)}
                    className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                    title="View in Full screen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleRotate}
                    className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                    title="Rotate Right"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewport Canvas with Zoom and Rotation */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative select-none">
                <div
                  className="transition-transform duration-150 origin-center bg-white shadow-xl rounded-lg p-2 border border-slate-200"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  }}
                >
                  <div className="relative w-[540px] h-[520px] sm:w-[580px] sm:h-[560px] overflow-hidden rounded bg-white">
                    <Image
                      src={activeImageUrl}
                      alt={`${currentDoc?.doc_type} - Page ${currentPage}`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Pagination Bar */}
              <div className="flex items-center justify-between px-6 py-2.5 bg-white border-t border-slate-200">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Thumbnails */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative w-10 h-10 rounded-lg border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/30'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    {currentPage} / {totalPages}
                  </span>
                </div>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column 3: Document Details & Clinical Actions (Right) */}
            <div className="hidden lg:block lg:col-span-3 bg-white p-5 overflow-y-auto space-y-5">
              {/* Document Details Card */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Document Details
                </h4>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 relative overflow-hidden flex-shrink-0">
                      {currentDoc?.previewUrl && (
                        <Image
                          src={currentDoc.previewUrl}
                          alt={currentDoc.doc_type}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">
                        {currentDoc?.doc_type}
                      </h5>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Scanned at MediKiosk
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Document Type</span>
                      <span className="font-semibold text-slate-800">{currentDoc?.doc_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pages</span>
                      <span className="font-semibold text-slate-800">{totalPages} pages</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Captured On</span>
                      <span className="font-semibold text-slate-800">{currentDoc?.date} · {currentDoc?.time || '09:08 AM'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source</span>
                      <span className="font-semibold text-slate-800">{currentDoc?.source || 'MediKiosk (Patient Scan)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">File ID</span>
                      <span className="font-mono text-[11px] text-slate-700">{currentDoc?.fileId || 'DOC_20260903_090812'}</span>
                    </div>

                    {annotations[currentDoc?.id || ''] && annotations[currentDoc?.id || ''].length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Doctor Observations</span>
                        {annotations[currentDoc.id].map((note, idx) => (
                          <div key={idx} className="p-2 bg-blue-50/80 rounded-lg border border-blue-200/70 text-[11px] text-blue-900 font-medium leading-relaxed">
                            &quot;{note}&quot;
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Actions
                </h4>

                <div className="space-y-2">
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4 text-emerald-600" />
                    Fit to Width
                  </button>

                  <button
                    onClick={() => setIsReportFullscreen(true)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4 text-emerald-600" />
                    View in Full screen
                  </button>

                  <button
                    onClick={handleRotate}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 text-slate-500" />
                    Rotate Right
                  </button>

                  <button
                    onClick={() => window.open(activeImageUrl, '_blank')}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    Download (PDF)
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    Print
                  </button>

                  <button
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                    {isAddingNote ? 'Cancel Note' : 'Add Note / Annotation'}
                  </button>

                  {isAddingNote && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-blue-900">Doctor Observation</div>
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Enter clinical observation for this document..."
                        rows={2}
                        className="w-full text-xs p-2 border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingNote(false)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newNoteText.trim() || !currentDoc) return;
                            setAnnotations((prev) => ({
                              ...prev,
                              [currentDoc.id]: [...(prev[currentDoc.id] || []), newNoteText.trim()],
                            }));
                            setNewNoteText('');
                            setIsAddingNote(false);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Flag for Rescan - Amber Alert Card */}
                  <button
                    onClick={handleFlagRescan}
                    className={`w-full text-left p-3 rounded-xl border transition-colors mt-2 cursor-pointer ${
                      flaggedDocs[currentDoc?.id || '']
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      {flaggedDocs[currentDoc?.id || ''] ? 'Flagged for Rescan' : 'Flag for Rescan'}
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Mark as erroneous or unreadable
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fullscreen Report Immersive View */}
        <AnimatePresence>
          {isReportFullscreen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col"
            >
              {/* Top Header Bar */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 text-white select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-100">
                        {currentDoc?.doc_type}
                      </h2>
                      <span className="text-[10px] font-semibold tracking-wide uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        Full Screen Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Page {currentPage} of {totalPages} • {currentDoc?.date}
                    </p>
                  </div>
                </div>

                {/* Center Controls: Zoom, Rotate, Page Switcher */}
                <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 shadow-inner">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-200 font-semibold px-1 select-none">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-700 mx-1" />

                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-200 font-mono w-12 text-center select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-700 mx-1" />

                  <button
                    onClick={handleRotate}
                    className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setZoomLevel(100);
                      setRotation(0);
                    }}
                    className="text-[11px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
                    title="Reset Zoom & Rotation"
                  >
                    Reset
                  </button>
                </div>

                {/* Right Corner: Close Cross & Esc Label */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 hidden sm:inline-block">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Esc</kbd> or click cross to exit
                  </span>
                  <button
                    onClick={() => setIsReportFullscreen(false)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-all cursor-pointer font-semibold text-xs shadow-sm group"
                    aria-label="Close fullscreen"
                    title="Exit Fullscreen (Esc or Click Cross)"
                  >
                    <X className="w-4 h-4 text-slate-400 group-hover:text-rose-200" />
                    <span>Exit Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Viewport: ONLY the report in high resolution */}
              <div
                className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center select-none"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsReportFullscreen(false);
                  }
                }}
              >
                <div
                  className="transition-transform duration-150 origin-center bg-white shadow-2xl rounded-2xl p-4 border border-slate-800/80 flex items-center justify-center overflow-hidden"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-[85vw] h-[82vh] max-w-[1300px] max-h-[850px] overflow-hidden rounded-lg bg-white">
                    <Image
                      src={activeImageUrl}
                      alt={`${currentDoc?.doc_type} - Full Screen`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
