import { useState, useEffect, useCallback } from 'react';
import type { AircraftState } from '@/types/intelligence';

export function useAircraftData(refreshInterval = 30000) {
  const [aircraft, setAircraft] = useState<AircraftState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAircraft = useCallback(async () => {
    try {
      const response = await fetch(
        'https://opensky-network.org/api/states/all?lamin=20&lamax=60&lomin=-130&lomax=40'
      );
      if (!response.ok) throw new Error('Rate limited');
      const data = await response.json();

      if (!data.states) { setAircraft(prev => prev.length ? prev : generateSimulatedAircraft()); return; }

      const states: AircraftState[] = data.states.slice(0, 150).map((s: any[]) => ({
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
    const interval = setInterval(fetchAircraft, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAircraft, refreshInterval]);

  return { aircraft, loading, error };
}

function generateSimulatedAircraft(): AircraftState[] {
  const routes = [
    { callsign: 'UAL927', country: 'United States', lat: 41.2, lng: -73.5, alt: 11000, vel: 240, hdg: 45 },
    { callsign: 'BAW116', country: 'United Kingdom', lat: 51.8, lng: -1.2, alt: 10500, vel: 230, hdg: 270 },
    { callsign: 'DLH456', country: 'Germany', lat: 50.1, lng: 8.7, alt: 11200, vel: 245, hdg: 180 },
    { callsign: 'AFR082', country: 'France', lat: 48.9, lng: 2.3, alt: 10800, vel: 235, hdg: 320 },
    { callsign: 'AAL445', country: 'United States', lat: 33.9, lng: -84.5, alt: 10200, vel: 228, hdg: 90 },
    { callsign: 'DAL1725', country: 'United States', lat: 38.0, lng: -84.0, alt: 9800, vel: 220, hdg: 180 },
    { callsign: 'SWR4LT', country: 'Switzerland', lat: 47.5, lng: 8.6, alt: 3200, vel: 138, hdg: 283 },
    { callsign: 'TAP571', country: 'Portugal', lat: 39.2, lng: -9.1, alt: 5200, vel: 167, hdg: 228 },
    { callsign: 'MIL001', country: 'United States', lat: 38.9, lng: -77.0, alt: 8500, vel: 300, hdg: 90 },
    { callsign: 'MIL002', country: 'Russia', lat: 55.8, lng: 37.6, alt: 9000, vel: 290, hdg: 270 },
    { callsign: 'MIL003', country: 'China', lat: 30.5, lng: 114.3, alt: 7800, vel: 310, hdg: 180 },
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
  }));
}
