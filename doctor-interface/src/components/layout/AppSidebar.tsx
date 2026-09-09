'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Settings } from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();

  // Patients tab removed per user request (Issue 2)
  const navItems = [
    {
      label: 'Queue',
      href: '/queue',
      icon: Users,
      isActive: pathname === '/queue' || pathname.startsWith('/patient'),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      isActive: pathname.startsWith('/settings'),
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-screen select-none z-20">
      {/* Top Brand Logo & Nav */}
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center border-b border-slate-100">
          <Link href="/queue" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#065f46] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-300">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                MediKiosk
              </div>
              <div className="text-[11px] text-[#065f46] font-semibold tracking-wide">
                Care Closer to You
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-3.5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  active
                    ? 'bg-[#ebf5f1] text-[#065f46] font-bold shadow-2xs border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-[#065f46]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Botanical Aesthetic Graphic matching 2A */}
      <div className="p-5 flex flex-col items-start border-t border-slate-100 bg-gradient-to-b from-transparent to-emerald-50/20">
        <div className="w-24 h-24 mb-2 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 90C20 60 50 30 80 20C75 55 45 85 20 90Z"
              fill="#10b981"
              fillOpacity="0.2"
            />
            <path
              d="M20 90C40 75 70 65 90 60C65 75 40 85 20 90Z"
              fill="#065f46"
              fillOpacity="0.3"
            />
            <path
              d="M20 90C25 50 15 35 10 20C30 35 35 60 20 90Z"
              fill="#10b981"
              fillOpacity="0.25"
            />
          </svg>
        </div>
        <div className="w-6 h-1 bg-[#065f46] rounded-full mb-2" />
        <span className="text-xs font-bold text-slate-800 leading-snug">
          A healthier today.
        </span>
        <span className="text-xs font-normal text-slate-500 leading-snug">
          A brighter tomorrow.
        </span>
      </div>
    </aside>
  );
};
