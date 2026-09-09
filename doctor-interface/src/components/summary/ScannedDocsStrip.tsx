'use client';

import React from 'react';
import { ScannedDocument } from '@/types';
import { FileText, Eye, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface ScannedDocsStripProps {
  documents: ScannedDocument[];
  onOpenViewer: (documentId?: string) => void;
}

export const ScannedDocsStrip: React.FC<ScannedDocsStripProps> = ({
  documents,
  onOpenViewer,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">
        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-medium">No previous medical documents attached for this patient</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Previous Medical Documents
          </h3>
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        <button
          onClick={() => onOpenViewer(documents[0]?.id)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs bg-slate-50/40 hover:bg-white transition-all group"
          >
            {/* Thumbnail + Details */}
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 relative group-hover:border-emerald-300">
                {doc.previewUrl ? (
                  <Image
                    src={doc.previewUrl}
                    alt={doc.doc_type}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                  {doc.doc_type}
                </h4>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  <span>• {doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  • {doc.date} {doc.time ? `· ${doc.time}` : ''}
                </div>
              </div>
            </div>

            {/* View Button */}
            <button
              onClick={() => onOpenViewer(doc.id)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-800 shadow-2xs transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-700" />
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
