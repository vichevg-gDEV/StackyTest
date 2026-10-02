import React, { useState, useEffect } from 'react';
import { 
  Vehicle, 
  Manifest, 
  Driver, 
  Operator, 
  SystemAlert, 
  ActiveNavTab 
} from './types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_MANIFESTS, 
  INITIAL_DRIVERS, 
  INITIAL_OPERATORS, 
  INITIAL_ALERTS 
} from './data/mockData';
import { Header } from './components/Header';
import { NavBar } from './components/NavBar';
import { GlobalVectorMap } from './components/GlobalVectorMap';
import { FleetTelemetryList } from './components/FleetTelemetryList';
import { SelectedCargoInspector } from './components/SelectedCargoInspector';
import { AssignmentControlPanel } from './components/AssignmentControlPanel';
import { SystemAlertsBanner } from './components/SystemAlertsBanner';
import { RouteNavigationEngine } from './components/RouteNavigationEngine';
import { DispatchAssignmentEngine } from './components/DispatchAssignmentEngine';
import { CapacityPayloadMatrix } from './components/CapacityPayloadMatrix';
import { DriverAnalyticsDashboard } from './components/DriverAnalyticsDashboard';
import { DigitalBolModal } from './components/DigitalBolModal';
import { NewPackageEntryModal } from './components/NewPackageEntryModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('CONSOLE');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [manifests, setManifests] = useState<Manifest[]>(INITIAL_MANIFESTS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(INITIAL_VEHICLES[0]?.vehicle_id || 'HGV-DE-4092');
  const [activeBolManifestId, setActiveBolManifestId] = useState<string | null>(null);
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Google Maps Quota Listener
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Live Telemetry Real-World Task Simulation Engine (1.5s tick)
  // Enforces European Directive 92/6/EEC / 2002/85/EC speed limiter (Max 90 km/h) & EC 561/2006 tachograph updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 1. Advance vehicles along European TEN-T highway waypoints
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'ON-ROUTE' && v.status !== 'IN-TRANS') {
            // For IDLE or LOADING trucks, simulate dock operations
            if (v.status === 'LOADING') {
              const newVol = Math.min(v.trailer_spec.max_vol_m3 * 0.9, v.metrics.current_vol_m3 + 0.4);
              const newMass = Math.min(v.trailer_spec.max_payload_kg * 0.88, v.metrics.current_gross_mass_kg + 120);
              return {
                ...v,
                metrics: {
                  ...v.metrics,
                  current_vol_m3: Number(newVol.toFixed(1)),
                  current_gross_mass_kg: Math.round(newMass),
                  mass_load_index_pct: Number(((newMass / v.trailer_spec.max_payload_kg) * 100).toFixed(1)),
                },
              };
            }
            return v;
          }

          const waypoints = v.active_route.waypoints;
          if (!waypoints || waypoints.length === 0) return v;

          let wpIdx = v.current_waypoint_index;
          let targetWp = waypoints[wpIdx] || waypoints[waypoints.length - 1];

          const dLat = targetWp.lat - v.location.latitude;
          const dLng = targetWp.lng - v.location.longitude;
          const dist = Math.hypot(dLat, dLng);

          // If reached waypoint, move to next waypoint
          if (dist < 0.035) {
            if (wpIdx < waypoints.length - 1) {
              wpIdx += 1;
              targetWp = waypoints[wpIdx];
            } else {
              // Reached destination, turn back or complete task
              wpIdx = 0;
              targetWp = waypoints[0];
            }
          }

          // Advance towards target waypoint along real highway corridor
          const speedStep = (v.metrics.speed_kmh / 3600) * 0.08;
          const stepDist = Math.max(0.0015, Math.min(dist, speedStep));
          const dirLat = dist > 0 ? (targetWp.lat - v.location.latitude) / dist : 0;
          const dirLng = dist > 0 ? (targetWp.lng - v.location.longitude) / dist : 0;

          const newLat = v.location.latitude + dirLat * stepDist;
          const newLng = v.location.longitude + dirLng * stepDist;

          // Bearing angle
          const bearing = (Math.atan2(dirLng, dirLat) * (180 / Math.PI) + 360) % 360;

          // Calibrated speed variation capped at European 90 km/h statutory limiter
          let currentSpeed = v.metrics.speed_kmh;
          let currentPhase = v.task_phase;

          if (targetWp.type === 'customs_border' && dist < 0.08) {
            currentSpeed = 30 + Math.random() * 8;
            currentPhase = 'TOLL_GANTRY';
          } else if (targetWp.type === 'destination' && dist < 0.08) {
            currentSpeed = 35 + Math.random() * 8;
            currentPhase = 'DOCK_APPROACH';
          } else {
            // Statutory European HGV limit: 80 - 89 km/h (Never > 90 km/h)
            currentSpeed = Math.max(76, Math.min(89.5, 84 + (Math.random() - 0.5) * 5));
            currentPhase = 'HIGHWAY_TRANSIT';
          }

          const progress = Math.min(100, Math.round((wpIdx / Math.max(1, waypoints.length - 1)) * 100));

          return {
            ...v,
            task_phase: currentPhase,
            current_waypoint_index: wpIdx,
            route_progress_pct: progress,
            location: {
              ...v.location,
              latitude: Number(newLat.toFixed(5)),
              longitude: Number(newLng.toFixed(5)),
              heading_deg: Number(bearing.toFixed(1)),
            },
            metrics: {
              ...v.metrics,
              speed_kmh: Number(currentSpeed.toFixed(1)),
              fuel_level_pct: Math.max(8, Number((v.metrics.fuel_level_pct - 0.01).toFixed(2))),
              adblue_level_pct: Math.max(15, Number((v.metrics.adblue_level_pct - 0.005).toFixed(2))),
              engine_temp_c: Number((86.0 + Math.random() * 2.0).toFixed(1)),
            },
          };
        })
      );

      // 2. Realistic Tachograph tick: advance active drivers' continuous driving time
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) => {
          if (!d.assigned_vehicle_id) return d;
          const assignedVeh = vehicles.find((v) => v.vehicle_id === d.assigned_vehicle_id);
          if (!assignedVeh || assignedVeh.status !== 'ON-ROUTE') return d;

          // Increment continuous drive time slightly
          const newMins = Math.min(270, d.continuous_drive_minutes + 1);
          let newStatus = d.tacho_status;
          let breakIn = d.mandatory_break_in;

          const minsLeft = 270 - newMins;
          if (minsLeft <= 15) {
            newStatus = 'BREAK_DUE';
            breakIn = `00h ${String(minsLeft).padStart(2, '0')}m [MANDATORY 45m BREAK DUE]`;
          } else {
            const h = Math.floor(minsLeft / 60);
            const m = minsLeft % 60;
            breakIn = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m (45m Pause Required)`;
          }

          return {
            ...d,
            continuous_drive_minutes: newMins,
            daily_driving_hours: Number((d.daily_driving_hours + 1 / 60).toFixed(2)),
            tacho_status: newStatus,
            mandatory_break_in: breakIn,
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, vehicles]);

  // Selected vehicle & manifest lookups
  const selectedVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId) || vehicles[0];
  const selectedManifest = manifests.find((m) => m.manifest_id === selectedVehicle?.assigned_manifest_id) || manifests[0];
  const bolManifest = manifests.find((m) => m.manifest_id === activeBolManifestId) || null;
  const bolVehicle = bolManifest ? vehicles.find((v) => v.vehicle_id === bolManifest.assignment_status.assigned_vehicle) || null : null;
  const bolDriver = bolManifest ? drivers.find((d) => d.driver_id === bolManifest.assignment_status.assigned_driver) || null : null;

  // New Package Creation Handler
  const handleCreatePackage = (newManifest: Manifest) => {
    setManifests((prev) => [newManifest, ...prev]);

    // Push notification alert
    const newAlert: SystemAlert = {
      id: `ALT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'CET' }) + ' CET',
      type: 'ROUTE_UPDATE',
      severity: 'info',
      title: 'New Package Load Registered',
      description: `Package "${newManifest.cargo_description}" registered (${newManifest.metrics.euro_pallets_count} EPAL / ${newManifest.metrics.total_mass_kg} kg). e-CMR ${newManifest.ecmr_number} issued. Ready for dispatch assignment.`,
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // European Dispatch Manifest Assignment Handler with EC 561/2006 & Directive 96/53/EC Validation Logic
  const handleAssignManifest = (
    manifestId: string,
    vehicleId: string,
    driverId: string
  ): { success: boolean; errors: string[] } => {
    const targetManifest = manifests.find((m) => m.manifest_id === manifestId);
    const targetVehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
    const targetDriver = drivers.find((d) => d.driver_id === driverId);

    const errors: string[] = [];

    if (!targetManifest || !targetVehicle || !targetDriver) {
      return { success: false, errors: ['Invalid target manifest, vehicle, or driver parameters.'] };
    }

    // 1. EC 561/2006: Is driver within continuous driving & daily limits?
    const continuousRemainingMins = 270 - targetDriver.continuous_drive_minutes;
    if (continuousRemainingMins < 30) {
      errors.push(
        `Driver ${targetDriver.driver_name} has only ${continuousRemainingMins} minutes remaining before mandatory 45-minute tachograph rest pause (EC 561/2006 violation). Dispatch blocked.`
      );
    }
    if (targetDriver.daily_driving_hours >= 9.0) {
      errors.push(
        `Driver ${targetDriver.driver_name} has reached the statutory daily 9.0h driving limit under EC Regulation 561/2006. Mandatory 11h daily rest required.`
      );
    }

    // 2. Directive 96/53/EC: Does cargo exceed maximum allowable payload (40t MAM)?
    if (targetManifest.metrics.total_mass_kg > targetVehicle.trailer_spec.max_payload_kg) {
      errors.push(
        `Manifest mass (${targetManifest.metrics.total_mass_kg} kg) exceeds vehicle statutory payload limit (${targetVehicle.trailer_spec.max_payload_kg} kg) under Directive 96/53/EC 40t MAM.`
      );
    }

    // 3. Euro-pallet capacity check (33 EPAL standard 13.6m semi-trailer)
    if (targetManifest.metrics.euro_pallets_count > targetVehicle.trailer_spec.max_euro_pallets) {
      errors.push(
        `Manifest package count (${targetManifest.metrics.euro_pallets_count} EPAL) exceeds trailer floor capacity (${targetVehicle.trailer_spec.max_euro_pallets} EPAL 1).`
      );
    }

    // 4. Trailer internal box dimensions check (Directive 96/53/EC)
    const dims = targetManifest.metrics.max_unit_dimensions_m;
    if (
      dims.width > targetVehicle.trailer_spec.internal_width_m ||
      dims.height > targetVehicle.trailer_spec.internal_height_m
    ) {
      errors.push(
        `Cargo package dimension (${dims.width}m W x ${dims.height}m H) exceeds internal Euro-trailer portal enclosure (${targetVehicle.trailer_spec.internal_width_m}m W x ${targetVehicle.trailer_spec.internal_height_m}m H).`
      );
    }

    // 5. Regulation (EC) 1072/2009 Cabotage limit check
    if (targetManifest.cabotage_operation_count > 3) {
      errors.push(
        `EU Cabotage limit exceeded: Host state carriage count is ${targetManifest.cabotage_operation_count} (Statutory limit is max 3 operations within 7 days per Regulation (EC) 1072/2009).`
      );
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Update state upon valid assignment
    const nowIso = new Date().toISOString();

    setManifests((prev) =>
      prev.map((m) =>
        m.manifest_id === manifestId
          ? {
              ...m,
              assignment_status: {
                assigned_vehicle: vehicleId,
                assigned_driver: driverId,
                dispatch_operator: 'OP-102 (Miller)',
                timestamp_assigned: nowIso,
                status: 'ASSIGNED',
              },
            }
          : m
      )
    );

    setVehicles((prev) =>
      prev.map((v) =>
        v.vehicle_id === vehicleId
          ? {
              ...v,
              assigned_manifest_id: manifestId,
              driver_id: driverId,
              driver_name: targetDriver.driver_name,
              status: 'ON-ROUTE',
              metrics: {
                ...v.metrics,
                current_gross_mass_kg: targetManifest.metrics.total_mass_kg,
                current_vol_m3: targetManifest.metrics.total_volume_m3,
                euro_pallets_loaded: targetManifest.metrics.euro_pallets_count,
                mass_load_index_pct: Number(
                  ((targetManifest.metrics.total_mass_kg / v.trailer_spec.max_payload_kg) * 100).toFixed(1)
                ),
                ignition_state: 'ON',
              },
            }
          : v
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.driver_id === driverId
          ? {
              ...d,
              assigned_vehicle_id: vehicleId,
            }
          : d
      )
    );

    // Add confirmation system alert
    const newAlert: SystemAlert = {
      id: `ALT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'CET' }) + ' CET',
      type: 'ROUTE_UPDATE',
      severity: 'info',
      title: 'e-CMR Consignment Dispatched',
      description: `e-CMR ${targetManifest.ecmr_number} assigned to ${vehicleId} (${targetDriver.driver_name}). Transmitted to in-cab DTCO smart tachograph terminal.`,
      vehicle_id: vehicleId,
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    return { success: true, errors: [] };
  };

  // Re-route vehicle handler with European TEN-T corridor bypasses
  const handleRerouteVehicle = (vehicleId: string, detourReason: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.vehicle_id !== vehicleId) return v;
        return {
          ...v,
          active_route: {
            ...v.active_route,
            route_name: `${v.active_route.route_name} (TEN-T Bypass Applied)`,
            current_segment: 'Detour via Alternate Motorway Corridor (LKW-Maut / Telepass Sync)',
            toll_cost_eur: v.active_route.toll_cost_eur + 14.50,
            est_time_remaining: '02h 45m (+12m detour)',
          },
        };
      })
    );

    const detourAlert: SystemAlert = {
      id: `ALT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'CET' }) + ' CET',
      type: 'ROUTE_UPDATE',
      severity: 'info',
      title: 'TEN-T Detour Pushed to OBU',
      description: `HGV ${vehicleId}: ${detourReason}. Clearance route deployed to in-cab navigation terminal.`,
      vehicle_id: vehicleId,
      acknowledged: false,
    };
    setAlerts((prev) => [detourAlert, ...prev]);
  };

  // Acknowledge alert handler
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  // Reset to initial European baseline state
  const handleResetData = () => {
    setVehicles(INITIAL_VEHICLES);
    setManifests(INITIAL_MANIFESTS);
    setDrivers(INITIAL_DRIVERS);
    setOperators(INITIAL_OPERATORS);
    setAlerts(INITIAL_ALERTS);
    setSelectedVehicleId(INITIAL_VEHICLES[0]?.vehicle_id || 'HGV-DE-4092');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Google Maps Quota Defense Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onResetData={handleResetData}
        onOpenNewPackageModal={() => setIsNewPackageModalOpen(true)}
        operatorName="OP-102 (Miller)"
      />

      {/* Primary Section Navigation Tabs */}
      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingManifestsCount={manifests.filter((m) => m.assignment_status.status === 'PENDING').length}
        alertsCount={alerts.filter((a) => !a.acknowledged && a.severity !== 'info').length}
      />

      {/* Main Operational Viewport */}
      <main className="flex-1 p-4 max-w-[1920px] mx-auto w-full space-y-4">
        {/* Tab 0: Primary Console Wireframe */}
        {activeTab === 'CONSOLE' && (
          <div className="space-y-4">
            {/* Top Split: Section A (Vector Map) + Section B (Fleet Telemetry List) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* SECTION A: REAL-TIME VECTOR MAP ENGINE */}
              <div className="lg:col-span-8 flex flex-col">
                <GlobalVectorMap
                  vehicles={vehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={setSelectedVehicleId}
                  heightClass="h-[480px]"
                />
              </div>

              {/* SECTION B: EUROPEAN FLEET TELEMETRY & CONTROL */}
              <div className="lg:col-span-4 flex flex-col h-[480px]">
                <FleetTelemetryList
                  vehicles={vehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={setSelectedVehicleId}
                  onOpenAssignModal={() => setActiveTab('DISPATCH_BOARD')}
                  onOpenRerouteModal={(id) => handleRerouteVehicle(id, 'Brenner Pass Alpine transit detour')}
                />
              </div>
            </div>

            {/* Middle Split: Section C (Selected Cargo & Payload) + Section D (Assignment Control Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* SECTION C: SELECTED CARGO & PAYLOAD METRICS */}
              <SelectedCargoInspector
                vehicle={selectedVehicle}
                manifest={selectedManifest}
                onOpenPayloadModal={() => setActiveTab('CAPACITY_MATRIX')}
              />

              {/* SECTION D: ASSIGNMENT CONTROL PANEL */}
              <AssignmentControlPanel
                vehicles={vehicles}
                manifests={manifests}
                drivers={drivers}
                selectedVehicleId={selectedVehicleId}
                onAssignManifest={handleAssignManifest}
                onRerouteVehicle={handleRerouteVehicle}
                onOpenBolModal={(manifestId) => setActiveBolManifestId(manifestId)}
              />
            </div>

            {/* Bottom Row: SECTION E: EUROPEAN SYSTEM ALERTS & EC 561/2006 TACHOGRAPH MONITOR */}
            <SystemAlertsBanner
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
            />
          </div>
        )}

        {/* Tab 1: Global Vector Map Engine View */}
        {activeTab === 'GLOBAL_MAP' && (
          <div className="space-y-4">
            <GlobalVectorMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              heightClass="h-[780px]"
            />
          </div>
        )}

        {/* Tab 2: Fleet Route Navigation Engine */}
        {activeTab === 'FLEET_ROUTING' && (
          <RouteNavigationEngine
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            onApplyDetour={handleRerouteVehicle}
          />
        )}

        {/* Tab 3: Dispatch & Load Assignment Engine */}
        {activeTab === 'DISPATCH_BOARD' && (
          <DispatchAssignmentEngine
            vehicles={vehicles}
            manifests={manifests}
            drivers={drivers}
            onAssignManifest={handleAssignManifest}
            onOpenBolModal={(manifestId) => setActiveBolManifestId(manifestId)}
            onOpenNewPackageModal={() => setIsNewPackageModalOpen(true)}
          />
        )}

        {/* Tab 4: Capacity & Payload Matrix */}
        {activeTab === 'CAPACITY_MATRIX' && (
          <CapacityPayloadMatrix
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />
        )}

        {/* Tab 5: Logistics System Audit & Compliance Reports */}
        {activeTab === 'REPORTS' && (
          <DriverAnalyticsDashboard
            drivers={drivers}
            operators={operators}
            vehicles={vehicles}
          />
        )}
      </main>

      {/* Electronic Consignment Note (e-CMR) Modal View */}
      {activeBolManifestId && (
        <DigitalBolModal
          manifest={bolManifest}
          vehicle={bolVehicle}
          driver={bolDriver}
          onClose={() => setActiveBolManifestId(null)}
        />
      )}

      {/* New Package & Consignment Entry Modal */}
      <NewPackageEntryModal
        isOpen={isNewPackageModalOpen}
        onClose={() => setIsNewPackageModalOpen(false)}
        onCreatePackage={handleCreatePackage}
      />

      {/* Modern European Footer */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between text-xs text-slate-500 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">STACKY Logistics Terminal v3.8</span>
          <span>·</span>
          <span>WGS-84 Mercator</span>
          <span>·</span>
          <span className="text-emerald-700 font-medium">
            EU Regulation (EC) No 561/2006 · Directive 96/53/EC · Geneva e-CMR Protocol
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Latency: 16ms</span>
          <span>·</span>
          <span className="text-emerald-700 font-medium">MQTT In-Cab Broker: Connected (10Hz)</span>
        </div>
      </footer>
    </div>
  );
}
