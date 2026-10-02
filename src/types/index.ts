export type IgnitionState = 'ON' | 'IDLE' | 'OFF';
export type VehicleStatus = 'ON-ROUTE' | 'IDLE' | 'IN-TRANS' | 'LOADING' | 'MAINTENANCE';
export type TachographStatus = 'NOMINAL' | 'BREAK_DUE' | 'DAILY_LIMIT_WARN' | 'INFRINGING';

export interface VehicleLocation {
  latitude: number;
  longitude: number;
  altitude_m: number;
  heading_deg: number;
  city: string;
  country: string; // ISO European country e.g. DE, FR, NL, IT, ES, BE, PL, AT
}

export interface VehicleMetrics {
  speed_kmh: number;
  fuel_level_pct: number;
  engine_temp_c: number;
  current_gross_mass_kg: number;
  current_vol_m3: number;
  euro_pallets_loaded: number;
  tire_pressure_bar: [number, number, number, number]; // European Bar rating (e.g. 8.5 bar)
  mass_load_index_pct: number;
  ignition_state: IgnitionState;
  adblue_level_pct: number; // Euro 6 / Euro 7 emissions fluid
}

export interface AxleDistribution {
  steer_kg: number; // Front single axle (legal max 7,500 - 8,000 kg)
  steer_pct: number;
  drive_kg: number; // Drive tractor axle (legal max 11,500 kg)
  drive_pct: number;
  trailer_kg: number; // Tri-axle bogie (legal max 24,000 kg, 3x8,000 kg)
  trailer_pct: number;
  status: 'BALANCED' | 'STEER_HEAVY' | 'OVER_DRIVE' | 'TRI_AXLE_OVERLOAD';
}

export interface RouteRestrictions {
  low_clearance: boolean; // Directive 96/53/EC < 4.00m
  max_axle_weight: boolean; // < 11.5t drive axle
  adr_restricted: boolean; // ADR European Agreement concerning Dangerous Goods
  crit_air_lez: boolean; // Low Emission Zones (Crit'Air / German Umweltzone / Euro 6)
  alpine_transit: boolean; // Alpine transit permit (Brenner, Gotthard, Mont Blanc)
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name: string;
  country: string;
  type?: 'hub' | 'waypoint' | 'customs_border' | 'toll_gantry' | 'destination';
}

export interface ActiveRoute {
  origin_id: string;
  origin_name: string;
  destination_id: string;
  destination_name: string;
  distance_remaining_km: number;
  total_distance_km: number;
  eta_timestamp: string;
  est_time_remaining: string;
  route_name: string;
  current_segment: string;
  toll_cost_eur: number; // Euro toll (LKW Maut / Telepass / ASFINAG)
  avg_speed_kmh: number;
  waypoints: RouteWaypoint[];
  restrictions: RouteRestrictions;
  weather_hazard?: {
    type: 'snow' | 'ice' | 'rain' | 'high_wind';
    location: string;
    description: string;
    severity: 'warning' | 'critical';
  };
}

export interface TrailerSpec {
  model: string;
  type: string;
  max_gvwr_kg: number; // 40,000 kg (standard EU 5-axle articulated) or 44,000 kg (intermodal)
  max_payload_kg: number; // ~26,000 kg - 28,000 kg
  max_vol_m3: number; // ~90.0 - 100.0 m³ (standard 13.6m trailer)
  max_euro_pallets: number; // 33 Euro-pallets (1200 x 800 mm)
  internal_length_m: number; // 13.62m
  internal_width_m: number; // 2.48m
  internal_height_m: number; // 2.70m - 3.00m (Mega trailer)
}

export type TaskPhase = 'DISPATCHED' | 'HIGHWAY_TRANSIT' | 'TACHO_REST' | 'TOLL_GANTRY' | 'DOCK_APPROACH' | 'UNLOADING' | 'STAGED';

export interface Vehicle {
  vehicle_id: string; // e.g. "HGV-DE-4092", "HGV-NL-101", etc.
  plate_number: string; // European license plate e.g. "B-SK 4092", "NL-42-BTR-9"
  driver_id: string;
  driver_name: string;
  make_model: string; // European tractor e.g. "Scania 770 S V8", "Volvo FH16 750", "Mercedes Actros L"
  trailer_spec: TrailerSpec;
  status: VehicleStatus;
  location: VehicleLocation;
  metrics: VehicleMetrics;
  active_route: ActiveRoute;
  axle_distribution: AxleDistribution;
  assigned_manifest_id?: string;
  current_task: string;
  task_phase: TaskPhase;
  route_progress_pct: number;
  current_waypoint_index: number;
  emission_standard: 'Euro 6e' | 'Euro 6d' | 'Zero-Emission EV';
}

export interface ManifestDimensions {
  length: number;
  width: number;
  height: number;
}

export interface HandlingRequirements {
  refrigerated: boolean;
  adr_dangerous_goods: boolean; // European ADR Classification
  adr_class?: string; // e.g. "Class 3 (Flammable Liquids)"
  stackable: boolean;
}

export interface Manifest {
  manifest_id: string;
  cargo_description: string;
  origin: string;
  origin_code: string;
  destination: string;
  destination_code: string;
  metrics: {
    total_mass_kg: number;
    total_volume_m3: number;
    euro_pallets_count: number;
    max_unit_dimensions_m: ManifestDimensions;
  };
  handling_requirements: HandlingRequirements;
  assignment_status: {
    assigned_vehicle: string | null;
    assigned_driver: string | null;
    dispatch_operator: string | null;
    timestamp_assigned: string | null;
    status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
  };
  ecmr_number: string; // Electronic Consignment Note (e-CMR Geneva Protocol)
  staging_rule: 'LIFO' | 'FIFO';
  pickup_slot: string;
  delivery_slot: string;
  cabotage_operation_count: number; // EU Cabotage rule: max 3 operations in 7 days
}

export interface Driver {
  driver_id: string;
  driver_name: string;
  country: string;
  tachograph_card_id: string; // EU Smart Tachograph Gen 2 Driver Card
  continuous_drive_minutes: number; // 4.5h (270 min) threshold before mandatory 45 min pause
  daily_driving_hours: number; // Max 9h (extendable to 10h twice per week under EC 561/2006)
  daily_rest_hours_remaining: number; // Min 11h daily rest (or 9h reduced)
  weekly_accumulated_hours: number; // Max 56h weekly / 90h fortnightly
  assigned_vehicle_id: string | null;
  tacho_status: TachographStatus;
  mandatory_break_in: string; // e.g. "00h 42m"
  license_class: string; // CE Professional
  driver_qualification_card_cqc: string; // EU Code 95 valid until date
}

export interface Operator {
  operator_id: string;
  operator_name: string;
  country: string;
  active_hours: string;
  loads_assigned: number;
  dispatches_per_hr: number;
  reroutes_handled: number;
  avg_response_sec: number;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'TACHO_WARN' | 'ROUTE_UPDATE' | 'OVERWEIGHT' | 'EMISSION_LEZ' | 'CUSTOMS_BORDER';
  severity: 'info' | 'warn' | 'critical';
  title: string;
  description: string;
  vehicle_id?: string;
  acknowledged: boolean;
}

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  region: string;
}

export type ActiveNavTab = 'CONSOLE' | 'GLOBAL_MAP' | 'FLEET_ROUTING' | 'DISPATCH_BOARD' | 'CAPACITY_MATRIX' | 'REPORTS';
