'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Calendar,
  Bell,
  ChevronDown,
  RefreshCw,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const AppHeader: React.FC = () => {
  const router = useRouter();
  const {
    doctor,
    currentWorkspace,
    setWorkspace,
    syncActions,
    isOnline,
    toggleOnlineStatus,
    syncNow,
    logout,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('09:14 AM');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = String(hours % 12 || 12).padStart(2, '0');
      setCurrentTime(`${formattedHours}:${minutes} ${ampm}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = syncActions.filter((a) => a.status === 'Pending').length;

  const notifications = [
    {
      id: 'notif-1',
      title: '🚨 High-Risk Cardiac Triage',
      desc: 'Rohit Mehta (A1052) reported severe chest pain with BP 148/92 mmHg.',
      time: '09:12 AM',
      href: '/patient/A1052',
      type: 'critical',
    },
    {
      id: 'notif-2',
      title: '🌡️ High Fever Intake',
      desc: 'Pooja Singh (A1047) checked in at Kiosk 02 with acute fever (39.2°C).',
      time: '09:05 AM',
      href: '/patient/A1047',
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: '📑 Scanned Records Synced',
      desc: '12-lead ECG report and blood panel attached for A1052.',
      time: '08:58 AM',
      href: '/patient/A1052',
      type: 'info',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shadow-2xs z-30 shrink-0 select-none">
      {/* Left: OPD Counter Dropdown (Starts directly at the left as in 2A) */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 transition-all text-left cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col pr-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                {currentWorkspace.department} · {currentWorkspace.desk}
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <span className="text-[11px] text-slate-500">{currentWorkspace.hospital}</span>
            </div>
          </button>

          {/* Workspace dropdown */}
          {showWorkspaceMenu && (
            <div className="absolute top-full mt-1.5 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Desk / OPD
              </div>
              {[
                { department: 'General Medicine OPD', desk: 'Desk 4' },
                { department: 'General Medicine OPD', desk: 'Desk 2' },
                { department: 'Ayurveda & AYUSH OPD', desk: 'Counter 1' },
                { department: 'Cardiology Referral Desk', desk: 'Desk 1' },
              ].map((ws, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setWorkspace({ ...currentWorkspace, ...ws });
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 transition-colors ${
                    currentWorkspace.desk === ws.desk &&
                    currentWorkspace.department === ws.department
                      ? 'bg-emerald-50/70 text-emerald-800 font-semibold'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{ws.department} · {ws.desk}</span>
                  <span className="text-[10px] text-slate-400">{currentWorkspace.hospital}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Date/Time, Online/Sync Indicators, Notifications & Doctor Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date & Time matching 2A */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium text-slate-700">Thu, 3 Sep 2026</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-800">{currentTime}</span>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleOnlineStatus}
            title="Click to simulate Online / Offline network status"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          {pendingCount > 0 && (
            <button
              onClick={syncNow}
              title="Actions cached offline. Click to sync now."
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <span>{pendingCount} pending sync</span>
              <RefreshCw className="w-3 h-3 text-amber-700" />
            </button>
          )}
        </div>

        {/* Notification Bell with interactive popover (Fixes Issue 5) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center relative text-slate-700 shadow-2xs transition-colors cursor-pointer"
            aria-label="Clinical Notifications"
            title="Clinical Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-900">
                    Clinical Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      router.push(n.href);
                    }}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile Chip matching 2A */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
              <img
                src="/doctor-avatar.jpg"
                alt="Dr. Anjali Verma"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {doctor?.name || 'Dr. Anjali Verma'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                HPR ID: {doctor?.hpr_id || 'HPR123456'}
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{doctor?.name}</div>
                <div className="text-[11px] text-slate-500">{doctor?.degrees}</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  ✓ Verified via ABDM
                </div>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                Workstation Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
