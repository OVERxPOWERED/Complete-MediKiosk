'use client';

import React, { useState } from 'react';
import { AyushAssessmentData } from '@/types';
import { Leaf, ChevronDown, ChevronUp, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AyushAssessmentProps {
  ayush?: AyushAssessmentData;
  initialExpanded?: boolean;
}

export const AyushAssessment: React.FC<AyushAssessmentProps> = ({
  ayush,
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  if (!ayush) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Title & Badge */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                AYUSH Assessment
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                AI-generated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Traditional prakriti & dosha constitution assessment
            </p>
          </div>
        </button>

        {/* 4 Summary Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 flex-1 lg:max-w-2xl px-1">
          <div className="bg-white/80 backdrop-blur-xs border border-emerald-100 rounded-xl px-3 py-2 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Prakriti
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {ayush.prakriti || 'Not assessed'}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-emerald-100 rounded-xl px-3 py-2 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Vikriti
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {ayush.vikriti || 'Samadosha'}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-emerald-100 rounded-xl px-3 py-2 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Agni
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {ayush.agni || 'Madhyama'}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-emerald-100 rounded-xl px-3 py-2 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Koshtha
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {ayush.koshtha || 'Madhyama'}
            </div>
          </div>
        </div>

        {/* Expand / Collapse toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-end lg:self-center p-2 text-slate-500 hover:text-slate-800 hover:bg-emerald-100/50 rounded-xl transition-colors cursor-pointer"
          title={isExpanded ? 'Collapse AYUSH details' : 'Expand AYUSH details'}
          aria-label="Toggle AYUSH Assessment Details"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Expandable Details Tray */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-emerald-200/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="bg-white/60 p-3 rounded-xl border border-emerald-100">
                <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Clinical Correlation & Diet Advice
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Patient exhibits predominant {ayush.prakriti} constitution with acute {ayush.vikriti}. Warm, easily digestible foods recommended. Avoid excessive cold or dry foods and irregular meal schedules.
                </p>
              </div>

              <div className="bg-white/60 p-3 rounded-xl border border-emerald-100">
                <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Metabolic & Bowel Function
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Agni is {ayush.agni} (balanced digestive fire) with {ayush.koshtha} koshtha (regular elimination pattern). Compatible with standard oral pharmacotherapy without special gastro-protective modifications.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
