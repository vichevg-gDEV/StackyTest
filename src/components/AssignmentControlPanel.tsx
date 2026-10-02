import React, { useState } from 'react';
import { Vehicle, Manifest, Driver } from '../types';
import { Send, Shuffle, CheckCircle, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
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
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] flex flex-col font-tabular">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2A2D32] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-[#E1E4E8]" />
          <span className="font-semibold text-xs text-[#FFFFFF] tracking-wider uppercase">
            SECTION D: EUROPEAN ASSIGNMENT CONTROL PANEL
          </span>
        </div>
        <span className="text-[11px] text-[#8C929B]">
          TARGET UNIT: <span className="text-[#FFFFFF] font-bold">{targetVehicleId}</span>
        </span>
      </div>

      <div className="p-3 space-y-3 text-xs">
        {/* Select Pending Manifest */}
        <div>
          <label className="block text-[11px] text-[#8C929B] mb-1">
            SELECT PENDING e-CMR CONSIGNMENT:
          </label>
          <select
            value={selectedManifestId}
            onChange={(e) => {
              setSelectedManifestId(e.target.value);
              setValidationResult({ tested: false, success: true, messages: [] });
            }}
            className="w-full bg-[#0F1113] border border-[#2A2D32] px-2.5 py-1.5 text-xs text-[#E1E4E8] focus:border-[#FFFFFF] focus:outline-none rounded-none"
          >
            {manifests.map((m) => (
              <option key={m.manifest_id} value={m.manifest_id}>
                [{m.manifest_id}] {m.cargo_description.slice(0, 36)}... | {m.metrics.euro_pallets_count} EPAL | {formatMass(m.metrics.total_mass_kg)} | {m.origin_code} → {m.destination_code}
              </option>
            ))}
          </select>
        </div>

        {/* Select Target Vehicle & Driver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-[#8C929B] mb-1">
              ASSIGNED EUROPEAN HGV:
            </label>
            <select
              value={targetVehicleId}
              onChange={(e) => setTargetVehicleId(e.target.value)}
              className="w-full bg-[#0F1113] border border-[#2A2D32] px-2.5 py-1.5 text-xs text-[#E1E4E8] focus:border-[#FFFFFF] focus:outline-none rounded-none"
            >
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.vehicle_id} ({v.plate_number}) - {v.make_model} [{v.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#8C929B] mb-1">
              TARGET DRIVER (EC 561/2006 AUDIT):
            </label>
            <select
              value={targetDriverId}
              onChange={(e) => setTargetDriverId(e.target.value)}
              className="w-full bg-[#0F1113] border border-[#2A2D32] px-2.5 py-1.5 text-xs text-[#E1E4E8] focus:border-[#FFFFFF] focus:outline-none rounded-none"
            >
              {drivers.map((d) => {
                const contLeftMins = Math.max(0, 270 - d.continuous_drive_minutes);
                return (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.driver_name} [{d.country}] (Drive Rem: {Math.floor(contLeftMins / 60)}h {contLeftMins % 60}m {d.tacho_status === 'BREAK_DUE' ? '[BREAK DUE]' : ''})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Instant Validation Feedback Box */}
        {validationResult.tested && (
          <div
            className={`p-2.5 border text-[11px] space-y-1 ${
              validationResult.success
                ? 'bg-[#4E6E5D]/15 border-[#4E6E5D] text-[#8cd1aa]'
                : 'bg-[#7A3E3E]/20 border-[#7A3E3E] text-[#e88d8d]'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {validationResult.success ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>PRE-DISPATCH EUROPEAN LOGIC CHECKS PASSED:</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>EUROPEAN REGULATORY VIOLATION DETECTED:</span>
                </>
              )}
            </div>
            {validationResult.messages.map((msg, i) => (
              <div key={i} className="pl-4">
                • {msg}
              </div>
            ))}
          </div>
        )}

        {/* Sync notification message */}
        {syncStatus && (
          <div className="p-2 bg-[#4E6E5D]/20 border border-[#4E6E5D] text-[#8cd1aa] text-[11px] font-bold text-center">
            {syncStatus}
          </div>
        )}

        {/* Action Triggers */}
        <div className="pt-2 border-t border-[#2A2D32] flex flex-wrap items-center gap-2">
          <button
            onClick={handleQuickReroute}
            className="mta-btn px-3 py-2 bg-[#181A1D] border border-[#2A2D32] hover:border-[#E1E4E8] text-[#8C929B] hover:text-[#FFFFFF] text-xs flex-1 flex items-center justify-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>TEN-T RE-ROUTE</span>
          </button>

          <button
            onClick={handleExecuteAssignment}
            className="mta-btn px-4 py-2 bg-[#FFFFFF] border border-[#FFFFFF] hover:bg-[#E1E4E8] text-[#0F1113] text-xs font-bold flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>TRANSMIT e-CMR</span>
          </button>

          {onOpenBolModal && (
            <button
              onClick={() => onOpenBolModal(selectedManifestId)}
              className="mta-btn px-2.5 py-2 bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#8C929B] hover:text-[#FFFFFF] text-xs"
              title="Inspect Electronic Consignment Note (e-CMR)"
            >
              VIEW e-CMR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
