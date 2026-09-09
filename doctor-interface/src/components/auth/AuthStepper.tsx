'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface AuthStepperProps {
  currentStep: 1 | 2 | 3;
}

export const AuthStepper: React.FC<AuthStepperProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'HPR ID' },
    { number: 2, label: 'Verify OTP' },
    { number: 3, label: 'Select OPD' },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-7 px-1 select-none">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#065f46] text-white'
                    : isActive
                    ? 'bg-[#065f46] text-white ring-2 ring-[#065f46]/20'
                    : 'bg-slate-200/80 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 transition-colors ${
                  currentStep > idx + 1 ? 'bg-[#065f46]' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
