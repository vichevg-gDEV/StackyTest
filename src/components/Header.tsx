import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Radio, Pause, RefreshCw, Plus, Truck, Bell } from 'lucide-react';

interface HeaderProps {
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  onResetData: () => void;
  onOpenNewPackageModal: () => void;
  operatorName: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  setIsSimulating,
  onResetData,
  onOpenNewPackageModal,
  operatorName,
}) => {
  const [cetTime, setCetTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'CET',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCetTime(`${timeStr} CET`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-slate-900">
              STACKY
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              EU Terminal
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            European Freight & Fleet Logistics Dispatch // TEN-T Corridor Core
          </p>
        </div>
      </div>

      {/* Center Operational Readouts */}
      <div className="flex items-center gap-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-400 font-medium">DISPATCHER:</span>
          <span className="text-slate-800 font-semibold">{operatorName}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-800 font-medium">{cetTime || '12:00:00 CET'}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>EC 561/2006 Compliant</span>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* NEW PACKAGE ENTRY BUTTON */}
        <button
          onClick={onOpenNewPackageModal}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Package Entry</span>
        </button>

        {/* Live Simulation Toggle */}
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
            isSimulating
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
          title={isSimulating ? 'Pause Live Fleet Simulation' : 'Resume Live Fleet Simulation'}
        >
          {isSimulating ? (
            <>
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Telemetry: Active</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-600" />
              <span>Paused</span>
            </>
          )}
        </button>

        {/* Reset State */}
        <button
          onClick={onResetData}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Reset to Baseline Simulation State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
