import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Radio, Play, Pause, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  onResetData: () => void;
  operatorName: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  setIsSimulating,
  onResetData,
  operatorName,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#181A1D] border-b border-[#2A2D32] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Brand & Terminal Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#FFFFFF] shadow-[0_0_8px_#ffffff]" />
          <h1 className="font-tabular font-bold tracking-wider text-sm text-[#FFFFFF] uppercase">
            STACKY <span className="text-[#8C929B] font-normal">// EUROPEAN FLEET & LOGISTICS CORE</span>
          </h1>
        </div>
        <span className="hidden md:inline-block text-[#8C929B] font-tabular border-l border-[#2A2D32] pl-3">
          TEN-T CORRIDOR & EC 561/2006 TACHOGRAPH TERMINAL
        </span>
      </div>

      {/* Center Operational Status Readouts */}
      <div className="flex items-center gap-4 text-[#8C929B] font-tabular">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0F1113] border border-[#2A2D32]">
          <span className="text-[#8C929B]">DISPATCHER:</span>
          <span className="text-[#E1E4E8] font-medium">{operatorName}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0F1113] border border-[#2A2D32]">
          <Clock className="w-3.5 h-3.5 text-[#8C929B]" />
          <span className="text-[#E1E4E8] tracking-widest">{utcTime ? `${utcTime.replace('UTC', 'CET (UTC+1)')}` : '15:32:09 CET'}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0F1113] border border-[#2A2D32]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E6E5D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4E6E5D]"></span>
          </span>
          <span className="text-[#8C929B]">EC 561/2006:</span>
          <span className="text-[#8cd1aa] font-semibold">COMPLIANT</span>
        </div>
      </div>

      {/* Right Controls: Telemetry Stream & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`mta-btn px-2.5 py-1 text-xs font-tabular flex items-center gap-1.5 border ${
            isSimulating
              ? 'bg-[#181A1D] border-[#4E6E5D] text-[#8cd1aa]'
              : 'bg-[#181A1D] border-[#8C734B] text-[#e5bf7d]'
          }`}
          title={isSimulating ? 'Pause Live Telemetry Stream' : 'Resume Live Telemetry Stream'}
        >
          {isSimulating ? (
            <>
              <Radio className="w-3 h-3 text-[#4E6E5D] animate-pulse" />
              <span>LIVE TELEMETRY: 10Hz</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-[#e5bf7d]" />
              <span>TELEMETRY: PAUSED</span>
            </>
          )}
        </button>

        <button
          onClick={onResetData}
          className="mta-btn mta-btn-primary px-2.5 py-1 text-xs font-tabular flex items-center gap-1 text-[#8C929B] hover:text-[#FFFFFF]"
          title="Reset to Baseline Simulation State"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>
    </header>
  );
};
