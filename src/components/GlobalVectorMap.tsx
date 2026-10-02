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
  ShieldCheck,
  Layers,
  MapPin
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
          strokeColor: isSelected ? '#2563EB' : '#94A3B8',
          strokeOpacity: isSelected ? 0.95 : 0.6,
          strokeWeight: isSelected ? 4 : 2,
          zIndex: isSelected ? 100 : 10,
        });
      } else {
        const poly = new mapsLib.Polyline({
          path,
          strokeColor: isSelected ? '#2563EB' : '#94A3B8',
          strokeOpacity: isSelected ? 0.95 : 0.6,
          strokeWeight: isSelected ? 4 : 2,
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
      strokeColor: '#D97706',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: '#F59E0B',
      fillOpacity: 0.2,
      map,
      center: { lat: 47.0050, lng: 11.5050 },
      radius: 40000,
      zIndex: 5,
    });

    // Paris Île-de-France Crit'Air Low Emission Zone
    const critAirCircle = new mapsLib.Circle({
      strokeColor: '#059669',
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
      fillColor: '#10B981',
      fillOpacity: 0.15,
      map,
      center: { lat: 48.8566, lng: 2.3522 },
      radius: 35000,
      zIndex: 5,
    });

    // Gotthard Tunnel Safety Metering Zone
    const gotthardCircle = new mapsLib.Circle({
      strokeColor: '#DC2626',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: '#EF4444',
      fillOpacity: 0.2,
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
    <div className={`relative w-full ${heightClass} bg-slate-100 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden select-none`}>
      {/* Top Map HUD Bar */}
      <div className="z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="font-bold text-slate-900 tracking-tight">
            TEN-T European Freight Corridors
          </span>
          <span className="text-slate-400 border-l border-slate-200 pl-2">
            Fleet: <strong className="text-slate-700">{vehicles.length} HGVs</strong>
          </span>
        </div>

        {/* European Corridor Sector Presets */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Corridor:</span>
          {['EUROPE', 'RHINE-ALPINE', 'BENELUX-BALTIC', 'MEDITERRANEAN', 'SCANDINAVIA', 'CENTRAL-EAST'].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSector(sec)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                activeSector === sec
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-3 text-xs border-l border-slate-200 pl-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.trucks}
              onChange={(e) => setLayers({ ...layers, trucks: e.target.checked })}
              className="accent-blue-600 w-3.5 h-3.5 rounded-sm"
            />
            <span>HGVs ({vehicles.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.routes}
              onChange={(e) => setLayers({ ...layers, routes: e.target.checked })}
              className="accent-blue-600 w-3.5 h-3.5 rounded-sm"
            />
            <span>TEN-T Routes</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.hazards}
              onChange={(e) => setLayers({ ...layers, hazards: e.target.checked })}
              className="accent-amber-600 w-3.5 h-3.5 rounded-sm"
            />
            <span>Alps & LEZ Zones</span>
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
            colorScheme="LIGHT"
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

            {/* Polylines & Hazards */}
            <MapOverlays
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              showRoutes={layers.routes}
              showHazards={layers.hazards}
            />

            {/* Markers for All 14 European Fleet Trucks */}
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
                    {/* Modern Clean Truck Pin Badge */}
                    <div
                      className={`relative px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer rounded-lg shadow-md border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-500/20 scale-105 shadow-lg'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:shadow-lg'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          v.status === 'ON-ROUTE'
                            ? (isSelected ? 'bg-white' : 'bg-emerald-500')
                            : 'bg-amber-500'
                        }`}
                      />

                      <span className="font-bold text-xs font-mono tracking-tight">
                        {v.vehicle_id}
                      </span>

                      <span className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {Math.round(v.metrics.speed_kmh)}k
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}
          </Map>
        </APIProvider>

        {/* Tactical Coordinates HUD Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none text-[11px] text-slate-600 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <div className="font-semibold text-slate-800">EU JURISDICTION: DIRECTIVE 96/53/EC</div>
          <div>HOURS OF SERVICE: EC REGULATION 561/2006 (GEN 2 SMART TACHO)</div>
          <div>SPEED LIMITER: 90 km/h MANDATED CAP</div>
        </div>

        {/* Tactical Zoom Toolbar */}
        <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
          <button
            onClick={() => setZoomInCount((c) => c + 1)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomOutCount((c) => c + 1)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setResetCount((c) => c + 1)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Truck Inspector Drawer */}
        {selectedVehicle && (
          <div className="absolute top-3 right-3 z-10 w-88 bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-900 font-bold text-sm tracking-tight">
                  {selectedVehicle.vehicle_id}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  {selectedVehicle.plate_number}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFocusVehicle(selectedVehicle)}
                  className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Center Map on Vehicle"
                >
                  Center
                </button>
                <button
                  onClick={() => onSelectVehicle('')}
                  className="w-6 h-6 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Task Title */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Current TEN-T Task:</div>
                <div className="text-slate-800 font-semibold truncate mt-0.5">{selectedVehicle.current_task}</div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <span>Phase: {selectedVehicle.task_phase}</span>
                  <span>·</span>
                  <span>{selectedVehicle.route_progress_pct}% Completed</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Driver & Model:</span>
                <span className="text-slate-800 font-medium">{selectedVehicle.driver_name} · {selectedVehicle.make_model}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800 font-medium">
                  {selectedVehicle.location.city}, {selectedVehicle.location.country}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Speed & Standard:</span>
                <span className="text-slate-900 font-bold">
                  {formatSpeed(selectedVehicle.metrics.speed_kmh)} · {selectedVehicle.emission_standard}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Euro-Pallets (EPAL 1):</span>
                <span className="text-blue-700 font-bold">
                  {selectedVehicle.metrics.euro_pallets_loaded} / {selectedVehicle.trailer_spec.max_euro_pallets} EPAL Loaded
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tire Pressure / AdBlue:</span>
                <span className="text-slate-800 font-mono">
                  {selectedVehicle.metrics.tire_pressure_bar[0]} bar · AdBlue {selectedVehicle.metrics.adblue_level_pct}%
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Corridor Route:</span>
                <span className="text-slate-800 font-medium truncate max-w-[160px]">
                  {selectedVehicle.active_route.route_name}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Destination ETA:</span>
                <span className="text-emerald-700 font-bold">
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
