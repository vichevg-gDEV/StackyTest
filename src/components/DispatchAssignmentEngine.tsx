import React, { useState } from 'react';
import { Vehicle, Manifest, Driver } from '../types';
import { 
  ClipboardList, 
  Send, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight, 
  Layers, 
  FileText, 
  Check, 
  Clock, 
  Box, 
  User, 
  Truck,
  Repeat,
  ShieldCheck,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { formatMass, formatVolume } from '../utils/formatters';

interface DispatchAssignmentEngineProps {
  vehicles: Vehicle[];
  manifests: Manifest[];
  drivers: Driver[];
  onAssignManifest: (manifestId: string, vehicleId: string, driverId: string) => { success: boolean; errors: string[] };
  onOpenBolModal: (manifestId: string) => void;
  onOpenNewPackageModal?: () => void;
}

export const DispatchAssignmentEngine: React.FC<DispatchAssignmentEngineProps> = ({
  vehicles,
  manifests,
  drivers,
  onAssignManifest,
  onOpenBolModal,
  onOpenNewPackageModal,
}) => {
  const [selectedManifestId, setSelectedManifestId] = useState<string>(
    manifests.find((m) => m.assignment_status.status === 'PENDING')?.manifest_id || manifests[0]?.manifest_id || ''
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles.find((v) => v.status === 'IDLE' || v.status === 'LOADING')?.vehicle_id || vehicles[0]?.vehicle_id || ''
  );
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.driver_id || '');
  const [stagingRule, setStagingRule] = useState<'LIFO' | 'FIFO'>('LIFO');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [assignmentSuccess, setAssignmentSuccess] = useState<boolean>(false);

  const activeManifest = manifests.find((m) => m.manifest_id === selectedManifestId) || manifests[0];
  const activeVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId) || vehicles[0];
  const activeDriver = drivers.find((d) => d.driver_id === selectedDriverId) || drivers[0];

  const handleExecuteAssignment = () => {
    const res = onAssignManifest(selectedManifestId, selectedVehicleId, selectedDriverId);
    if (!res.success) {
      setValidationErrors(res.errors);
      setAssignmentSuccess(false);
    } else {
      setValidationErrors([]);
      setAssignmentSuccess(true);
      setTimeout(() => setAssignmentSuccess(false), 5000);
    }
  };

  // Evaluate pre-dispatch logic status
  const continuousMinsRemaining = 270 - (activeDriver?.continuous_drive_minutes || 0);
  const tachoPass = continuousMinsRemaining >= 30 && (activeDriver?.daily_driving_hours || 0) < 9.0;
  const payloadPass = (activeManifest?.metrics.total_mass_kg || 0) <= (activeVehicle?.trailer_spec.max_payload_kg || 1);
  const palletPass = (activeManifest?.metrics.euro_pallets_count || 0) <= (activeVehicle?.trailer_spec.max_euro_pallets || 1);
  const dimsPass =
    (activeManifest?.metrics.max_unit_dimensions_m.width || 0) <= (activeVehicle?.trailer_spec.internal_width_m || 2.5) &&
    (activeManifest?.metrics.max_unit_dimensions_m.height || 0) <= (activeVehicle?.trailer_spec.internal_height_m || 2.7);
  const cabotagePass = (activeManifest?.cabotage_operation_count || 0) <= 3;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-5 font-sans space-y-5">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              European Dispatch & Freight Staging Engine
            </h2>
            <p className="text-xs text-slate-500">
              UN Geneva e-CMR Protocol · 33-EPAL Staging (LIFO/FIFO) · EC 561/2006 Pre-Dispatch Compliance
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onOpenNewPackageModal && (
            <button
              onClick={onOpenNewPackageModal}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Load Entry</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 text-[11px] font-medium px-2">Staging:</span>
            <button
              onClick={() => setStagingRule('LIFO')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                stagingRule === 'LIFO'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Last-In, First-Out: Staged nearest to rear door for earliest drop"
            >
              LIFO
            </button>
            <button
              onClick={() => setStagingRule('FIFO')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                stagingRule === 'FIFO'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="First-In, First-Out: Sequentially staged"
            >
              FIFO
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column European Orchestration Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Customer Manifest Selection */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Select e-CMR Consignment</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {manifests.length} Loads
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {manifests.map((m) => {
                const isSelected = m.manifest_id === selectedManifestId;
                const isAssigned = m.assignment_status.status !== 'PENDING';

                return (
                  <div
                    key={m.manifest_id}
                    onClick={() => setSelectedManifestId(m.manifest_id)}
                    className={`p-3 cursor-pointer rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-xs text-slate-900 font-mono">
                        {m.manifest_id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                          isAssigned
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        {m.assignment_status.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 font-medium line-clamp-1 mb-1">
                      {m.cargo_description}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="text-blue-700 font-semibold font-mono">
                        {m.metrics.euro_pallets_count} EPAL · {formatMass(m.metrics.total_mass_kg)}
                      </span>
                      <span>{m.origin_code} → {m.destination_code}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs text-slate-500">
            <span>Staging: <strong className="text-slate-800">{activeManifest?.staging_rule}</strong></span>
            {activeManifest && (
              <button
                onClick={() => onOpenBolModal(activeManifest.manifest_id)}
                className="text-blue-600 hover:text-blue-800 font-semibold underline text-xs"
              >
                Inspect e-CMR
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Target Vehicle & Internal Capacities */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Select European HGV</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {vehicles.length} Units
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {vehicles.map((v) => {
                const isSelected = v.vehicle_id === selectedVehicleId;
                const isIdle = v.status === 'IDLE' || v.status === 'LOADING';

                return (
                  <div
                    key={v.vehicle_id}
                    onClick={() => {
                      setSelectedVehicleId(v.vehicle_id);
                      setSelectedDriverId(v.driver_id);
                    }}
                    className={`p-3 cursor-pointer rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-xs text-slate-900 font-mono">
                        {v.vehicle_id} <span className="font-normal text-slate-500 font-sans">({v.plate_number})</span>
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                          isIdle
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 font-medium">
                      {v.make_model} // {v.emission_standard}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Max Payload: <strong>{formatMass(v.trailer_spec.max_payload_kg)}</strong></span>
                      <span className="text-blue-700 font-semibold">33 EPAL (13.62m)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-500">
            Internal Portal: {activeVehicle?.trailer_spec.internal_width_m}m W &times; {activeVehicle?.trailer_spec.internal_height_m}m H
          </div>
        </div>

        {/* Step 3: Driver Selection & EC 561/2006 Tachograph Compliance */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Driver Tachograph Audit</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {drivers.length} Drivers
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {drivers.map((d) => {
                const isSelected = d.driver_id === selectedDriverId;
                const isWarn = d.tacho_status === 'BREAK_DUE' || d.tacho_status === 'DAILY_LIMIT_WARN';
                const contMinsLeft = Math.max(0, 270 - d.continuous_drive_minutes);

                return (
                  <div
                    key={d.driver_id}
                    onClick={() => setSelectedDriverId(d.driver_id)}
                    className={`p-3 cursor-pointer rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-xs text-slate-900">
                        {d.driver_name} <span className="text-slate-400 font-normal">[{d.country}]</span>
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                          isWarn
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        {Math.floor(contMinsLeft / 60)}h {contMinsLeft % 60}m Left
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>Driving: <strong>{d.daily_driving_hours.toFixed(1)}h</strong> / 9.0h Daily Cap</div>
                      <div>Weekly: <strong>{d.weekly_accumulated_hours.toFixed(1)}h</strong> / 56.0h Max</div>
                      <div className="text-slate-500 font-medium">Rest: {d.mandatory_break_in}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-xs text-emerald-700 font-medium truncate">
            {activeDriver?.driver_qualification_card_cqc}
          </div>
        </div>
      </div>

      {/* Instant 3-Point Validation Logic Matrix Grounded in European Laws */}
      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pre-Dispatch European Regulatory Logic Verification</span>
          </span>
          <span className="text-slate-500 text-[11px]">
            Target: <strong className="text-slate-800 font-mono">{activeManifest?.manifest_id}</strong> &rarr; <strong className="text-slate-800 font-mono">{activeVehicle?.vehicle_id}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Check 1 */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px]">Check 1: EC 561/2006 Tachograph</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-800 font-semibold">Continuous & Daily Cap:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                tachoPass ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {tachoPass ? 'Compliant' : 'Break Due'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Card: {activeDriver?.tachograph_card_id}
            </div>
          </div>

          {/* Check 2 */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px]">Check 2: Directive 96/53/EC Payload & 33 EPAL</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-800 font-semibold">{formatMass(activeManifest?.metrics.total_mass_kg || 0)}:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                payloadPass && palletPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {payloadPass && palletPass ? `${activeManifest?.metrics.euro_pallets_count} EPAL Legal` : 'Overload'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              MAM Limit: 40,000 kg (Articulated)
            </div>
          </div>

          {/* Check 3 */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px]">Check 3: 13.6m Enclosure & Cabotage</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-800 font-semibold">Portal & Cabotage ({activeManifest?.cabotage_operation_count}/3):</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                dimsPass && cabotagePass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {dimsPass && cabotagePass ? 'Cleared' : 'Violation'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {activeManifest?.handling_requirements.adr_dangerous_goods ? activeManifest.handling_requirements.adr_class : 'General Freight (Non-ADR)'}
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertOctagon className="w-4 h-4" />
              <span>Assignment Blocked Due to European Regulatory Violation:</span>
            </div>
            {validationErrors.map((err, i) => (
              <div key={i} className="pl-5 text-slate-700">• {err}</div>
            ))}
          </div>
        )}

        {/* Success Banner */}
        {assignmentSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assignment Executed // e-CMR Consignment Note & TEN-T Route Synced to In-Cab DTCO Terminal</span>
            </div>
            <button
              onClick={() => onOpenBolModal(activeManifest?.manifest_id || '')}
              className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs rounded-lg shadow-2xs transition-colors"
            >
              Inspect e-CMR
            </button>
          </div>
        )}
      </div>

      {/* Action Trigger Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Transmission Protocol: Encrypted MQTT + VDO DTCO 4.1 In-Cab Smart Tachograph Push
        </div>

        <button
          onClick={handleExecuteAssignment}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Execute Dispatch & Push e-CMR to Cab Terminal</span>
        </button>
      </div>
    </div>
  );
};
