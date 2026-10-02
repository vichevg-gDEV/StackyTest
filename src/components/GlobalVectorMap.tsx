/// <reference types="google.maps" />
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { Vehicle } from '../types';
import { 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  AlertTriangle,
  Compass,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { formatMass, formatSpeed, formatCurrencyEur } from '../utils/formatters';

interface GlobalVectorMapProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  heightClass?: string;
}

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBgtz--h7VODJG5mKLxesn-xgIiL0cqGh4';

// Component to render European TEN-T route polylines and hazard circles on Google Map
const MapOverlays: React.FC<{
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  showRoutes: boolean;
  showHazards: boolean;
}> = ({ vehicles, selectedVehicleId, showRoutes, showHazards }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylinesRef = useRef<{ [id: string]: google.maps.Polyline }>({});
  const circlesRef = useRef<google.maps.Circle[]>([]);

  // Update Route Polylines
  useEffect(() => {
    if (!map || !mapsLib) return;

    if (!showRoutes) {
      Object.values(polylinesRef.current).forEach((p) => p.setMap(null));
      polylinesRef.current = {};
      return;
    }

    vehicles.forEach((v) => {
      if (!v.active_route || !v.active_route.waypoints) return;
      const isSelected = v.vehicle_id === selectedVehicleId;
      const path = v.active_route.waypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));

      if (polylinesRef.current[v.vehicle_id]) {
        const poly = polylinesRef.current[v.vehicle_id];
        poly.setPath(path);
        poly.setOptions({
          strokeColor: isSelected ? '#FFFFFF' : '#8C929B',
          strokeOpacity: isSelected ? 0.95 : 0.45,
          strokeWeight: isSelected ? 3 : 1.5,
          zIndex: isSelected ? 100 : 10,
        });
      } else {
        const poly = new mapsLib.Polyline({
          path,
          strokeColor: isSelected ? '#FFFFFF' : '#8C929B',
          strokeOpacity: isSelected ? 0.95 : 0.45,
          strokeWeight: isSelected ? 3 : 1.5,
          map,
          zIndex: isSelected ? 100 : 10,
        });
        polylinesRef.current[v.vehicle_id] = poly;
      }
    });

    const activeIds = new Set(vehicles.map((v) => v.vehicle_id));
    Object.keys(polylinesRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        polylinesRef.current[id].setMap(null);
        delete polylinesRef.current[id];
      }
    });
  }, [map, mapsLib, vehicles, selectedVehicleId, showRoutes]);

  // Update European Alpine Passes & Low Emission Zones
  useEffect(() => {
    if (!map || !mapsLib) return;

    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    if (!showHazards) return;

    // Brenner Pass Alpine Snow & Sectoral Driving Restriction Zone
    const brennerCircle = new mapsLib.Circle({
      strokeColor: '#8C734B',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: '#8C734B',
      fillOpacity: 0.25,
      map,
      center: { lat: 47.0050, lng: 11.5050 },
      radius: 40000,
      zIndex: 5,
    });

    // Paris Île-de-France Crit'Air Low Emission Zone
    const critAirCircle = new mapsLib.Circle({
      strokeColor: '#4E6E5D',
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
      fillColor: '#4E6E5D',
      fillOpacity: 0.2,
      map,
      center: { lat: 48.8566, lng: 2.3522 },
      radius: 35000,
      zIndex: 5,
    });

    // Gotthard Tunnel Safety Metering Zone
    const gotthardCircle = new mapsLib.Circle({
      strokeColor: '#7A3E3E',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: '#7A3E3E',
      fillOpacity: 0.25,
      map,
      center: { lat: 46.5986, lng: 8.5947 },
      radius: 28000,
      zIndex: 5,
    });

    circlesRef.current = [brennerCircle, critAirCircle, gotthardCircle];

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
    };
  }, [map, mapsLib, showHazards]);

  return null;
};

// Component for European Corridor Camera Control
const MapController: React.FC<{
  activeSector: string;
  zoomInTrigger: number;
  zoomOutTrigger: number;
  resetTrigger: number;
  focusVehicle: Vehicle | null;
}> = ({ activeSector, zoomInTrigger, zoomOutTrigger, resetTrigger, focusVehicle }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    switch (activeSector) {
      case 'EUROPE':
        map.panTo({ lat: 49.5, lng: 9.0 });
        map.setZoom(5);
        break;
      case 'RHINE-ALPINE':
        map.panTo({ lat: 48.5, lng: 8.2 });
        map.setZoom(6);
        break;
      case 'BENELUX-BALTIC':
        map.panTo({ lat: 52.2, lng: 9.8 });
        map.setZoom(6);
        break;
      case 'MEDITERRANEAN':
        map.panTo({ lat: 42.8, lng: 3.5 });
        map.setZoom(6);
        break;
      case 'SCANDINAVIA':
        map.panTo({ lat: 56.5, lng: 12.5 });
        map.setZoom(6);
        break;
      case 'CENTRAL-EAST':
        map.panTo({ lat: 49.8, lng: 15.2 });
        map.setZoom(6);
        break;
      default:
        break;
    }
  }, [map, activeSector]);

  useEffect(() => {
    if (!map || zoomInTrigger === 0) return;
    map.setZoom((map.getZoom() || 5) + 1);
  }, [map, zoomInTrigger]);

  useEffect(() => {
    if (!map || zoomOutTrigger === 0) return;
    map.setZoom((map.getZoom() || 5) - 1);
  }, [map, zoomOutTrigger]);

  useEffect(() => {
    if (!map || resetTrigger === 0) return;
    map.panTo({ lat: 49.5, lng: 9.0 });
    map.setZoom(5);
  }, [map, resetTrigger]);

  useEffect(() => {
    if (!map || !focusVehicle) return;
    map.panTo({
      lat: focusVehicle.location.latitude,
      lng: focusVehicle.location.longitude,
    });
    if ((map.getZoom() || 5) < 7) {
      map.setZoom(8);
    }
  }, [map, focusVehicle]);

  return null;
};

export const GlobalVectorMap: React.FC<GlobalVectorMapProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  heightClass = 'h-[520px]',
}) => {
  const [layers, setLayers] = useState({
    trucks: true,
    routes: true,
    hazards: true,
  });

  const [activeSector, setActiveSector] = useState<string>('EUROPE');
  const [zoomInCount, setZoomInCount] = useState<number>(0);
  const [zoomOutCount, setZoomOutCount] = useState<number>(0);
  const [resetCount, setResetCount] = useState<number>(0);
  const [focusVehicle, setFocusVehicle] = useState<Vehicle | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.vehicle_id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  return (
    <div className={`relative w-full ${heightClass} bg-[#0F1113] border border-[#2A2D32] flex flex-col overflow-hidden font-tabular select-none`}>
      {/* Top Map HUD Bar */}
      <div className="z-20 bg-[#181A1D] border-b border-[#2A2D32] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-[#FFFFFF]" />
          <span className="font-bold text-[#FFFFFF] tracking-wider uppercase">
            TEN-T CORRIDOR MAP // EUROPEAN SPATIAL TELEMETRY
          </span>
          <span className="text-[#8C929B] border-l border-[#2A2D32] pl-2 hidden sm:inline">
            SYSTEM: <span className="text-[#E1E4E8]">GOOGLE MAPS (DARK MERCATOR)</span>
          </span>
          <span className="text-[#8C929B] border-l border-[#2A2D32] pl-2">
            FLEET: <span className="text-[#FFFFFF] font-bold">{vehicles.length} HGVs</span>
          </span>
        </div>

        {/* European Corridor Sector Presets */}
        <div className="flex items-center gap-1">
          <span className="text-[#8C929B] text-[10px]">CORRIDOR:</span>
          {['EUROPE', 'RHINE-ALPINE', 'BENELUX-BALTIC', 'MEDITERRANEAN', 'SCANDINAVIA', 'CENTRAL-EAST'].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSector(sec)}
              className={`mta-btn px-2 py-0.5 text-[10px] border ${
                activeSector === sec
                  ? 'bg-[#2A2D32] border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#181A1D] border-[#2A2D32] text-[#8C929B] hover:text-[#E1E4E8]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-3 text-[11px] border-l border-[#2A2D32] pl-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#8C929B] hover:text-[#E1E4E8]">
            <input
              type="checkbox"
              checked={layers.trucks}
              onChange={(e) => setLayers({ ...layers, trucks: e.target.checked })}
              className="accent-[#FFFFFF] w-3 h-3 rounded-none"
            />
            <span className={layers.trucks ? 'text-[#E1E4E8]' : 'text-[#8C929B]'}>HGVs ({vehicles.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#8C929B] hover:text-[#E1E4E8]">
            <input
              type="checkbox"
              checked={layers.routes}
              onChange={(e) => setLayers({ ...layers, routes: e.target.checked })}
              className="accent-[#FFFFFF] w-3 h-3 rounded-none"
            />
            <span className={layers.routes ? 'text-[#E1E4E8]' : 'text-[#8C929B]'}>TEN-T Routes</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#8C929B] hover:text-[#E1E4E8]">
            <input
              type="checkbox"
              checked={layers.hazards}
              onChange={(e) => setLayers({ ...layers, hazards: e.target.checked })}
              className="accent-[#FFFFFF] w-3 h-3 rounded-none"
            />
            <span className={layers.hazards ? 'text-[#e5bf7d]' : 'text-[#8C929B]'}>Alps & LEZ</span>
          </label>
        </div>
      </div>

      {/* Main Google Maps Viewport with APIProvider */}
      <div className="relative flex-1 w-full h-full">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} solutionChannel="GMP_aistudio">
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={{ lat: 49.5, lng: 9.0 }}
            defaultZoom={5}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            gestureHandling="greedy"
            colorScheme="DARK"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Map Camera Controller */}
            <MapController
              activeSector={activeSector}
              zoomInTrigger={zoomInCount}
              zoomOutTrigger={zoomOutCount}
              resetTrigger={resetCount}
              focusVehicle={focusVehicle}
            />

            {/* Polylines & Weather/Clearance Hazards */}
            <MapOverlays
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              showRoutes={layers.routes}
              showHazards={layers.hazards}
            />

            {/* Advanced Markers for All 14 European Fleet Trucks */}
            {layers.trucks &&
              vehicles.map((v) => {
                const isSelected = v.vehicle_id === selectedVehicleId;

                return (
                  <AdvancedMarker
                    key={v.vehicle_id}
                    position={{ lat: v.location.latitude, lng: v.location.longitude }}
                    onClick={() => {
                      onSelectVehicle(v.vehicle_id);
                      setFocusVehicle(v);
                    }}
                    zIndex={isSelected ? 1000 : 100}
                  >
                    {/* Custom Sharp MTA Truck Badge */}
                    <div
                      className={`relative px-2 py-1 flex items-center gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FFFFFF] text-[#0F1113] border-2 border-[#FFFFFF] shadow-[0_0_16px_rgba(255,255,255,0.8)] scale-105'
                          : 'bg-[#181A1D] text-[#E1E4E8] border border-[#2A2D32] hover:border-[#FFFFFF] shadow-lg'
                      }`}
                      style={{ borderRadius: '0px' }}
                    >
                      {/* Pulse pip */}
                      <span
                        className="inline-block w-2 h-2 shrink-0"
                        style={{
                          backgroundColor: v.status === 'ON-ROUTE' ? (isSelected ? '#0F1113' : '#4E6E5D') : '#8C734B',
                          borderRadius: '0px',
                        }}
                      />

                      <span className="font-bold text-[10px] tracking-wider whitespace-nowrap">
                        {v.vehicle_id}
                      </span>

                      <span className="text-[9px] opacity-80 whitespace-nowrap">
                        {Math.round(v.metrics.speed_kmh)}k
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}
          </Map>
        </APIProvider>

        {/* Tactical Coordinates HUD Overlay */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none text-[10px] text-[#8C929B] bg-[#181A1D]/85 border border-[#2A2D32] p-2 space-y-0.5">
          <div>JURISDICTION: EUROPEAN UNION // DIRECTIVE 96/53/EC</div>
          <div>HOURS OF SERVICE: EC REGULATION 561/2006 (GEN 2 SMART TACHO)</div>
          <div>TELEMETRY: 14 HGVs TEN-T WAYPOINT NAVIGATION @ 10Hz</div>
        </div>

        {/* Tactical Zoom Toolbar */}
        <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-1 bg-[#181A1D] border border-[#2A2D32] p-1">
          <button
            onClick={() => setZoomInCount((c) => c + 1)}
            className="mta-btn p-1.5 text-[#8C929B] hover:text-[#FFFFFF] hover:bg-[#2A2D32]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomOutCount((c) => c + 1)}
            className="mta-btn p-1.5 text-[#8C929B] hover:text-[#FFFFFF] hover:bg-[#2A2D32]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setResetCount((c) => c + 1)}
            className="mta-btn p-1.5 text-[#8C929B] hover:text-[#FFFFFF] hover:bg-[#2A2D32]"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Truck Real-Time Inspector Drawer */}
        {selectedVehicle && (
          <div className="absolute top-3 right-3 z-10 w-84 bg-[#181A1D] border-2 border-[#FFFFFF] p-3 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#FFFFFF]" />
                <span className="text-[#FFFFFF] font-bold tracking-wider">
                  {selectedVehicle.vehicle_id} // {selectedVehicle.plate_number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFocusVehicle(selectedVehicle)}
                  className="px-2 py-0.5 text-[10px] bg-[#2A2D32] border border-[#8C929B] text-[#FFFFFF]"
                  title="Center Map"
                >
                  CENTER
                </button>
                <button
                  onClick={() => onSelectVehicle('')}
                  className="text-[#8C929B] hover:text-[#FFFFFF]"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {/* Task Title */}
              <div className="p-1.5 bg-[#0F1113] border border-[#2A2D32]">
                <div className="text-[10px] text-[#8C929B] font-bold">CURRENT ACTIVE TEN-T TASK:</div>
                <div className="text-[#FFFFFF] font-medium truncate">{selectedVehicle.current_task}</div>
                <div className="text-[10px] text-[#8cd1aa] mt-0.5">
                  PHASE: {selectedVehicle.task_phase} ({selectedVehicle.route_progress_pct}% COMPLETED)
                </div>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">DRIVER / TRACTOR:</span>
                <span className="text-[#E1E4E8] font-medium">{selectedVehicle.driver_name} · {selectedVehicle.make_model}</span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">LOCATION (EU):</span>
                <span className="text-[#E1E4E8]">
                  {selectedVehicle.location.latitude.toFixed(4)}°N, {selectedVehicle.location.longitude.toFixed(4)}°E ({selectedVehicle.location.city}, {selectedVehicle.location.country})
                </span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">SPEED / EMISSIONS:</span>
                <span className="text-[#FFFFFF] font-bold">
                  {formatSpeed(selectedVehicle.metrics.speed_kmh)} · {selectedVehicle.emission_standard}
                </span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">PAYLOAD MASS (DIRECTIVE 96/53):</span>
                <span className="text-[#FFFFFF] font-bold">
                  {formatMass(selectedVehicle.metrics.current_gross_mass_kg)} / {formatMass(selectedVehicle.trailer_spec.max_payload_kg)}
                </span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">EURO-PALLETS (EPAL 1):</span>
                <span className="text-[#E1E4E8] font-bold">
                  {selectedVehicle.metrics.euro_pallets_loaded} / {selectedVehicle.trailer_spec.max_euro_pallets} EPAL LOADED
                </span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">TIRE PRESSURES / ADBLUE:</span>
                <span className="text-[#E1E4E8]">
                  {selectedVehicle.metrics.tire_pressure_bar.join('/')} bar · AdBlue {selectedVehicle.metrics.adblue_level_pct}%
                </span>
              </div>

              <div className="flex justify-between py-0.5 border-b border-[#2A2D32]/50">
                <span className="text-[#8C929B]">TEN-T ROUTE & TOLLS:</span>
                <span className="text-[#E1E4E8] truncate max-w-[160px]">{selectedVehicle.active_route.route_name} ({formatCurrencyEur(selectedVehicle.active_route.toll_cost_eur)})</span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-[#8C929B]">DESTINATION ETA:</span>
                <span className="text-[#8cd1aa] font-bold">
                  {selectedVehicle.active_route.destination_name} ({selectedVehicle.active_route.est_time_remaining})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
