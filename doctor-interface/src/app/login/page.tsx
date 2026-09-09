'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LeftHeroPanel } from '@/components/auth/LeftHeroPanel';
import { HprIdCard } from '@/components/auth/HprIdCard';
import { OtpVerifyCard } from '@/components/auth/OtpVerifyCard';
import { CounterSelectCard } from '@/components/auth/CounterSelectCard';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sun, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, setWorkspace, showToast } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hprId, setHprId] = useState<string>('HPR123456');

  const handleQuickLogin = () => {
    login('HPR123456', '4219');
    setWorkspace({
      department: 'General Medicine OPD',
      desk: 'Desk 4',
      hospital: 'District Hospital, Bhopal',
    });
    showToast({
      title: 'Demo Session Authenticated',
      subtitle: 'Signed in as Dr. Anjali Verma (Consultant – General Medicine)',
      type: 'success',
    });
    router.push('/queue');
  };

  const handleHprSubmit = (enteredHprId: string) => {
    setHprId(enteredHprId);
    setStep(2);
  };

  const handleOtpVerified = () => {
    setStep(3);
  };

  const handleCounterSelected = (department: string, desk: string) => {
    login(hprId);
    setWorkspace({
      department,
      desk,
      hospital: 'District Hospital, Bhopal',
    });
    showToast({
      title: 'Welcome, Dr. Anjali Verma',
      subtitle: `Working at ${department} · ${desk}`,
      type: 'success',
    });
    router.push('/queue');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-100/70 overflow-hidden font-sans">
      {/* Left Brand Panel */}
      <LeftHeroPanel />

      {/* Right Login Container */}
      <div className="flex-1 flex flex-col justify-between p-6 lg:p-12 relative overflow-y-auto">
        {/* Top Utility Nav */}
        <div className="flex items-center justify-end gap-5 text-xs text-slate-500 font-medium">
          <button
            onClick={handleQuickLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-800 text-white hover:bg-teal-900 transition-all font-semibold shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
            <span>⚡ Quick Demo Access</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer">
            <Sun className="w-4 h-4" />
            <span>Dark Mode</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            <span>Need Help?</span>
          </button>
        </div>

        {/* Center Card with Smooth Transitions */}
        <div className="my-auto flex items-center justify-center py-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full flex justify-center"
              >
                <HprIdCard onNext={handleHprSubmit} onQuickLogin={handleQuickLogin} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full flex justify-center"
              >
                <OtpVerifyCard
                  hprId={hprId}
                  onNext={handleOtpVerified}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full flex justify-center"
              >
                <CounterSelectCard
                  onComplete={handleCounterSelected}
                  onBack={() => setStep(2)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tagline */}
        <div className="flex items-center justify-end text-xs text-slate-400 gap-2">
          <span className="w-4 h-0.5 bg-teal-800" />
          <span>Building a smarter, healthier India.</span>
        </div>
      </div>
    </div>
  );
}
