import React, { useState } from 'react';
import { Vehicle, Manifest, Driver } from '../types';
import { Send, Shuffle, CheckCircle, AlertTriangle, ShieldAlert, ShieldCheck, FileCheck, Navigation } from 'lucide-react';
import { formatMass } from '../utils/formatters';

interface AssignmentControlPanelProps {
  vehicles: Vehicle[];
  manifests: Manifest[];
  drivers: Driver[];
  selectedVehicleId: string | null;
  onAssignManifest: (manifestId: string, vehicleId: string, driverId: string) => { success: boolean; errors: string[] };
  onRerouteVehicle: (vehicleId: string, detourReason: string) => void;
  onOpenBolModal?: (manifestId: string) => void;
}

export const AssignmentControlPanel: React.FC<AssignmentControlPanelProps> = ({
  vehicles,
  manifests,
  drivers,
  selectedVehicleId,
  onAssignManifest,
  onRerouteVehicle,
  onOpenBolModal,
}) => {
  const [selectedManifestId, setSelectedManifestId] = useState<string>(
    manifests[0]?.manifest_id || ''
  );
  const [targetDriverId, setTargetDriverId] = useState<string>(
    drivers[0]?.driver_id || ''
  );
  const [targetVehicleId, setTargetVehicleId] = useState<string>(
    selectedVehicleId || vehicles[0]?.vehicle_id || ''
  );
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    success: boolean;
    messages: string[];
  }>({
    tested: false,
    success: true,
    messages: [],
  });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Sync with prop when selected from outside
  React.useEffect(() => {
    if (selectedVehicleId) {
      setTargetVehicleId(selectedVehicleId);
      const vehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId);
      if (vehicle) {
        setTargetDriverId(vehicle.driver_id);
      }
    }
  }, [selectedVehicleId, vehicles]);

  const handleExecuteAssignment = () => {
    const res = onAssignManifest(selectedManifestId, targetVehicleId, targetDriverId);
    if (!res.success) {
      setValidationResult({
        tested: true,
        success: false,
        messages: res.errors,
      });
      setSyncStatus(null);
    } else {
      setValidationResult({
        tested: true,
        success: true,
        messages: [
          'Driver within EC 561/2006 tachograph driving limits (<4.5h continuous): VERIFIED',
          'Payload mass within Directive 96/53/EC 40t GVWR statutory envelope: VERIFIED',
          'Cargo package dimensions fit 13.6m Euro-trailer internal envelope (33 EPAL): VERIFIED',
        ],
      });
      setSyncStatus('TRANSMITTED // e-CMR & TEN-T WAYPOINTS SYNCED TO IN-CAB DTCO TERMINAL');
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleQuickReroute = () => {
    onRerouteVehicle(targetVehicleId, 'Alpine transit sectoral delay // BAB 7 detour applied');
    setSyncStatus(`TEN-T RE-ROUTE SENT TO ${targetVehicleId} TELEMATICS UNIT`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 tracking-tight">
              Assignment & Dispatch Control
            </h3>
            <span className="text-[10px] text-slate-500">e-CMR Consignment Transmission & Driver Dispatch</span>
          </div>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Target Unit: <strong className="text-slate-800 font-mono">{targetVehicleId}</strong>
        </span>
      </div>

      <div className="p-4 space-y-3.5 text-xs">
        {/* Select Pending Manifest */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Select Pending e-CMR Consignment:
          </label>
          <select
            value={selectedManifestId}
            onChange={(e) => {
              setSelectedManifestId(e.target.value);
              setValidationResult({ tested: false, success: true, messages: [] });
            }}
            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs font-medium"
          >
            {manifests.map((m) => (
              <option key={m.manifest_id} value={m.manifest_id}>
                [{m.manifest_id}] {m.cargo_description.slice(0, 38)}... | {m.metrics.euro_pallets_count} EPAL | {formatMass(m.metrics.total_mass_kg)} | {m.origin_code} → {m.destination_code}
              </option>
            ))}
          </select>
        </div>

        {/* Select Target Vehicle & Driver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assigned European HGV:
            </label>
            <select
              value={targetVehicleId}
              onChange={(e) => setTargetVehicleId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs font-medium"
            >
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.vehicle_id} ({v.plate_number}) - {v.make_model} [{v.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assigned Driver (Tachograph Audit):
            </label>
            <select
              value={targetDriverId}
              onChange={(e) => setTargetDriverId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs font-medium"
            >
              {drivers.map((d) => {
                const contLeftMins = Math.max(0, 270 - d.continuous_drive_minutes);
                return (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.driver_name} [{d.country}] (Drive Rem: {Math.floor(contLeftMins / 60)}h {contLeftMins % 60}m {d.tacho_status === 'BREAK_DUE' ? '⚠️ BREAK DUE' : '✅'})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Instant Validation Feedback Box */}
        {validationResult.tested && (
          <div
            className={`p-3 rounded-xl border text-xs space-y-1 ${
              validationResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              {validationResult.success ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Pre-Dispatch European Regulatory Checks Passed:</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>European Regulatory Violation Detected:</span>
                </>
              )}
            </div>
            {validationResult.messages.map((msg, i) => (
              <div key={i} className="pl-5 text-[11px] text-slate-700">
                • {msg}
              </div>
            ))}
          </div>
        )}

        {/* Sync notification message */}
        {syncStatus && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Action Triggers */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleQuickReroute}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex-1 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>TEN-T Reroute</span>
          </button>

          <button
            onClick={handleExecuteAssignment}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex-1 sm:flex-initial flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit e-CMR</span>
          </button>

          {onOpenBolModal && (
            <button
              onClick={() => onOpenBolModal(selectedManifestId)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              title="Inspect Electronic Consignment Note (e-CMR)"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Inspect e-CMR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
