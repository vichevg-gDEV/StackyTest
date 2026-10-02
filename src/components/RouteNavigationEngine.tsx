import React, { useState } from 'react';
import { Vehicle } from '../types';
import { 
  Navigation, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CloudSnow, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  Euro
} from 'lucide-react';
import { formatSpeed, formatCurrencyEur } from '../utils/formatters';

interface RouteNavigationEngineProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onApplyDetour: (vehicleId: string, reason: string) => void;
}

export const RouteNavigationEngine: React.FC<RouteNavigationEngineProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onApplyDetour,
}) => {
  const currentVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId) || vehicles[0];

  // European commercial HGV restrictions state (Directive 96/53/EC & ADR)
  const [restrictions, setRestrictions] = useState({
    lowClearance: currentVehicle.active_route.restrictions.low_clearance,
    maxAxleWeight: currentVehicle.active_route.restrictions.max_axle_weight,
    adrRestricted: currentVehicle.active_route.restrictions.adr_restricted,
    critAirLez: currentVehicle.active_route.restrictions.crit_air_lez,
    alpineTransit: currentVehicle.active_route.restrictions.alpine_transit,
  });

  const [activeDetourState, setActiveDetourState] = useState<string | null>(null);

  const toggleRestriction = (key: keyof typeof restrictions) => {
    setRestrictions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRecalculateAlternate = () => {
    setActiveDetourState('CALCULATING EU TEN-T BYPASS CORRIDOR...');
    setTimeout(() => {
      onApplyDetour(
        currentVehicle.vehicle_id,
        'Applied German BAB 61 / A6 bypass to avoid Leverkusen bridge weight restriction and A3 congestion'
      );
      setActiveDetourState('ALTERNATE TEN-T ROUTE DEPLOYED // TACHO & LKW MAUT UPDATED (+18 km, 0 Bridge Conflicts)');
      setTimeout(() => setActiveDetourState(null), 5000);
    }, 800);
  };

  return (
    <div className="w-full bg-[#181A1D] border border-[#2A2D32] p-4 text-xs font-tabular space-y-4">
      {/* Module Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2A2D32] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FFFFFF]" />
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              EUROPEAN TEN-T ROUTE NAVIGATION // DIRECTIVE 96/53/EC & ADR COMPLIANCE
            </h2>
            <div className="text-[11px] text-[#8C929B]">
              LKW MAUT · CRIT'AIR LOW EMISSION ZONES · ALPINE PASS SECTORAL RESTRICTIONS · ADR TUNNEL CAT A-E
            </div>
          </div>
        </div>

        {/* Vehicle Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[#8C929B]">ACTIVE HGV:</span>
          <select
            value={currentVehicle.vehicle_id}
            onChange={(e) => onSelectVehicle(e.target.value)}
            className="bg-[#0F1113] border border-[#2A2D32] px-2.5 py-1 text-xs text-[#E1E4E8] rounded-none focus:border-[#FFFFFF] focus:outline-none"
          >
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.vehicle_id} ({v.plate_number}) - {v.active_route.origin_id} → {v.active_route.destination_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Origin / Destination Primary Metric Banner */}
      <div className="bg-[#0F1113] border border-[#2A2D32] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2D32] pb-2 mb-2">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[#8C929B] text-[10px]">ORIGIN (EU):</span>
              <div className="text-[#FFFFFF] font-bold text-sm">{currentVehicle.active_route.origin_name}</div>
            </div>
            <span className="text-[#8C929B] font-bold text-base">───────►</span>
            <div>
              <span className="text-[#8C929B] text-[10px]">DESTINATION (EU):</span>
              <div className="text-[#FFFFFF] font-bold text-sm">{currentVehicle.active_route.destination_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-tabular">
            <div>
              <span className="text-[#8C929B]">CORRIDOR DISTANCE:</span>{' '}
              <span className="text-[#FFFFFF] font-bold">{currentVehicle.active_route.total_distance_km} km</span>
            </div>
            <div>
              <span className="text-[#8C929B]">EST. DRIVE TIME:</span>{' '}
              <span className="text-[#8cd1aa] font-bold">{currentVehicle.active_route.est_time_remaining}</span>
            </div>
            <div>
              <span className="text-[#8C929B]">EU TOLLS (MAUT/TELEPASS):</span>{' '}
              <span className="text-[#E1E4E8] font-bold">{formatCurrencyEur(currentVehicle.active_route.toll_cost_eur)}</span>
            </div>
          </div>
        </div>

        {/* European Restrictions Filter Checkbox Bar */}
        <div>
          <div className="text-[10px] text-[#8C929B] mb-1.5 uppercase tracking-wider font-semibold">
            EUROPEAN DIRECTIVE 96/53/EC & ENVIRONMENTAL RESTRICTIONS:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
            <button
              onClick={() => toggleRestriction('lowClearance')}
              className={`mta-btn p-2 border flex items-center gap-2 text-left ${
                restrictions.lowClearance
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
              }`}
            >
              {restrictions.lowClearance ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>Clearance (&lt; 4.00m EU Standard)</span>
            </button>

            <button
              onClick={() => toggleRestriction('maxAxleWeight')}
              className={`mta-btn p-2 border flex items-center gap-2 text-left ${
                restrictions.maxAxleWeight
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
              }`}
            >
              {restrictions.maxAxleWeight ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>Drive Axle (&lt; 11.5t Limit)</span>
            </button>

            <button
              onClick={() => toggleRestriction('adrRestricted')}
              className={`mta-btn p-2 border flex items-center gap-2 text-left ${
                restrictions.adrRestricted
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
              }`}
            >
              {restrictions.adrRestricted ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>ADR Dangerous Goods (Tunnel B/E)</span>
            </button>

            <button
              onClick={() => toggleRestriction('critAirLez')}
              className={`mta-btn p-2 border flex items-center gap-2 text-left ${
                restrictions.critAirLez
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
              }`}
            >
              {restrictions.critAirLez ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>Crit'Air / LEZ (Euro 6 Mandatory)</span>
            </button>

            <button
              onClick={() => toggleRestriction('alpineTransit')}
              className={`mta-btn p-2 border flex items-center gap-2 text-left ${
                restrictions.alpineTransit
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B]'
              }`}
            >
              {restrictions.alpineTransit ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>Alpine Sectoral Curfew (Brenner/CH)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Route Segments Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Segment Turn-by-Turn & Architecture */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
            <span className="font-bold text-[#FFFFFF] tracking-wider uppercase">
              TEN-T CORRIDOR TOPOLOGY & SEGMENTS
            </span>
            <span className="text-[#8C929B] text-[11px]">
              STANDARD: 40 TONNES / 16.5m
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 bg-[#181A1D] border border-[#2A2D32]">
              <div className="flex justify-between text-xs font-semibold text-[#FFFFFF] mb-1">
                <span>1. Cross-Country Motorway Axis (TEN-T Priority)</span>
                <span>{Math.round(currentVehicle.active_route.total_distance_km * 0.8)} km @ {currentVehicle.active_route.avg_speed_kmh} km/h avg</span>
              </div>
              <p className="text-[11px] text-[#8C929B]">
                Optimized for German LKW Maut / French Telepass OBU electronic tolling, automated WIM (weigh-in-motion), and Euro 6e low acoustic footprint.
              </p>
            </div>

            <div className="p-2.5 bg-[#181A1D] border border-[#2A2D32]">
              <div className="flex justify-between text-xs font-semibold text-[#FFFFFF] mb-1">
                <span>2. Urban Distripark & Terminal Access</span>
                <span>{Math.round(currentVehicle.active_route.total_distance_km * 0.2)} km @ 45 km/h avg</span>
              </div>
              <p className="text-[11px] text-[#8C929B]">
                Complies with European municipal delivery windows, Crit'Air vignette class 1/2, and bridge underpass clearances &gt; 4.10m.
              </p>
            </div>
          </div>

          {/* Waypoints sequence */}
          <div className="pt-2 border-t border-[#2A2D32]">
            <div className="text-[10px] text-[#8C929B] mb-1 uppercase font-semibold">
              EUROPEAN WAYPOINTS & CUSTOMS / TOLL HUBS:
            </div>
            <div className="space-y-1">
              {currentVehicle.active_route.waypoints.map((wp, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C929B] font-mono">[{wp.country}]</span>
                    <span className="text-[#E1E4E8]">{wp.name}</span>
                  </div>
                  <span className="text-[#8C929B] uppercase text-[10px]">
                    {wp.type || 'WAYPOINT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Alpine & Weather Radar */}
        <div className="bg-[#0F1113] border border-[#2A2D32] p-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-1.5">
              <span className="font-bold text-[#FFFFFF] tracking-wider uppercase flex items-center gap-1.5">
                <CloudSnow className="w-3.5 h-3.5 text-[#e5bf7d]" />
                TRANS-ALPINE WEATHER & PASS MONITOR
              </span>
              <span className="text-[#e5bf7d] text-[10px] font-bold">
                RADAR ONLINE
              </span>
            </div>

            <div className="p-3 bg-[#181A1D] border border-[#8C734B] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#e5bf7d]">
                <AlertTriangle className="w-4 h-4" />
                <span>ACTIVE ADVISORY: BRENNER A13 & GOTTHARD TRANSIT</span>
              </div>
              <p className="text-[11px] text-[#E1E4E8]">
                {currentVehicle.active_route.weather_hazard
                  ? `${currentVehicle.active_route.weather_hazard.location} — ${currentVehicle.active_route.weather_hazard.description}`
                  : 'Austrian ASFINAG sectoral night-driving ban active on A13 for non-Euro 6 vehicles. German A3 Leverkusen bridge weight sensor limit enforced.'}
              </p>
              <div className="text-[10px] text-[#8C929B]">
                SYSTEM IMPACT: AdBlue consumption nominal. Tachograph remaining drive window: verified under EC 561/2006.
              </div>
            </div>

            {activeDetourState && (
              <div className="p-2.5 bg-[#4E6E5D]/20 border border-[#4E6E5D] text-[#8cd1aa] text-xs font-bold">
                {activeDetourState}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#2A2D32] flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#8C929B]">
              TOLL & EMISSION CALCULATION: ACTIVE
            </span>
            <button
              onClick={handleRecalculateAlternate}
              className="mta-btn px-4 py-2 bg-[#FFFFFF] border border-[#FFFFFF] hover:bg-[#E1E4E8] text-[#0F1113] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,255,255,0.15)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RECALCULATE TEN-T ALTERNATE CORRIDOR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
