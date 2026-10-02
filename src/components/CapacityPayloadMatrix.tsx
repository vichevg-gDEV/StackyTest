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

  // Door opening and height checks under EU Directive 96/53/EC
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
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-5 font-sans space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              European Mass & Volumetric Capacity Engine // Directive 96/53/EC
            </h2>
            <p className="text-xs text-slate-500">
              40-Tonne Maximum Authorized Mass (MAM) · 33 EUR-EPAL Pallet Matrix · Tridem Bogie Load Distribution
            </p>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Target HGV:</span>
          <select
            value={currentVehicle.vehicle_id}
            onChange={(e) => onSelectVehicle(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs font-semibold"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tractor Model & Emission:</span>
          <div className="text-slate-900 font-bold text-sm">
            {currentVehicle.make_model}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {currentVehicle.emission_standard}
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Max MAM Legal Cap:</span>
          <div className="text-slate-900 font-bold text-sm">
            {formatMass(currentVehicle.trailer_spec.max_gvwr_kg)}
          </div>
          <span className="text-[11px] text-slate-500">
            40.00 t Statutory MAM
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Trailer Enclosure:</span>
          <div className="text-slate-900 font-bold text-sm truncate">
            {currentVehicle.trailer_spec.type}
          </div>
          <span className="text-[11px] text-slate-500">
            13.62m Internal Cargo Length
          </span>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
          <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Euro-Pallet Stowage:</span>
          <div className="text-blue-900 font-bold text-sm">
            {currentVehicle.metrics.euro_pallets_loaded} / {currentVehicle.trailer_spec.max_euro_pallets} EPAL
          </div>
          <span className="text-[11px] text-blue-700 font-medium">
            33 EPAL Max Trailer Floor Capacity
          </span>
        </div>
      </div>

      {/* Current Load Metrics Progress Bars */}
      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <span className="font-bold text-xs text-slate-900 uppercase tracking-tight">
            Payload Utilization & Statutory Weight Envelopes
          </span>
          <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            WIM Weigh-In-Motion Sensors Calibrated
          </span>
        </div>

        {/* Mass Usage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">
              Payload Mass: <strong className="text-slate-900 font-bold">{formatMass(massUsage)}</strong> / {formatMass(maxPayload)} Max
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
              massPct > 100 ? 'bg-rose-100 text-rose-800' : massPct > 88 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {massPct.toFixed(1)}% {massPct > 100 ? '[Overweight Infringement]' : '[Legal Nominal]'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                massPct > 100 ? 'bg-rose-500' : massPct > 88 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, massPct)}%` }}
            />
          </div>
        </div>

        {/* Volume Usage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">
              Internal Volumetric Cube: <strong className="text-slate-900 font-bold">{formatVolume(volUsage)}</strong> / {formatVolume(maxVol)} (13.6m Enclosure)
            </span>
            <span className="text-slate-600 font-medium">
              {volPct.toFixed(1)}% {volPct < 60 ? '[Under-Utilized // Cabotage Available]' : '[Optimized Floor]'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                volPct > 100 ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, volPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Parcel Dimension Calculator & European Axle Balance Schematic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: European Parcel & Pallet Dimension Calculator */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
              <span className="font-bold text-xs text-slate-900 tracking-tight flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                Euro-Pallet & Single Package Geometry Solver
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                EUR-EPAL 1
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Length (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcLength}
                  onChange={(e) => setCalcLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Width (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Height (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Mass (kg):</label>
                <input
                  type="number"
                  step="10"
                  value={calcMass}
                  onChange={(e) => setCalcMass(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Freight Volume:</span>
                <span className="text-slate-900 font-bold">{calcVolume.toFixed(3)} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Package Density:</span>
                <span className="text-slate-900 font-bold">
                  {calculatedDensity.toFixed(1)} kg/m³
                  <span className="text-slate-400 font-normal ml-1">
                    {calculatedDensity > 450 ? '(Heavy Industrial Density)' : '(Standard Palletized)'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EPAL 1 Footprint Ratio:</span>
                <span className="text-blue-700 font-bold">
                  {epalEquivalents} EPAL Units ({itemFootprintM2.toFixed(2)} m²)
                </span>
              </div>
            </div>
          </div>

          {/* Dimension Constraints Check under Directive 96/53/EC */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              fitsEnvelope
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {fitsEnvelope ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span className="font-medium">
                {fitsEnvelope
                  ? 'EU Statutory Clearance: Clears 13.6m rear portal & 4.00m road gauge'
                  : 'Statutory Warning: Unit exceeds Directive 96/53/EC internal clearance'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">
              Door: {maxDoorWidth}m &times; {maxInteriorHeight}m
            </span>
          </div>
        </div>

        {/* Right: European Articulated Axle Balance Schematic (Tridem Bogie) */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="font-bold text-xs text-slate-900 tracking-tight">
              European Sattelzug Axle Load Distribution
            </span>
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              {currentVehicle.axle_distribution.status}
            </span>
          </div>

          {/* Top-Down Visual European COE Truck Schematic (SVG) */}
          <div className="w-full bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center shadow-2xs">
            <svg viewBox="0 0 420 140" className="w-full h-32">
              <defs>
                <pattern id="chassis-grid-eu-light" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Background grid */}
              <rect width="420" height="140" fill="url(#chassis-grid-eu-light)" />

              {/* European COE (Cab-Over-Engine) Front Cab Outline */}
              <rect x="25" y="32" width="45" height="76" rx="4" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
              <text x="47" y="73" fill="#0F172A" fontSize="8" fontFamily="Plus Jakarta Sans" textAnchor="middle" fontWeight="bold">
                COE CAB
              </text>

              {/* Fifth Wheel Coupling */}
              <circle cx="75" cy="70" r="4" fill="#94A3B8" stroke="#0F172A" strokeWidth="1" />
              <line x1="70" y1="70" x2="80" y2="70" stroke="#0F172A" strokeWidth="2" />

              {/* Standard European 13.62m Trailer Box Outline */}
              <rect x="80" y="28" width="300" height="84" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="230" y="72" fill="#475569" fontSize="9" fontFamily="Plus Jakarta Sans" textAnchor="middle" fontWeight="600">
                13.6m SEMI-TRAILER (33 EPAL) [{formatMass(massUsage)}]
              </text>

              {/* Steer Axle (Front Single - Legal Max 8,000 kg) */}
              <rect x="35" y="16" width="14" height="12" rx="2" fill={isSteerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <rect x="35" y="112" width="14" height="12" rx="2" fill={isSteerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <line x1="42" y1="28" x2="42" y2="112" stroke="#0F172A" strokeWidth="1.5" />
              <text x="42" y="134" fill={isSteerOver ? '#DC2626' : '#059669'} fontSize="7.5" fontFamily="Plus Jakarta Sans" textAnchor="middle" fontWeight="bold">
                STEER {steerPct}%
              </text>

              {/* Drive Axle (Tractor Rear - Legal Max 11,500 kg) */}
              <rect x="68" y="16" width="14" height="12" rx="2" fill={isDriveOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <rect x="68" y="112" width="14" height="12" rx="2" fill={isDriveOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <text x="75" y="134" fill={isDriveOver ? '#DC2626' : '#059669'} fontSize="7.5" fontFamily="Plus Jakarta Sans" textAnchor="middle" fontWeight="bold">
                DRIVE {drivePct}%
              </text>

              {/* European Tri-Axle (Tridem Bogie) - Legal Max 24,000 kg (3x 8,000 kg) */}
              <rect x="325" y="16" width="12" height="12" rx="2" fill={isTrailerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <rect x="325" y="112" width="12" height="12" rx="2" fill={isTrailerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />

              <rect x="343" y="16" width="12" height="12" rx="2" fill={isTrailerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <rect x="343" y="112" width="12" height="12" rx="2" fill={isTrailerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />

              <rect x="361" y="16" width="12" height="12" rx="2" fill={isTrailerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />
              <rect x="361" y="112" width="12" height="12" rx="2" fill={isTrailerOver ? '#EF4444' : '#10B981'} stroke="#0F172A" strokeWidth="1" />

              <line x1="331" y1="28" x2="331" y2="112" stroke="#0F172A" strokeWidth="1" />
              <line x1="349" y1="28" x2="349" y2="112" stroke="#0F172A" strokeWidth="1" />
              <line x1="367" y1="28" x2="367" y2="112" stroke="#0F172A" strokeWidth="1" />

              <text x="349" y="134" fill={isTrailerOver ? '#DC2626' : '#059669'} fontSize="7.5" fontFamily="Plus Jakarta Sans" textAnchor="middle" fontWeight="bold">
                TRIDEM {trailerPct}%
              </text>
            </svg>
          </div>

          {/* Statutory Axle Thresholds (Directive 96/53/EC Annex I) */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${isSteerOver ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Steering Axle</div>
              <div className="font-bold text-slate-900 mt-0.5">{formatMass(steerWeight)}</div>
              <div className={`text-[10px] font-medium ${isSteerOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                {steerPct}% (&le; 8,000 kg)
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${isDriveOver ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Drive Axle</div>
              <div className="font-bold text-slate-900 mt-0.5">{formatMass(driveWeight)}</div>
              <div className={`text-[10px] font-medium ${isDriveOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                {drivePct}% (&le; 11,500 kg)
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${isTrailerOver ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Tridem Bogie</div>
              <div className="font-bold text-slate-900 mt-0.5">{formatMass(trailerWeight)}</div>
              <div className={`text-[10px] font-medium ${isTrailerOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                {trailerPct}% (&le; 24,000 kg)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
