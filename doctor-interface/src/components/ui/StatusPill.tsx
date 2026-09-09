'use client';

import React from 'react';
import { PatientStatus } from '@/types';

interface StatusPillProps {
  status: PatientStatus;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const isNew = status === 'New';

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  if (isNew) {
    return (
      <span
        className={`inline-flex items-center justify-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
      >
        New
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
    >
      Reviewed
    </span>
  );
};
