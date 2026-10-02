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
  AlertTriangle
} from 'lucide-react';
import { formatMass, formatVolume } from '../utils/formatters';

interface DispatchAssignmentEngineProps {
  vehicles: Vehicle[];
  manifests: Manifest[];
  drivers: Driver[];
  onAssignManifest: (manifestId: string, vehicleId: string, driverId: string) => { success: boolean; errors: string[] };
  onOpenBolModal: (manifestId: string) => void;
}

export const DispatchAssignmentEngine: React.FC<DispatchAssignmentEngineProps> = ({
  vehicles,
  manifests,
  drivers,
  onAssignManifest,
  onOpenBolModal,
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
  const continuousMinsRemaining = 270 - activeDriver.continuous_drive_minutes;
  const tachoPass = continuousMinsRemaining >= 45 && activeDriver.daily_driving_hours < 9.0;
  const payloadPass = activeManifest.metrics.total_mass_kg <= activeVehicle.trailer_spec.max_payload_kg;
  const palletPass = activeManifest.metrics.euro_pallets_count <= activeVehicle.trailer_spec.max_euro_pallets;
  const dimsPass =
    activeManifest.metrics.max_unit_dimensions_m.width <= activeVehicle.trailer_spec.internal_width_m &&
    activeManifest.metrics.max_unit_dimensions_m.height <= activeVehicle.trailer_spec.internal_height_m;
  const cabotagePass = activeManifest.cabotage_operation_count <= 3;

  return (
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] p-4 text-xs font-tabular space-y-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2A2D32] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#FFFFFF]" />
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              EUROPEAN DISPATCH & FREIGHT ASSIGNMENT ENGINE
            </h2>
            <div className="text-[11px] text-[#8C929B]">
              e-CMR PROTOCOL · 33-EPAL STAGING (LIFO/FIFO) · EC 561/2006 & DIRECTIVE 96/53/EC PRE-DISPATCH VALIDATION
            </div>
          </div>
        </div>

        {/* Staging Rule Toggle */}
        <div className="flex items-center gap-1">
          <span className="text-[#8C929B] text-[11px]">EPAL STAGING:</span>
          <button
            onClick={() => setStagingRule('LIFO')}
            className={`mta-btn px-2.5 py-1 border text-xs ${
              stagingRule === 'LIFO'
                ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
            }`}
            title="Last-In, First-Out: Pallets destined for first depot drop are staged nearest to trailer rear portal."
          >
            LIFO (LAST-IN, FIRST-OUT)
          </button>
          <button
            onClick={() => setStagingRule('FIFO')}
            className={`mta-btn px-2.5 py-1 border text-xs ${
              stagingRule === 'FIFO'
                ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
            }`}
            title="First-In, First-Out: Pallets staged by sequential delivery itinerary."
          >
            FIFO (FIRST-IN, FIRST-OUT)
          </button>
        </div>
      </div>

      {/* Main 3-Column European Orchestration Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Customer Manifest Selection */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5 mb-2">
              <span className="font-bold text-[#FFFFFF] tracking-wider">
                1. SELECT e-CMR CONSIGNMENT
              </span>
              <span className="text-[#8C929B] text-[10px]">
                {manifests.length} FREIGHT PACKAGES
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
                    className={`p-2.5 cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-[#2A2D32] border-[#FFFFFF]'
                        : 'bg-[#181A1D] border-[#2A2D32] hover:border-[#3e444d]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={isSelected ? 'text-[#FFFFFF]' : 'text-[#E1E4E8]'}>
                        [{m.manifest_id}]
                      </span>
                      <span
                        className={`text-[10px] px-1 border ${
                          isAssigned
                            ? 'border-[#4E6E5D] text-[#8cd1aa]'
                            : 'border-[#8C734B] text-[#e5bf7d]'
                        }`}
                      >
                        {m.assignment_status.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#E1E4E8] line-clamp-1 mb-1 font-sans">
                      {m.cargo_description}
                    </div>

                    <div className="text-[10px] text-[#8C929B] flex items-center justify-between">
                      <span className="text-[#8cd1aa] font-bold">
                        {m.metrics.euro_pallets_count} EPAL · {formatMass(m.metrics.total_mass_kg)}
                      </span>
                      <span>{m.origin_code} → {m.destination_code}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#2A2D32] flex justify-between items-center text-[10px] text-[#8C929B]">
            <span>STAGING: {activeManifest.staging_rule}</span>
            <button
              onClick={() => onOpenBolModal(activeManifest.manifest_id)}
              className="text-[#FFFFFF] underline hover:text-[#8cd1aa]"
            >
              INSPECT e-CMR
            </button>
          </div>
        </div>

        {/* Step 2: Target Vehicle & Internal Capacities */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5 mb-2">
              <span className="font-bold text-[#FFFFFF] tracking-wider">
                2. SELECT EUROPEAN HGV UNIT
              </span>
              <span className="text-[#8C929B] text-[10px]">
                {vehicles.length} FLEET UNITS
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
                    className={`p-2.5 cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-[#2A2D32] border-[#FFFFFF]'
                        : 'bg-[#181A1D] border-[#2A2D32] hover:border-[#3e444d]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={isSelected ? 'text-[#FFFFFF]' : 'text-[#E1E4E8]'}>
                        {v.vehicle_id} ({v.plate_number})
                      </span>
                      <span
                        className={`text-[10px] px-1 border ${
                          isIdle
                            ? 'border-[#4E6E5D] text-[#8cd1aa]'
                            : 'border-[#2A2D32] text-[#8C929B]'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#E1E4E8] font-sans">
                      {v.make_model} // {v.emission_standard}
                    </div>

                    <div className="text-[10px] text-[#8C929B] mt-1 flex justify-between">
                      <span>MAX PAYLOAD: {formatMass(v.trailer_spec.max_payload_kg)}</span>
                      <span className="text-[#8cd1aa] font-bold">33 EPAL (13.62m)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#2A2D32] text-[10px] text-[#8C929B]">
            DOOR GAUGE: {activeVehicle.trailer_spec.internal_width_m}m (W) × {activeVehicle.trailer_spec.internal_height_m}m (H)
          </div>
        </div>

        {/* Step 3: Driver Selection & EC 561/2006 Tachograph Compliance */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5 mb-2">
              <span className="font-bold text-[#FFFFFF] tracking-wider">
                3. EC 561/2006 TACHOGRAPH AUDIT
              </span>
              <span className="text-[#8C929B] text-[10px]">
                {drivers.length} ACTIVE DRIVERS
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
                    className={`p-2.5 cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-[#2A2D32] border-[#FFFFFF]'
                        : 'bg-[#181A1D] border-[#2A2D32] hover:border-[#3e444d]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={isSelected ? 'text-[#FFFFFF]' : 'text-[#E1E4E8]'}>
                        {d.driver_name} [{d.country}]
                      </span>
                      <span
                        className={`text-[10px] px-1 border ${
                          isWarn
                            ? 'border-[#8C734B] text-[#e5bf7d]'
                            : 'border-[#4E6E5D] text-[#8cd1aa]'
                        }`}
                      >
                        {Math.floor(contMinsLeft / 60)}h {contMinsLeft % 60}m CONT
                      </span>
                    </div>

                    <div className="text-[10px] text-[#8C929B] space-y-0.5">
                      <div>DRIVING: {d.daily_driving_hours.toFixed(1)}h / 9.0h DAILY MAX</div>
                      <div>WEEKLY: {d.weekly_accumulated_hours.toFixed(1)}h / 56.0h MAX</div>
                      <div>REST ALERT: {d.mandatory_break_in}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#2A2D32] text-[10px] text-[#8cd1aa]">
            QUALIFICATION: {activeDriver.driver_qualification_card_cqc}
          </div>
        </div>
      </div>

      {/* Instant 3-Point Validation Logic Matrix Grounded in European Laws */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
          <span className="font-bold text-[#FFFFFF] tracking-wider uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8cd1aa]" />
            PRE-DISPATCH EUROPEAN REGULATORY LOGIC VERIFICATION
          </span>
          <span className="text-[#8C929B] text-[10px]">
            ACTIVE TARGET: {activeManifest.manifest_id} ➔ {activeVehicle.vehicle_id} ➔ {activeDriver.driver_name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* Check 1 */}
          <div className="p-2 bg-[#181A1D] border border-[#2A2D32]">
            <div className="text-[#8C929B] text-[10px]">
              CHECK 1: EC 561/2006 SMART TACHOGRAPH
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#E1E4E8]">Continuous Drive & Daily Cap:</span>
              <span className={tachoPass ? 'text-[#8cd1aa] font-bold' : 'text-[#e5bf7d] font-bold'}>
                {tachoPass ? 'COMPLIANT [PASS]' : 'BREAK REQUIRED'}
              </span>
            </div>
            <div className="text-[10px] text-[#8C929B] mt-0.5">
              Tacho Card: {activeDriver.tachograph_card_id}
            </div>
          </div>

          {/* Check 2 */}
          <div className="p-2 bg-[#181A1D] border border-[#2A2D32]">
            <div className="text-[#8C929B] text-[10px]">
              CHECK 2: DIRECTIVE 96/53/EC PAYLOAD & 33 EPAL
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#E1E4E8]">
                {formatMass(activeManifest.metrics.total_mass_kg)} / {formatMass(activeVehicle.trailer_spec.max_payload_kg)}:
              </span>
              <span className={payloadPass && palletPass ? 'text-[#8cd1aa] font-bold' : 'text-[#e88d8d] font-bold'}>
                {payloadPass && palletPass ? `${activeManifest.metrics.euro_pallets_count} EPAL [LEGAL]` : 'OVERLOAD'}
              </span>
            </div>
            <div className="text-[10px] text-[#8C929B] mt-0.5">
              MAM Cap: 40,000 kg Articulated
            </div>
          </div>

          {/* Check 3 */}
          <div className="p-2 bg-[#181A1D] border border-[#2A2D32]">
            <div className="text-[#8C929B] text-[10px]">
              CHECK 3: 13.6m BOX ENVELOPE & ADR/CABOTAGE
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#E1E4E8]">
                Portal Clearance & Cabotage ({activeManifest.cabotage_operation_count}/3):
              </span>
              <span className={dimsPass && cabotagePass ? 'text-[#8cd1aa] font-bold' : 'text-[#e88d8d] font-bold'}>
                {dimsPass && cabotagePass ? 'CLEARED [PASS]' : 'VIOLATION'}
              </span>
            </div>
            <div className="text-[10px] text-[#8C929B] mt-0.5">
              {activeManifest.handling_requirements.adr_dangerous_goods ? activeManifest.handling_requirements.adr_class : 'General Cargo (Non-ADR)'}
            </div>
          </div>
        </div>

        {/* Validation Errors if any */}
        {validationErrors.length > 0 && (
          <div className="p-2.5 bg-[#7A3E3E]/20 border border-[#7A3E3E] text-[#e88d8d] text-xs font-medium space-y-1">
            <div className="font-bold">ASSIGNMENT BLOCKED DUE TO EUROPEAN REGULATORY INFRINGEMENT:</div>
            {validationErrors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        {/* Success Banner */}
        {assignmentSuccess && (
          <div className="p-2.5 bg-[#4E6E5D]/25 border border-[#4E6E5D] text-[#8cd1aa] text-xs font-bold flex items-center justify-between">
            <span>
              ASSIGNMENT EXECUTED // e-CMR CONSIGNMENT NOTE & TEN-T ROUTE SYNCED TO IN-CAB SMART TACHOGRAPH TERMINAL
            </span>
            <button
              onClick={() => onOpenBolModal(activeManifest.manifest_id)}
              className="px-2 py-1 bg-[#181A1D] border border-[#4E6E5D] text-[#FFFFFF] text-[10px]"
            >
              INSPECT TRANSMITTED e-CMR
            </button>
          </div>
        )}
      </div>

      {/* Action Trigger Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2A2D32]">
        <div className="text-[11px] text-[#8C929B]">
          TRANSMISSION PROTOCOL: ENCRYPTED MQTT + VDO DTCO 4.1 SMART TACHOGRAPH INGESTION
        </div>

        <button
          onClick={handleExecuteAssignment}
          className="mta-btn px-6 py-2.5 bg-[#FFFFFF] border border-[#FFFFFF] hover:bg-[#E1E4E8] text-[#0F1113] text-xs font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(255,255,255,0.2)] tracking-wider"
        >
          <Send className="w-4 h-4" />
          <span>EXECUTE DISPATCH & PUSH e-CMR TO HGV CAB TERMINAL</span>
        </button>
      </div>
    </div>
  );
};
