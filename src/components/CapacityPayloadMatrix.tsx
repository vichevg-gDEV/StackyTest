import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Scale, Box, Calculator, ShieldCheck, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { formatMass, formatVolume } from '../utils/formatters';

interface CapacityPayloadMatrixProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

export const CapacityPayloadMatrix: React.FC<CapacityPayloadMatrixProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const currentVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId) || vehicles[0];

  // Interactive Parcel Dimension Calculator inputs (EUR-EPAL standard default 1.20 x 0.80 x 1.45)
  const [calcLength, setCalcLength] = useState<number>(1.20);
  const [calcWidth, setCalcWidth] = useState<number>(0.80);
  const [calcHeight, setCalcHeight] = useState<number>(1.45);
  const [calcMass, setCalcMass] = useState<number>(550);

  // Calculations
  const calcVolume = calcLength * calcWidth * calcHeight;
  const calculatedDensity = calcVolume > 0 ? calcMass / calcVolume : 0;

  // Door opening and height checks under EU Directive 96/53/EC (Max height 4.00m overall, ~2.70m internal)
  const maxDoorWidth = currentVehicle.trailer_spec.internal_width_m; // 2.48m
  const maxInteriorHeight = currentVehicle.trailer_spec.internal_height_m; // 2.70m - 3.00m
  const fitsWidth = calcWidth <= maxDoorWidth;
  const fitsHeight = calcHeight <= maxInteriorHeight;
  const fitsEnvelope = fitsWidth && fitsHeight;

  // Euro-pallet footprint calculation (EPAL 1: 1.20m x 0.80m = 0.96 m²)
  const itemFootprintM2 = calcLength * calcWidth;
  const epalEquivalents = (itemFootprintM2 / 0.96).toFixed(1);

  // Current vehicle load metrics
  const massUsage = currentVehicle.metrics.current_gross_mass_kg;
  const maxPayload = currentVehicle.trailer_spec.max_payload_kg;
  const massPct = (massUsage / maxPayload) * 100;

  const volUsage = currentVehicle.metrics.current_vol_m3;
  const maxVol = currentVehicle.trailer_spec.max_vol_m3;
  const volPct = (volUsage / maxVol) * 100;

  // European Axle weights & balance (Directive 96/53/EC)
  const steerWeight = currentVehicle.axle_distribution.steer_kg;
  const driveWeight = currentVehicle.axle_distribution.drive_kg;
  const trailerWeight = currentVehicle.axle_distribution.trailer_kg;
  const totalAxleWeight = steerWeight + driveWeight + trailerWeight || 1;

  const steerPct = Math.round((steerWeight / totalAxleWeight) * 100) || 26;
  const drivePct = Math.round((driveWeight / totalAxleWeight) * 100) || 41;
  const trailerPct = Math.round((trailerWeight / totalAxleWeight) * 100) || 33;

  const isSteerOver = steerWeight > 8000;
  const isDriveOver = driveWeight > 11500;
  const isTrailerOver = trailerWeight > 24000;

  return (
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] p-4 text-xs font-tabular space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2A2D32] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#FFFFFF]" />
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              EUROPEAN MASS & VOLUMETRIC CAPACITY ENGINE // DIRECTIVE 96/53/EC
            </h2>
            <div className="text-[11px] text-[#8C929B]">
              40-TONNE MAM ENVELOPE · 33 EUR-EPAL PALLET MATRIX · TRIDEM AXLE BALANCE SCHEMATIC
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[#8C929B]">TARGET HGV:</span>
          <select
            value={currentVehicle.vehicle_id}
            onChange={(e) => onSelectVehicle(e.target.value)}
            className="bg-[#0F1113] border border-[#2A2D32] px-2.5 py-1 text-xs text-[#E1E4E8] rounded-none focus:border-[#FFFFFF] focus:outline-none"
          >
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.vehicle_id} ({v.plate_number}) - {v.make_model} // {formatMass(v.metrics.current_gross_mass_kg)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* European Vehicle & Trailer Specification Row */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[#8C929B] text-[10px]">TRACTOR MODEL & EMISSION:</span>
          <div className="text-[#FFFFFF] font-bold">
            {currentVehicle.make_model} ({currentVehicle.emission_standard})
          </div>
        </div>
        <div>
          <span className="text-[#8C929B] text-[10px]">MAX MAM LEGAL THRESHOLD (DIRECTIVE 96/53):</span>
          <div className="text-[#FFFFFF] font-bold">
            {formatMass(currentVehicle.trailer_spec.max_gvwr_kg)} (40.00 t MAM)
          </div>
        </div>
        <div>
          <span className="text-[#8C929B] text-[10px]">TRAILER ENCLOSURE & STANDARD:</span>
          <div className="text-[#FFFFFF] font-bold">
            {currentVehicle.trailer_spec.type}
          </div>
        </div>
        <div>
          <span className="text-[#8C929B] text-[10px]">EURO-PALLET CAPACITY (EPAL 1):</span>
          <div className="text-[#8cd1aa] font-bold">
            {currentVehicle.metrics.euro_pallets_loaded} / {currentVehicle.trailer_spec.max_euro_pallets} EPAL (33 MAX)
          </div>
        </div>
      </div>

      {/* Current Load Metrics Progress Bars */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
          <span className="font-bold text-[#FFFFFF] tracking-wider uppercase">
            PAYLOAD UTILIZATION & STATUTORY WEIGHT THRESHOLDS
          </span>
          <span className="text-[#8cd1aa] font-semibold text-[11px]">
            WIM (WEIGH-IN-MOTION) SENSORS: CALIBRATED & ACTIVE
          </span>
        </div>

        {/* Mass Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#8C929B]">
              PAYLOAD MASS: <span className="text-[#FFFFFF] font-bold">{formatMass(massUsage)}</span> / {formatMass(maxPayload)} (Max Payload)
            </span>
            <span className={`font-bold ${massPct > 100 ? 'text-[#e88d8d]' : massPct > 90 ? 'text-[#e5bf7d]' : 'text-[#8cd1aa]'}`}>
              {massPct.toFixed(1)}% {massPct > 100 ? '[STATUTORY OVERLOAD]' : massPct > 90 ? '[APPROACHING MAX MAM]' : '[NOMINAL LEGAL]'}
            </span>
          </div>
          <div className="w-full h-3 bg-[#181A1D] border border-[#2A2D32] p-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                massPct > 100 ? 'bg-[#7A3E3E]' : massPct > 88 ? 'bg-[#8C734B]' : 'bg-[#4E6E5D]'
              }`}
              style={{ width: `${Math.min(100, massPct)}%` }}
            />
          </div>
        </div>

        {/* Volume Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#8C929B]">
              INTERNAL VOLUMETRIC CUBE: <span className="text-[#FFFFFF] font-bold">{formatVolume(volUsage)}</span> / {formatVolume(maxVol)} (13.62m Interior)
            </span>
            <span className="text-[#E1E4E8] font-bold">
              {volPct.toFixed(1)}% {volPct < 60 ? '[UNDER-UTILIZED // CABOTAGE OPPORTUNITY]' : '[OPTIMIZED]'}
            </span>
          </div>
          <div className="w-full h-3 bg-[#181A1D] border border-[#2A2D32] p-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                volPct > 100 ? 'bg-[#7A3E3E]' : 'bg-[#8C929B]'
              }`}
              style={{ width: `${Math.min(100, volPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Parcel Dimension Calculator & European Axle Balance Schematic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: European Parcel & Pallet Dimension Calculator */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5 mb-2">
              <span className="font-bold text-[#FFFFFF] tracking-wider uppercase flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#E1E4E8]" />
                EURO-PALLET & PARCEL GEOMETRY SOLVER
              </span>
              <span className="text-[#8C929B] text-[10px]">
                EPAL 1 / ISO SPEC
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-[#8C929B] block mb-1">LENGTH (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcLength}
                  onChange={(e) => setCalcLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181A1D] border border-[#2A2D32] px-2 py-1 text-xs text-[#FFFFFF] focus:border-[#FFFFFF] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8C929B] block mb-1">WIDTH (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181A1D] border border-[#2A2D32] px-2 py-1 text-xs text-[#FFFFFF] focus:border-[#FFFFFF] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8C929B] block mb-1">HEIGHT (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181A1D] border border-[#2A2D32] px-2 py-1 text-xs text-[#FFFFFF] focus:border-[#FFFFFF] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8C929B] block mb-1">MASS (kg):</label>
                <input
                  type="number"
                  step="10"
                  value={calcMass}
                  onChange={(e) => setCalcMass(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181A1D] border border-[#2A2D32] px-2 py-1 text-xs text-[#FFFFFF] focus:border-[#FFFFFF] focus:outline-none rounded-none"
                />
              </div>
            </div>

            {/* Calculated European Results */}
            <div className="p-3 bg-[#181A1D] border border-[#2A2D32] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8C929B]">UNIT VOLUME:</span>
                <span className="text-[#FFFFFF] font-bold">{calcVolume.toFixed(3)} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C929B]">FREIGHT DENSITY:</span>
                <span className="text-[#FFFFFF] font-bold">
                  {calculatedDensity.toFixed(1)} kg/m³
                  <span className="text-[#8C929B] font-normal ml-1">
                    {calculatedDensity > 450 ? '(High-Density Industrial Freight)' : '(Standard Euro-Stowage)'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C929B]">EPAL 1 FOOTPRINT EQUIVALENT:</span>
                <span className="text-[#8cd1aa] font-bold">
                  {epalEquivalents} EPAL Units ({itemFootprintM2.toFixed(2)} m²)
                </span>
              </div>
            </div>
          </div>

          {/* Dimension Constraints Check under Directive 96/53/EC */}
          <div
            className={`p-2.5 border flex items-center justify-between text-xs ${
              fitsEnvelope
                ? 'bg-[#4E6E5D]/15 border-[#4E6E5D] text-[#8cd1aa]'
                : 'bg-[#7A3E3E]/20 border-[#7A3E3E] text-[#e88d8d]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {fitsEnvelope ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>
                {fitsEnvelope
                  ? 'EU STATUTORY CLEARANCE: CLEARS 13.6m REAR PORTAL & 4.00m ROAD GAUGE'
                  : 'STATUTORY WARNING: UNIT EXCEEDS DIRECTIVE 96/53/EC CLEARANCE ENVELOPE'}
              </span>
            </div>
            <span className="text-[10px] font-bold">
              DOOR: {maxDoorWidth}m × {maxInteriorHeight}m
            </span>
          </div>
        </div>

        {/* Right: European Articulated Axle Balance Schematic (Tridem Bogie) */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
            <span className="font-bold text-[#FFFFFF] tracking-wider uppercase">
              EUROPEAN SATTELZUG AXLE LOAD DISTRIBUTION
            </span>
            <span className="text-[#8cd1aa] text-[11px] font-bold">
              [{currentVehicle.axle_distribution.status}]
            </span>
          </div>

          {/* Top-Down Visual European COE Truck Schematic (SVG) */}
          <div className="w-full bg-[#181A1D] border border-[#2A2D32] p-3 flex flex-col items-center justify-center">
            <svg viewBox="0 0 420 140" className="w-full h-32">
              <defs>
                <pattern id="chassis-grid-eu" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#2A2D32" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Background grid */}
              <rect width="420" height="140" fill="url(#chassis-grid-eu)" />

              {/* European COE (Cab-Over-Engine) Front Cab Outline */}
              <rect x="25" y="32" width="45" height="76" fill="#181A1D" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="47" y="73" fill="#FFFFFF" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                COE CAB
              </text>

              {/* Fifth Wheel Coupling */}
              <circle cx="75" cy="70" r="4" fill="#8C929B" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="70" y1="70" x2="80" y2="70" stroke="#FFFFFF" strokeWidth="2" />

              {/* Standard European 13.62m Trailer Box Outline */}
              <rect x="80" y="28" width="300" height="84" fill="#181A1D" stroke="#8C929B" strokeWidth="1.5" strokeDasharray="3 1" />
              <text x="230" y="72" fill="#8C929B" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                13.6m SEMI-TRAILER (33 EPAL) [{formatMass(massUsage)}]
              </text>

              {/* Steer Axle (Front Single - Legal Max 8,000 kg) */}
              <rect x="35" y="16" width="14" height="12" fill={isSteerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <rect x="35" y="112" width="14" height="12" fill={isSteerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <line x1="42" y1="28" x2="42" y2="112" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="42" y="134" fill={isSteerOver ? '#e88d8d' : '#8cd1aa'} fontSize="7.5" fontFamily="JetBrains Mono" textAnchor="middle">
                STEER {steerPct}%
              </text>

              {/* Drive Axle (Tractor Rear - Legal Max 11,500 kg) */}
              <rect x="68" y="16" width="14" height="12" fill={isDriveOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <rect x="68" y="112" width="14" height="12" fill={isDriveOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <text x="75" y="134" fill={isDriveOver ? '#e88d8d' : '#8cd1aa'} fontSize="7.5" fontFamily="JetBrains Mono" textAnchor="middle">
                DRIVE {drivePct}%
              </text>

              {/* European Tri-Axle (Tridem Bogie) - Legal Max 24,000 kg (3x 8,000 kg) */}
              <rect x="325" y="16" width="12" height="12" fill={isTrailerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <rect x="325" y="112" width="12" height="12" fill={isTrailerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />

              <rect x="343" y="16" width="12" height="12" fill={isTrailerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <rect x="343" y="112" width="12" height="12" fill={isTrailerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />

              <rect x="361" y="16" width="12" height="12" fill={isTrailerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />
              <rect x="361" y="112" width="12" height="12" fill={isTrailerOver ? '#7A3E3E' : '#4E6E5D'} stroke="#FFFFFF" strokeWidth="1" />

              <line x1="331" y1="28" x2="331" y2="112" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="349" y1="28" x2="349" y2="112" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="367" y1="28" x2="367" y2="112" stroke="#FFFFFF" strokeWidth="1" />

              <text x="349" y="134" fill={isTrailerOver ? '#e88d8d' : '#8cd1aa'} fontSize="7.5" fontFamily="JetBrains Mono" textAnchor="middle">
                TRIDEM {trailerPct}%
              </text>
            </svg>
          </div>

          {/* Statutory Axle Thresholds (Directive 96/53/EC Annex I) */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2 bg-[#181A1D] border ${isSteerOver ? 'border-[#7A3E3E]' : 'border-[#2A2D32]'}`}>
              <div className="text-[10px] text-[#8C929B]">STEERING AXLE</div>
              <div className="font-bold text-[#FFFFFF] mt-0.5">{formatMass(steerWeight)}</div>
              <div className={`text-[10px] ${isSteerOver ? 'text-[#e88d8d]' : 'text-[#8cd1aa]'}`}>
                {steerPct}% (LEGAL &le; 8,000 kg)
              </div>
            </div>

            <div className={`p-2 bg-[#181A1D] border ${isDriveOver ? 'border-[#7A3E3E]' : 'border-[#2A2D32]'}`}>
              <div className="text-[10px] text-[#8C929B]">DRIVE AXLE</div>
              <div className="font-bold text-[#FFFFFF] mt-0.5">{formatMass(driveWeight)}</div>
              <div className={`text-[10px] ${isDriveOver ? 'text-[#e88d8d]' : 'text-[#8cd1aa]'}`}>
                {drivePct}% (LEGAL &le; 11,500 kg)
              </div>
            </div>

            <div className={`p-2 bg-[#181A1D] border ${isTrailerOver ? 'border-[#7A3E3E]' : 'border-[#2A2D32]'}`}>
              <div className="text-[10px] text-[#8C929B]">TRIDEM BOGIE</div>
              <div className="font-bold text-[#FFFFFF] mt-0.5">{formatMass(trailerWeight)}</div>
              <div className={`text-[10px] ${isTrailerOver ? 'text-[#e88d8d]' : 'text-[#8cd1aa]'}`}>
                {trailerPct}% (LEGAL &le; 24,000 kg)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
