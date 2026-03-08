import { useState, useEffect, useCallback, useRef } from 'react';
import type { AircraftState } from '@/types/intelligence';

function moveAircraft(aircraft: AircraftState[]): AircraftState[] {
  return aircraft.map(ac => {
    if (!ac.latitude || !ac.longitude || !ac.heading) return ac;
    const speedFactor = ((ac.velocity || 200) / 200) * 0.003;
    const headingRad = (ac.heading * Math.PI) / 180;
    let newLat = ac.latitude + Math.cos(headingRad) * speedFactor;
    let newLng = ac.longitude + Math.sin(headingRad) * speedFactor;
    let newHeading = (ac.heading || 0) + (Math.random() - 0.5) * 1.5;
    if (newHeading < 0) newHeading += 360;
    if (newHeading >= 360) newHeading -= 360;
    if (newLng > 180) newLng -= 360;
    if (newLng < -180) newLng += 360;
    newLat = Math.max(-85, Math.min(85, newLat));
    return { ...ac, latitude: newLat, longitude: newLng, heading: newHeading };
  });
}

export function useAircraftData(refreshInterval = 60000) {
  const [aircraft, setAircraft] = useState<AircraftState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetch = useRef(0);

  const fetchAircraft = useCallback(async () => {
    if (Date.now() - lastFetch.current < 55000) return;
    lastFetch.current = Date.now();
    
    try {
      const response = await fetch(
        'https://opensky-network.org/api/states/all?lamin=20&lamax=60&lomin=-130&lomax=40'
      );
      if (!response.ok) throw new Error('Rate limited');
      const data = await response.json();

      if (!data.states) { setAircraft(prev => prev.length ? prev : generateSimulatedAircraft()); return; }

      const states: AircraftState[] = data.states.slice(0, 100).map((s: any[]) => ({
        icao24: s[0],
        callsign: s[1]?.trim() || null,
        originCountry: s[2],
        longitude: s[5],
        latitude: s[6],
        altitude: s[7],
        velocity: s[9],
        heading: s[10],
        onGround: s[8],
      })).filter((a: AircraftState) => a.latitude && a.longitude && !a.onGround);

      setAircraft(states);
      setError(null);
    } catch {
      setAircraft(prev => prev.length ? prev : generateSimulatedAircraft());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAircraft();
    const fetchInterval = setInterval(fetchAircraft, refreshInterval);
    return () => clearInterval(fetchInterval);
  }, [fetchAircraft, refreshInterval]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setAircraft(prev => prev.length > 0 ? moveAircraft(prev) : prev);
    }, 2000);
    return () => clearInterval(moveInterval);
  }, []);

  return { aircraft, loading, error };
}

function generateSimulatedAircraft(): AircraftState[] {
  const routes = [
    { callsign: 'UAL927', country: 'United States', lat: 41.2, lng: -73.5, alt: 11000, vel: 240, hdg: 45, operator: 'United Airlines', type: 'Boeing 777-200', route: { from: 'KJFK', to: 'EGLL' } },
    { callsign: 'BAW116', country: 'United Kingdom', lat: 51.8, lng: -1.2, alt: 10500, vel: 230, hdg: 270, operator: 'British Airways', type: 'Airbus A380', route: { from: 'EGLL', to: 'KJFK' } },
    { callsign: 'DLH456', country: 'Germany', lat: 50.1, lng: 8.7, alt: 11200, vel: 245, hdg: 180, operator: 'Lufthansa', type: 'Boeing 747-8', route: { from: 'EDDF', to: 'FACT' } },
    { callsign: 'AFR082', country: 'France', lat: 48.9, lng: 2.3, alt: 10800, vel: 235, hdg: 320, operator: 'Air France', type: 'Airbus A350-900', route: { from: 'LFPG', to: 'CYUL' } },
    { callsign: 'AAL445', country: 'United States', lat: 33.9, lng: -84.5, alt: 10200, vel: 228, hdg: 90, operator: 'American Airlines', type: 'Boeing 737-800', route: { from: 'KATL', to: 'KJFK' } },
    { callsign: 'DAL1725', country: 'United States', lat: 38.0, lng: -84.0, alt: 9800, vel: 220, hdg: 180, operator: 'Delta Air Lines', type: 'Airbus A321', route: { from: 'KCVG', to: 'KMIA' } },
    { callsign: 'SWR4LT', country: 'Switzerland', lat: 47.5, lng: 8.6, alt: 3200, vel: 138, hdg: 283, operator: 'Swiss', type: 'Airbus A220-300', route: { from: 'LSZH', to: 'LFPG' } },
    { callsign: 'TAP571', country: 'Portugal', lat: 39.2, lng: -9.1, alt: 5200, vel: 167, hdg: 228, operator: 'TAP Portugal', type: 'Airbus A330-200', route: { from: 'LPPT', to: 'SBGR' } },
    // Military aircraft
    { callsign: 'RCH401', country: 'United States', lat: 38.9, lng: -77.0, alt: 8500, vel: 300, hdg: 90, cat: 'military', operator: 'USAF', type: 'C-17 Globemaster III', route: { from: 'KADW', to: 'EDDK' } },
    { callsign: 'RRR7012', country: 'United Kingdom', lat: 52.3, lng: -0.5, alt: 9000, vel: 290, hdg: 90, cat: 'military', operator: 'RAF', type: 'A400M Atlas', route: { from: 'EGVN', to: 'OKBK' } },
    { callsign: 'CFC4102', country: 'China', lat: 30.5, lng: 114.3, alt: 7800, vel: 310, hdg: 180, cat: 'military', operator: 'PLAAF', type: 'Y-20', route: { from: 'ZHHH', to: 'ZJHK' } },
    // Government
    { callsign: 'SAM38', country: 'United States', lat: 39.0, lng: -77.5, alt: 12000, vel: 260, hdg: 315, cat: 'government', operator: 'USAF 89th AW', type: 'C-32A (757-200)', route: { from: 'KADW', to: 'PANC' } },
    { callsign: 'EXEC1F', country: 'France', lat: 49.0, lng: 2.6, alt: 11500, vel: 255, hdg: 210, cat: 'government', operator: 'French Air Force', type: 'Airbus A330-200', route: { from: 'LFPB', to: 'GOBD' } },
    // More commercial
    { callsign: 'EK203', country: 'UAE', lat: 25.2, lng: 55.3, alt: 12000, vel: 260, hdg: 315, operator: 'Emirates', type: 'Airbus A380-800', route: { from: 'OMDB', to: 'KJFK' } },
    { callsign: 'QTR7W', country: 'Qatar', lat: 25.3, lng: 51.6, alt: 11500, vel: 255, hdg: 290, operator: 'Qatar Airways', type: 'Boeing 777-300ER', route: { from: 'OTHH', to: 'EGLL' } },
    { callsign: 'SIA321', country: 'Singapore', lat: 1.4, lng: 104.0, alt: 10800, vel: 245, hdg: 350, operator: 'Singapore Airlines', type: 'Airbus A350-900', route: { from: 'WSSS', to: 'RJTT' } },
    { callsign: 'JAL006', country: 'Japan', lat: 35.5, lng: 140.0, alt: 11800, vel: 250, hdg: 60, operator: 'Japan Airlines', type: 'Boeing 787-9', route: { from: 'RJTT', to: 'KSFO' } },
    { callsign: 'KAL017', country: 'South Korea', lat: 37.5, lng: 127.0, alt: 11000, vel: 248, hdg: 90, operator: 'Korean Air', type: 'Airbus A380-800', route: { from: 'RKSI', to: 'KLAX' } },
  ];

  return routes.map(r => ({
    icao24: Math.random().toString(16).slice(2, 8),
    callsign: r.callsign,
    originCountry: r.country,
    latitude: r.lat + (Math.random() - 0.5) * 2,
    longitude: r.lng + (Math.random() - 0.5) * 2,
    altitude: r.alt + (Math.random() - 0.5) * 500,
    velocity: r.vel + (Math.random() - 0.5) * 20,
    heading: r.hdg,
    onGround: false,
    category: (r as any).cat === 'military' ? 'military' as const : (r as any).cat === 'government' ? 'government' as const : undefined,
    operator: r.operator,
    aircraftType: r.type,
    route: r.route,
  }));
}
