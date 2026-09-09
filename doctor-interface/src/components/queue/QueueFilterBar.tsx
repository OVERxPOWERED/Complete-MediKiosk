'use client';

import React, { useEffect, useRef } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface QueueFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'New' | 'Reviewed';
  onStatusFilterChange: (s: 'all' | 'New' | 'Reviewed') => void;
  sortBy: 'queue' | 'wait' | 'priority';
  onSortByChange: (s: 'queue' | 'wait' | 'priority') => void;
  onOpenScanner: () => void;
}

export const QueueFilterBar: React.FC<QueueFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by token number, patient name or UHID..."
          className="w-full pl-10 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all shadow-2xs"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Filter & Sort Dropdowns */}
      <div className="flex items-center gap-2.5">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'New' | 'Reviewed')}
            className="pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700 appearance-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Patients</option>
            <option value="New">New Only</option>
            <option value="Reviewed">Reviewed Only</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'queue' | 'wait' | 'priority')}
            className="pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700 appearance-none cursor-pointer shadow-2xs"
          >
            <option value="queue">Sort by Queue</option>
            <option value="wait">Sort by Wait Time</option>
            <option value="priority">Sort by Severity</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
