import React from 'react';
import { SystemAlert } from '../types';
import { AlertTriangle, AlertCircle, ShieldAlert, Check, Bell, ShieldCheck, Crosshair } from 'lucide-react';

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
  const unresolvedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-900 tracking-tight">
              European Regulatory Alerts & Smart Tachograph Monitor
            </span>
            <span className="text-[10px] text-slate-400 ml-2">EC 561/2006 & Alpine Transit Restrictions</span>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          unresolvedAlerts.length > 0 
            ? 'bg-amber-50 text-amber-800 border-amber-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {unresolvedAlerts.length} Unresolved Flags
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="p-3 space-y-2 max-h-36 overflow-y-auto divide-y divide-slate-100">
        {alerts.length === 0 ? (
          <div className="text-center py-2.5 text-xs text-emerald-700 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All European fleet telemetry & driver tachograph cycles compliant // Zero active infringements</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarn = alert.severity === 'warn';

            return (
              <div
                key={alert.id}
                className={`pt-2 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
                  alert.acknowledged ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-[280px]">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${
                      isCritical
                        ? 'bg-rose-100 border-rose-200 text-rose-800'
                        : isWarn
                        ? 'bg-amber-100 border-amber-200 text-amber-800'
                        : 'bg-blue-100 border-blue-200 text-blue-800'
                    }`}
                  >
                    {isCritical ? 'CRITICAL' : isWarn ? 'WARNING' : 'INFO'}
                  </span>

                  <div className="flex-1">
                    <span className="text-slate-400 font-mono mr-2 text-[11px]">
                      {alert.timestamp}
                    </span>
                    <span
                      className={`cursor-pointer hover:underline font-medium ${
                        isCritical
                          ? 'text-rose-700 font-bold'
                          : isWarn
                          ? 'text-slate-900 font-semibold'
                          : 'text-slate-700'
                      }`}
                      onClick={() => alert.vehicle_id && onSelectVehicle && onSelectVehicle(alert.vehicle_id)}
                    >
                      {alert.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {alert.vehicle_id && (
                    <button
                      onClick={() => onSelectVehicle && onSelectVehicle(alert.vehicle_id!)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <Crosshair className="w-3 h-3 text-slate-400" />
                      <span>Focus {alert.vehicle_id}</span>
                    </button>
                  )}
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold transition-colors"
                    >
                      Acknowledge
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
