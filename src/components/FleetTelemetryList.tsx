import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Truck, Search, Radio, ChevronRight, AlertCircle, ArrowUpRight } from 'lucide-react';
import { getStatusColor, formatSpeed } from '../utils/formatters';

interface FleetTelemetryListProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onOpenAssignModal?: (vehicleId: string) => void;
  onOpenRerouteModal?: (vehicleId: string) => void;
}

export const FleetTelemetryList: React.FC<FleetTelemetryListProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onOpenAssignModal,
  onOpenRerouteModal,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON-ROUTE' | 'IN-TRANS' | 'IDLE' | 'LOADING'>('ALL');

  const filteredVehicles = vehicles.filter((v) => {
    const q = filterQuery.toLowerCase();
    const matchesQuery =
      v.vehicle_id.toLowerCase().includes(q) ||
      v.driver_name.toLowerCase().includes(q) ||
      v.plate_number.toLowerCase().includes(q) ||
      v.location.country.toLowerCase().includes(q) ||
      v.location.city.toLowerCase().includes(q) ||
      v.active_route.destination_name.toLowerCase().includes(q) ||
      v.active_route.route_name.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'IDLE'
        ? v.status === 'IDLE' || v.status === 'LOADING'
        : v.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] flex flex-col font-tabular h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2A2D32] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#E1E4E8]" />
          <span className="font-semibold text-xs text-[#FFFFFF] tracking-wider uppercase">
            SECTION B: EUROPEAN FLEET TELEMETRY & CONTROL
          </span>
        </div>
        <span className="text-[11px] text-[#8C929B]">
          [{vehicles.length} ACTIVE HGV NODES // TEN-T]
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2 border-b border-[#2A2D32] space-y-2 bg-[#0F1113]/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8C929B] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="FILTER VEHICLE, PLATE, DRIVER, COUNTRY, ROUTE..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#181A1D] border border-[#2A2D32] pl-8 pr-2 py-1.5 text-xs text-[#E1E4E8] placeholder-[#8C929B] focus:border-[#FFFFFF] focus:outline-none rounded-none"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 text-[10px]">
          {(['ALL', 'ON-ROUTE', 'IN-TRANS', 'IDLE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`mta-btn px-2 py-0.5 border ${
                statusFilter === st
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B] hover:text-[#E1E4E8]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Active Truck List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2A2D32]">
        {filteredVehicles.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8C929B]">
            NO EUROPEAN FLEET NODES MATCH SPECIFIED TELEMETRY FILTER
          </div>
        ) : (
          filteredVehicles.map((v) => {
            const isSelected = selectedVehicleId === v.vehicle_id;
            const statusTheme = getStatusColor(v.status);

            return (
              <div
                key={v.vehicle_id}
                onClick={() => onSelectVehicle(v.vehicle_id)}
                className={`p-2.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#2A2D32] border-l-2 border-l-[#FFFFFF]'
                    : 'hover:bg-[#2A2D32]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#FFFFFF] tracking-wider">
                      &gt; {v.vehicle_id}
                    </span>
                    <span className="text-[10px] px-1 bg-[#0F1113] border border-[#2A2D32] text-[#8cd1aa] font-mono">
                      {v.location.country}
                    </span>
                    <span className="text-[#8C929B] text-[11px] font-sans">
                      ({v.driver_name})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.2 text-[10px] border ${statusTheme.border} ${statusTheme.bg} ${statusTheme.text}`}
                    >
                      {v.status}
                    </span>
                    <span className="font-semibold text-[#E1E4E8]">
                      {formatSpeed(v.metrics.speed_kmh)}
                    </span>
                  </div>
                </div>

                {/* Real Task & Phase Line */}
                <div className="mt-1 text-[11px] text-[#FFFFFF] font-sans truncate" title={v.current_task}>
                  • {v.current_task}
                </div>

                {/* Subtitle Telemetry Information */}
                <div className="flex items-center justify-between text-[10px] text-[#8C929B] mt-0.5">
                  <span className="truncate max-w-[170px]" title={v.active_route.route_name}>
                    {v.active_route.origin_id} → {v.active_route.destination_id}
                  </span>
                  <span className="text-[#8cd1aa] font-semibold">
                    {v.task_phase} · ETA: {v.active_route.est_time_remaining}
                  </span>
                </div>

                {/* Progress mass & AdBlue/Fuel indicators */}
                <div className="mt-1.5 pt-1.5 border-t border-[#2A2D32]/60 grid grid-cols-2 gap-2 text-[10px] text-[#8C929B]">
                  <div>
                    LOAD: <span className="text-[#E1E4E8]">{v.metrics.euro_pallets_loaded} EPAL</span> ({v.metrics.mass_load_index_pct.toFixed(0)}%)
                  </div>
                  <div className="text-right">
                    DIESEL: <span className="text-[#E1E4E8]">{v.metrics.fuel_level_pct.toFixed(0)}%</span> · AdBlue <span className="text-[#8cd1aa]">{v.metrics.adblue_level_pct}%</span>
                  </div>
                </div>

                {/* Direct quick action buttons if selected */}
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-[#3e444d] flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenAssignModal && onOpenAssignModal(v.vehicle_id)}
                      className="mta-btn flex-1 py-1 px-2 text-[10px] bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#FFFFFF] flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      ASSIGN e-CMR
                    </button>
                    <button
                      onClick={() => onOpenRerouteModal && onOpenRerouteModal(v.vehicle_id)}
                      className="mta-btn flex-1 py-1 px-2 text-[10px] bg-[#181A1D] border border-[#2A2D32] hover:border-[#FFFFFF] text-[#8C929B] hover:text-[#FFFFFF] flex items-center justify-center gap-1"
                    >
                      TEN-T RE-ROUTE
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
