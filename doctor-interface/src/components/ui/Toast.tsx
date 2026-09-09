'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();
  const [countdown, setCountdown] = useState<number>(toast?.undoDuration || 4);

  useEffect(() => {
    if (!toast) return;

    if (toast.undoable && toast.undoDuration) {
      setCountdown(toast.undoDuration);
      const startTime = Date.now();
      const durationMs = toast.undoDuration * 1000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
        setCountdown(remaining);
        if (elapsed >= durationMs) {
          clearInterval(interval);
          hideToast();
        }
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Auto close after 4.5s for normal toasts
      const timer = setTimeout(() => {
        hideToast();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const isUndoable = toast.undoable;

  return (
    <AnimatePresence>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`relative overflow-hidden flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl border ${
            isUndoable
              ? 'bg-[#065f46] text-white border-emerald-600'
              : toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : toast.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {/* Toast Icon */}
          {toast.type === 'error' ? (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : isUndoable ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-teal-300 shrink-0" />
          )}

          {/* Toast text */}
          <div className="flex flex-col pr-1">
            <span className="text-sm font-medium leading-snug">{toast.title}</span>
            {toast.subtitle && (
              <span className="text-xs text-slate-300 leading-snug">{toast.subtitle}</span>
            )}
          </div>

          {/* Undo Button */}
          {isUndoable && toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo?.();
                hideToast();
              }}
              className="ml-2 px-3 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors flex items-center gap-1 cursor-pointer border border-white/20"
            >
              Undo ({countdown}s)
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={hideToast}
            className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Countdown timer line for undoable toast */}
          {isUndoable && toast.undoDuration && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: toast.undoDuration, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-emerald-400/60"
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
