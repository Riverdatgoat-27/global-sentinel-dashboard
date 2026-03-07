// Types for all intelligence data across the platform

export type GlobeEventType = 'earthquake' | 'cyber' | 'military' | 'protest' | 'financial' | 'aircraft' | 'satellite' | 'ship';

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

export interface LayerVisibility {
  earthquakes: boolean;
  cyberAttacks: boolean;
  military: boolean;
  aircraft: boolean;
  satellites: boolean;
  ships: boolean;
  infrastructure: boolean;
}

export interface AIInsight {
  id: string;
  summary: string;
  threatScore: number;
  category: string;
  timestamp: string;
  relatedEvents: string[];
}
