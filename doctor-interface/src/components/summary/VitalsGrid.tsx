'use client';

import React from 'react';
import { PatientVitals } from '@/types';
import { Activity, Droplets, Heart, Thermometer, Scale, Gauge } from 'lucide-react';

interface VitalsGridProps {
  vitals: PatientVitals;
}

export const VitalsGrid: React.FC<VitalsGridProps> = ({ vitals }) => {
  const items = [
    {
      label: 'BP',
      icon: Gauge,
      value: vitals.blood_pressure.value,
      source: vitals.blood_pressure.timestamp || 'Kiosk · 09:12 AM',
      isAbnormal: vitals.blood_pressure.isAbnormal,
      iconColor: vitals.blood_pressure.isAbnormal ? 'text-red-600' : 'text-teal-700',
      bgColor: vitals.blood_pressure.isAbnormal ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200',
      valColor: vitals.blood_pressure.isAbnormal ? 'text-red-600' : 'text-slate-900',
    },
    {
      label: 'SpO₂',
      icon: Droplets,
      value: vitals.spo2.value,
      source: vitals.spo2.timestamp || 'Kiosk · 09:12 AM',
      isAbnormal: vitals.spo2.isAbnormal,
      iconColor: 'text-blue-600',
      bgColor: 'bg-white border-slate-200',
      valColor: 'text-slate-900',
    },
    {
      label: 'Pulse',
      icon: Heart,
      value: vitals.pulse.value,
      source: vitals.pulse.timestamp || 'Kiosk · 09:12 AM',
      isAbnormal: vitals.pulse.isAbnormal,
      iconColor: vitals.pulse.isAbnormal ? 'text-red-600' : 'text-blue-600',
      bgColor: vitals.pulse.isAbnormal ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200',
      valColor: vitals.pulse.isAbnormal ? 'text-red-600' : 'text-slate-900',
    },
    {
      label: 'Temperature',
      icon: Thermometer,
      value: vitals.temperature.value,
      source: vitals.temperature.timestamp || 'Kiosk · 09:12 AM',
      isAbnormal: vitals.temperature.isAbnormal,
      iconColor: vitals.temperature.isAbnormal ? 'text-red-600' : 'text-cyan-600',
      bgColor: vitals.temperature.isAbnormal ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200',
      valColor: vitals.temperature.isAbnormal ? 'text-red-600' : 'text-slate-900',
    },
    {
      label: 'Blood Sugar',
      icon: Droplets,
      value: vitals.blood_sugar.value,
      source: vitals.blood_sugar.timestamp || 'Self reported · 09:10 AM',
      isAbnormal: vitals.blood_sugar.isAbnormal,
      iconColor: 'text-rose-600',
      bgColor: 'bg-white border-slate-200',
      valColor: 'text-slate-900',
    },
    {
      label: 'Weight',
      icon: Scale,
      value: vitals.weight.value,
      source: vitals.weight.timestamp || 'Kiosk · 09:12 AM',
      isAbnormal: vitals.weight.isAbnormal,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-white border-slate-200',
      valColor: 'text-slate-900',
    },
  ];

  return (
    <div className="mb-6">
      {/* Vitals Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900">Vitals</h3>
          <span className="text-xs text-slate-400">Collected at MediKiosk</span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          Recorded: 03 Sep 2026, 09:12 AM
        </div>
      </div>

      {/* 6 Vital Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border ${item.bgColor} shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg bg-slate-50 ${item.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className={`text-base lg:text-lg font-extrabold ${item.valColor} leading-tight`}>
                  {item.value}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate" title={item.source}>
                  {item.source}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
