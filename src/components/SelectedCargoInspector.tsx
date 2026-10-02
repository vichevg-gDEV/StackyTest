import React from 'react';
import { Vehicle, Manifest } from '../types';
import { Box, Layers, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';
import { formatMass, formatVolume } from '../utils/formatters';

interface SelectedCargoInspectorProps {
  vehicle: Vehicle | null;
  manifest: Manifest | null;
  onOpenPayloadModal?: () => void;
}

export const SelectedCargoInspector: React.FC<SelectedCargoInspectorProps> = ({
  vehicle,
  manifest,
  onOpenPayloadModal,
}) => {
  if (!vehicle) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-400 flex items-center justify-center min-h-[140px] shadow-sm">
        Select an active European HGV from the fleet list or map to inspect payload & e-CMR metrics
      </div>
    );
  }

  const massPct = (vehicle.metrics.current_gross_mass_kg / vehicle.trailer_spec.max_payload_kg) * 100;
  const volPct = (vehicle.metrics.current_vol_m3 / vehicle.trailer_spec.max_vol_m3) * 100;
  const isOverweight = massPct > 100;
  const isVolOver = volPct > 100;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 tracking-tight">
              Selected Cargo & Directive 96/53/EC Payload
            </h3>
            <span className="text-[10px] text-slate-500">Real-Time WIM Weight & Stowage Telemetry</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            {vehicle.vehicle_id}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {vehicle.trailer_spec.type}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Mass & Vol Usage Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mass Usage */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">
                Payload Mass (40t MAM Cap):
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isOverweight ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isOverweight ? 'Overweight Alert' : `Legal (${massPct.toFixed(0)}%)`}
              </span>
            </div>
            
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold text-slate-900">{formatMass(vehicle.metrics.current_gross_mass_kg)}</span>
              <span className="text-xs text-slate-500 font-medium">Max: {formatMass(vehicle.trailer_spec.max_payload_kg)}</span>
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isOverweight ? 'bg-rose-500' : massPct > 88 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, massPct)}%` }}
              />
            </div>
          </div>

          {/* Volume Usage & Euro-Pallets */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">
                Euro-Pallet Stowage:
              </span>
              <span className="font-bold px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800">
                {vehicle.metrics.euro_pallets_loaded} / {vehicle.trailer_spec.max_euro_pallets} EPAL 1
              </span>
            </div>

            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold text-slate-900">{formatVolume(vehicle.metrics.current_vol_m3)}</span>
              <span className="text-xs text-slate-500 font-medium">Capacity: {formatVolume(vehicle.trailer_spec.max_vol_m3)}</span>
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isVolOver ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, volPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* European Cargo Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Cargo & e-CMR:</span>
            <div className="text-slate-800 font-semibold truncate">
              {manifest ? `${manifest.cargo_description}` : 'Empty Repositioning Run'}
            </div>
            {manifest && (
              <span className="text-[11px] text-blue-600 font-mono font-medium block mt-0.5">
                {manifest.ecmr_number}
              </span>
            )}
          </div>

          <div className="p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">13.62m Trailer Gauge:</span>
            <div className="text-slate-800 font-medium">
              {vehicle.trailer_spec.internal_length_m}m L &times; {vehicle.trailer_spec.internal_width_m}m W &times; {vehicle.trailer_spec.internal_height_m}m H
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Portal opening fits standard 1200 &times; 800 mm pallets
            </span>
          </div>
        </div>

        {/* European Axle Distribution Summary */}
        <div className="p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="text-slate-600">
            <strong className="text-slate-800">Axle Distribution:</strong>{' '}
            <span>Steer {vehicle.axle_distribution.steer_pct}% (&le;8t)</span>
            <span className="mx-1.5 text-slate-300">|</span>
            <span>Drive {vehicle.axle_distribution.drive_pct}% (&le;11.5t)</span>
            <span className="mx-1.5 text-slate-300">|</span>
            <span>Tridem {vehicle.axle_distribution.trailer_pct}% (&le;24t)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
              {vehicle.axle_distribution.status}
            </span>
            {onOpenPayloadModal && (
              <button
                onClick={onOpenPayloadModal}
                className="text-blue-600 hover:text-blue-800 font-semibold underline text-[11px]"
              >
                Inspect Matrix
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
