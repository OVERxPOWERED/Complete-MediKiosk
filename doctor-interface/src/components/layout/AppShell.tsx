'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { Toast } from '@/components/ui/Toast';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {children}
        <Toast />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-50 font-sans overflow-hidden">
      {/* Left Full-Height Navigation Rail */}
      <AppSidebar />

      {/* Right Content Column: Header on top, Main scrollable content below */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Toast />
    </div>
  );
};
