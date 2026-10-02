import React from 'react';
import { SystemAlert } from '../types';
import { AlertTriangle, AlertCircle, ShieldAlert, Check, Bell, ShieldCheck } from 'lucide-react';

interface SystemAlertsBannerProps {
  alerts: SystemAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const SystemAlertsBanner: React.FC<SystemAlertsBannerProps> = ({
  alerts,
  onAcknowledgeAlert,
  onSelectVehicle,
}) => {
  return (
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] flex flex-col font-tabular">
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[#2A2D32] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-[#e5bf7d]" />
          <span className="font-semibold text-xs text-[#FFFFFF] tracking-wider uppercase">
            SECTION E: EUROPEAN SYSTEM ALERTS & EC 561/2006 TACHOGRAPH MONITOR
          </span>
        </div>
        <span className="text-[11px] text-[#8C929B]">
          [{alerts.filter((a) => !a.acknowledged).length} UNRESOLVED REGULATORY FLAGS]
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="p-2 space-y-1.5 max-h-36 overflow-y-auto divide-y divide-[#2A2D32]/40">
        {alerts.length === 0 ? (
          <div className="text-center py-2 text-xs text-[#8cd1aa] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8cd1aa]" />
            <span>ALL FLEET TELEMETRY & SMART TACHOGRAPH CYCLES COMPLIANT // ZERO ACTIVE INFRINGEMENTS</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarn = alert.severity === 'warn';

            return (
              <div
                key={alert.id}
                className={`pt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
                  alert.acknowledged ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <div className="flex items-start gap-2 flex-1 min-w-[280px]">
                  <span
                    className={`px-1 py-0.2 text-[10px] font-bold border shrink-0 ${
                      isCritical
                        ? 'bg-[#7A3E3E]/30 border-[#7A3E3E] text-[#e88d8d]'
                        : isWarn
                        ? 'bg-[#8C734B]/30 border-[#8C734B] text-[#e5bf7d]'
                        : 'bg-[#2A2D32] border-[#8C929B] text-[#E1E4E8]'
                    }`}
                  >
                    {isCritical ? '[!]' : isWarn ? '[!]' : '[*]'}
                  </span>

                  <div className="flex-1">
                    <span className="text-[#8C929B] mr-2 text-[11px]">
                      {alert.timestamp}
                    </span>
                    <span
                      className={`cursor-pointer hover:underline ${
                        isCritical
                          ? 'text-[#e88d8d] font-bold'
                          : isWarn
                          ? 'text-[#e5bf7d]'
                          : 'text-[#E1E4E8]'
                      }`}
                      onClick={() => alert.vehicle_id && onSelectVehicle && onSelectVehicle(alert.vehicle_id)}
                    >
                      {alert.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {alert.vehicle_id && (
                    <button
                      onClick={() => onSelectVehicle && onSelectVehicle(alert.vehicle_id!)}
                      className="px-2 py-0.5 border border-[#2A2D32] hover:border-[#FFFFFF] text-[#8C929B] hover:text-[#FFFFFF]"
                    >
                      FOCUS {alert.vehicle_id}
                    </button>
                  )}
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2 py-0.5 border border-[#4E6E5D] bg-[#4E6E5D]/20 text-[#8cd1aa] hover:bg-[#4E6E5D]/40"
                    >
                      ACK
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
