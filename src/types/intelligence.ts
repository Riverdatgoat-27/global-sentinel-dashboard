// Types for all intelligence data across the platform

export type GlobeEventType = 'earthquake' | 'cyber' | 'military' | 'protest' | 'financial' | 'aircraft' | 'satellite' | 'ship' | 'missile' | 'infrastructure';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface GlobeEvent {
  id: string;
  type: GlobeEventType;
  title: string;
  description: string;
  lat: number;
  lng: number;
  severity: Severity;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
    type: string;
    alert: string | null;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export interface AircraftState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  longitude: number | null;
  latitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  onGround: boolean;
  category?: 'commercial' | 'cargo' | 'military' | 'helicopter' | 'government' | 'unknown';
  operator?: string;
  aircraftType?: string;
  route?: { from: string; to: string };
}

export interface SatelliteData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  category: 'communication' | 'military' | 'gps' | 'weather' | 'starlink';
  country: string;
}

export interface ShipData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  type: 'cargo' | 'tanker' | 'passenger' | 'fishing' | 'naval';
  country: string;
  flag: string;
  mmsi?: string;
  imo?: string;
  owner?: string;
  builtYear?: number;
  builtAt?: string;
  grossTonnage?: number;
  length?: number;
}

export interface MarineAnimal {
  id: string;
  name: string;
  species: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  tracker: string;
  lastPing: string;
  category: 'whale' | 'shark' | 'turtle' | 'dolphin' | 'seal';
}

export interface CyberThreat {
  id: string;
  attackType: string;
  sourceLat: number;
  sourceLng: number;
  targetLat: number;
  targetLng: number;
  severity: Severity;
  target: string;
  source: string;
  timestamp: string;
  status: 'active' | 'mitigated' | 'investigating';
}

export interface MissileEvent {
  id: string;
  title: string;
  launchLat: number;
  launchLng: number;
  targetLat: number;
  targetLng: number;
  severity: Severity;
  timestamp: string;
  source: string;
  type: 'ballistic' | 'cruise' | 'hypersonic' | 'test';
  status: 'launched' | 'intercepted' | 'impact' | 'test';
}

export interface InfrastructurePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'airport' | 'port' | 'military_base' | 'nuclear_plant' | 'data_center';
  country: string;
  description: string;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  url: string;
  thumbnailUrl: string;
  type: 'traffic' | 'city' | 'weather' | 'port';
  country: string;
  lat: number;
  lng: number;
}

export interface VideoIntel {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  embedUrl?: string;
  source: string;
  category: 'military' | 'protest' | 'disaster' | 'cyber' | 'geopolitical';
  timestamp: string;
  location: string;
}

export interface AlertNotification {
  id: string;
  type: 'cyber' | 'missile' | 'military' | 'disaster' | 'market';
  title: string;
  description: string;
  severity: Severity;
  timestamp: string;
  lat?: number;
  lng?: number;
  acknowledged: boolean;
}

export interface SubmarineData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  depth: number;
  speed: number;
  heading: number;
  type: 'ballistic' | 'attack' | 'cruise_missile' | 'diesel';
  country: string;
  flag: string;
  class: string;
  status: 'patrol' | 'transit' | 'port' | 'exercise';
}

export interface LayerVisibility {
  earthquakes: boolean;
  cyberAttacks: boolean;
  military: boolean;
  aircraft: boolean;
  satellites: boolean;
  ships: boolean;
  submarines: boolean;
  infrastructure: boolean;
  missiles: boolean;
  marineAnimals: boolean;
}

export interface AIInsight {
  id: string;
  summary: string;
  threatScore: number;
  category: string;
  timestamp: string;
  relatedEvents: string[];
}

export interface TimelineState {
  isPlaying: boolean;
  currentTime: number;
  startTime: number;
  endTime: number;
  speed: number;
}
