import React from 'react';
import { Vehicle, Manifest } from '../types';
import { Box, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
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
      <div className="w-full bg-[#181A1D] border border-[#2A2D32] p-4 text-xs font-tabular text-[#8C929B] flex items-center justify-center min-h-[140px]">
        SELECT AN ACTIVE EUROPEAN HGV NODE TO INSPECT PAYLOAD & e-CMR METRICS
      </div>
    );
  }

  const massPct = (vehicle.metrics.current_gross_mass_kg / vehicle.trailer_spec.max_payload_kg) * 100;
  const volPct = (vehicle.metrics.current_vol_m3 / vehicle.trailer_spec.max_vol_m3) * 100;
  const isOverweight = massPct > 100;
  const isVolOver = volPct > 100;

  return (
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] flex flex-col font-tabular">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2A2D32] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-[#E1E4E8]" />
          <span className="font-semibold text-xs text-[#FFFFFF] tracking-wider uppercase">
            SECTION C: SELECTED CARGO & DIRECTIVE 96/53/EC PAYLOAD METRICS
          </span>
        </div>
        <span className="text-[11px] text-[#FFFFFF] font-bold">
          {vehicle.vehicle_id} ({vehicle.plate_number}) - {vehicle.trailer_spec.type}
        </span>
      </div>

      <div className="p-3 space-y-3 text-xs">
        {/* Mass & Vol Usage Bars */}
        <div className="space-y-2">
          {/* Mass Usage */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#8C929B]">
                PAYLOAD MASS: <span className="text-[#FFFFFF]">{formatMass(vehicle.metrics.current_gross_mass_kg)}</span> / {formatMass(vehicle.trailer_spec.max_payload_kg)} (40t MAM Max)
              </span>
              <span className={`font-semibold ${isOverweight ? 'text-[#e88d8d]' : 'text-[#8cd1aa]'}`}>
                [{isOverweight ? 'STATUTORY OVERWEIGHT ALERT' : `LEGAL // ${massPct.toFixed(0)}%`}]
              </span>
            </div>
            {/* Visual meter */}
            <div className="w-full h-2 bg-[#0F1113] border border-[#2A2D32]">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverweight ? 'bg-[#7A3E3E]' : massPct > 88 ? 'bg-[#8C734B]' : 'bg-[#4E6E5D]'
                }`}
                style={{ width: `${Math.min(100, massPct)}%` }}
              />
            </div>
          </div>

          {/* Volume Usage & Euro-Pallets */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#8C929B]">
                EURO-PALLET STOWAGE:{' '}
                <span className="text-[#8cd1aa] font-bold">
                  {vehicle.metrics.euro_pallets_loaded} / {vehicle.trailer_spec.max_euro_pallets} EPAL 1 (33 MAX)
                </span>
                {' · '}
                <span className="text-[#E1E4E8]">{formatVolume(vehicle.metrics.current_vol_m3)}</span> / {formatVolume(vehicle.trailer_spec.max_vol_m3)}
              </span>
              <span className={`font-semibold ${isVolOver ? 'text-[#e88d8d]' : 'text-[#8cd1aa]'}`}>
                [{isVolOver ? 'EXCEEDS 13.6m CUBE' : '33-EPAL MATRIX OPTIMAL'}]
              </span>
            </div>
            <div className="w-full h-2 bg-[#0F1113] border border-[#2A2D32]">
              <div
                className={`h-full transition-all duration-300 ${
                  isVolOver ? 'bg-[#7A3E3E]' : 'bg-[#8C929B]'
                }`}
                style={{ width: `${Math.min(100, volPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* European Cargo Specs Grid */}
        <div className="pt-2 border-t border-[#2A2D32] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="text-[#8C929B] text-[10px]">CARGO & e-CMR NUMBER:</div>
            <div className="text-[#E1E4E8] font-medium truncate">
              {manifest ? `${manifest.cargo_description} [${manifest.ecmr_number}]` : 'Standby / Empty repositioning run'}
            </div>
          </div>
          <div>
            <div className="text-[#8C929B] text-[10px]">INTERNAL DIMENSIONS (13.62m EURO-TRAILER):</div>
            <div className="text-[#E1E4E8]">
              {vehicle.trailer_spec.internal_length_m}m (L) × {vehicle.trailer_spec.internal_width_m}m (W) × {vehicle.trailer_spec.internal_height_m}m (H)
            </div>
          </div>
        </div>

        {/* European Axle Distribution Summary */}
        <div className="pt-2 border-t border-[#2A2D32] flex flex-wrap items-center justify-between text-[11px] gap-2">
          <div className="text-[#8C929B]">
            DIRECTIVE 96/53 AXLE DISTRIBUTION:{' '}
            <span className="text-[#E1E4E8]">
              STEER {vehicle.axle_distribution.steer_pct}% (&le;8t) · DRIVE {vehicle.axle_distribution.drive_pct}% (&le;11.5t) · TRIDEM {vehicle.axle_distribution.trailer_pct}% (&le;24t)
            </span>
          </div>
          <span className="text-[#8cd1aa] font-semibold">
            [{vehicle.axle_distribution.status}]
          </span>
        </div>
      </div>
    </div>
  );
};
