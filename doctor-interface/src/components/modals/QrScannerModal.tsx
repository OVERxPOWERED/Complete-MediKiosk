'use client';

import React, { useState } from 'react';
import { QrCode, X, ArrowRight, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (token: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [tokenInput, setTokenInput] = useState<string>('A1052');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onScan(tokenInput.trim());
      onClose();
    }
  };

  const handleQuickPreset = (token: string) => {
    onScan(token);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Scan Patient Wristband QR
            </h3>
            <p className="text-xs text-slate-500">
              Point USB HID scanner or select a demo patient below
            </p>
          </div>
        </div>

        {/* Viewfinder Graphic */}
        <div className="relative w-full h-48 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden mb-6 border border-slate-800">
          {/* Subtle camera view background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Scanner targeting frame */}
          <div className="relative w-36 h-36 border-2 border-emerald-500/60 rounded-xl flex items-center justify-center">
            {/* Corner marks */}
            <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

            {/* Scanning Laser Animation */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#10b981]" />

            <div className="text-center font-mono text-[10px] text-emerald-400/80 mt-16 font-semibold tracking-wider uppercase">
              Ready to Scan
            </div>
          </div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Manual Token or UHID Entry
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder="e.g. A1052 or UHID778901"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Demo Preset Buttons */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Wristbands (Click to simulate scan):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPreset('A1052')}
              className="p-2.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-bold text-red-950 flex items-center justify-between">
                <span>Rohit Mehta</span>
                <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-red-200">
                  A1052
                </span>
              </div>
              <div className="text-[10px] text-red-700 mt-0.5">
                ♥ Cardiac Red Flag · Chest Pain
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('A1047')}
              className="p-2.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-bold text-red-950 flex items-center justify-between">
                <span>Pooja Singh</span>
                <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-red-200">
                  A1047
                </span>
              </div>
              <div className="text-[10px] text-red-700 mt-0.5">
                🌡 High Fever (39.2°C)
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('A1044')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                <span>Amit Kumar</span>
                <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-amber-200">
                  A1044
                </span>
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">
                ! Critical BP 180/110
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('A1043')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                <span>Sunita Patel</span>
                <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  A1043
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                ✓ Non-Emergency · Cough
              </div>
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Physical USB HID barcode scanner input is also supported automatically.</span>
        </div>
      </motion.div>
    </div>
  );
};
