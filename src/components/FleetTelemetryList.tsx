import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Truck, Search, Radio, ChevronRight, AlertCircle, ArrowUpRight, Navigation } from 'lucide-react';
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
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col font-sans h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 tracking-tight">
              European Fleet Telemetry
            </h3>
            <span className="text-[10px] text-slate-500">Live TEN-T HGV Network</span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {vehicles.length} Units
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter ID, plate, driver, city, route..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-0.5">
          {(['ALL', 'ON-ROUTE', 'IN-TRANS', 'IDLE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium border transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Active Truck List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
        {filteredVehicles.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No European fleet units match specified telemetry filter
          </div>
        ) : (
          filteredVehicles.map((v) => {
            const isSelected = selectedVehicleId === v.vehicle_id;
            const statusTheme = getStatusColor(v.status);

            return (
              <div
                key={v.vehicle_id}
                onClick={() => onSelectVehicle(v.vehicle_id)}
                className={`p-3 cursor-pointer rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/10 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono tracking-tight text-sm">
                      {v.vehicle_id}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {v.plate_number}
                    </span>
                    <span className="text-slate-500 text-xs truncate max-w-[100px]">
                      {v.driver_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusTheme.border} ${statusTheme.bg} ${statusTheme.text}`}
                    >
                      {v.status}
                    </span>
                    <span className="font-bold text-slate-800 text-xs font-mono">
                      {formatSpeed(v.metrics.speed_kmh)}
                    </span>
                  </div>
                </div>

                {/* Real Task & Phase Line */}
                <div className="text-xs text-slate-800 font-medium truncate mb-1" title={v.current_task}>
                  • {v.current_task}
                </div>

                {/* Subtitle Telemetry Information */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[170px]" title={v.active_route.route_name}>
                    {v.active_route.origin_id} → {v.active_route.destination_id}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {v.task_phase} · {v.active_route.est_time_remaining}
                  </span>
                </div>

                {/* Progress mass & AdBlue/Fuel indicators */}
                <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div>
                    Payload: <strong className="text-slate-800">{v.metrics.euro_pallets_loaded} EPAL</strong> ({v.metrics.mass_load_index_pct.toFixed(0)}%)
                  </div>
                  <div className="text-right">
                    Diesel: <strong className="text-slate-800">{v.metrics.fuel_level_pct.toFixed(0)}%</strong> · AdBlue: <strong className="text-blue-700">{v.metrics.adblue_level_pct}%</strong>
                  </div>
                </div>

                {/* Action buttons if selected */}
                {isSelected && (
                  <div className="mt-2.5 pt-2.5 border-t border-blue-200/60 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenAssignModal && onOpenAssignModal(v.vehicle_id)}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Assign e-CMR</span>
                    </button>
                    <button
                      onClick={() => onOpenRerouteModal && onOpenRerouteModal(v.vehicle_id)}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>TEN-T Reroute</span>
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
