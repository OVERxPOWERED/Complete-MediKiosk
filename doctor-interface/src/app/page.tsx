'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/queue');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-xl font-black">M</span>
        </div>
        <div className="text-sm font-semibold tracking-wide text-emerald-300">
          Loading MediKiosk Workstation...
        </div>
      </div>
    </div>
  );
}
