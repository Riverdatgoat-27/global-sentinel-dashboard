import { useState, useEffect } from 'react';
import type { SatelliteData, ShipData, CyberThreat, GlobeEvent } from '@/types/intelligence';

// Simulated satellites based on real orbit categories
function generateSatellites(): SatelliteData[] {
  const satellites: SatelliteData[] = [];
  const categories: SatelliteData['category'][] = ['communication', 'military', 'gps', 'weather', 'starlink'];
  const countries = ['USA', 'Russia', 'China', 'EU', 'Japan', 'India'];
  const names = [
    'ISS (ZARYA)', 'NOAA-20', 'GOES-16', 'GPS IIR-11', 'STARLINK-5421',
    'COSMOS 2558', 'YAOGAN-35', 'INTELSAT 39', 'ASTRA 2G', 'METEOSAT-11',
    'STARLINK-5422', 'STARLINK-5423', 'GPS IIF-12', 'MUOS-5', 'WGS-10',
    'BEIDOU-3 M23', 'GLONASS-M 747', 'IRIDIUM 180', 'ORBCOMM FM116', 'COSMOS 2560',
  ];

  for (let i = 0; i < 20; i++) {
    const t = Date.now() / 1000 + i * 1000;
    satellites.push({
      id: `sat-${i}`,
      name: names[i] || `SAT-${i}`,
      lat: Math.sin(t * 0.001 + i) * 60,
      lng: ((t * 0.05 + i * 36) % 360) - 180,
      altitude: 400 + Math.random() * 35000,
      velocity: 7.5 + Math.random() * 3,
      category: categories[i % categories.length],
      country: countries[i % countries.length],
    });
  }
  return satellites;
}

function generateShips(): ShipData[] {
  const ships: ShipData[] = [
    { id: 'ship-1', name: 'MSC OSCAR', lat: 1.3, lng: 103.8, speed: 14, heading: 270, type: 'cargo', country: 'Panama', flag: '🇵🇦' },
    { id: 'ship-2', name: 'EVER GIVEN', lat: 30.0, lng: 32.3, speed: 12, heading: 180, type: 'cargo', country: 'Panama', flag: '🇵🇦' },
    { id: 'ship-3', name: 'JAHRE VIKING', lat: 25.0, lng: 55.0, speed: 10, heading: 90, type: 'tanker', country: 'Norway', flag: '🇳🇴' },
    { id: 'ship-4', name: 'USS GERALD R. FORD', lat: 36.0, lng: -6.0, speed: 30, heading: 90, type: 'naval', country: 'USA', flag: '🇺🇸' },
    { id: 'ship-5', name: 'HMS QUEEN ELIZABETH', lat: 50.8, lng: -1.1, speed: 25, heading: 180, type: 'naval', country: 'UK', flag: '🇬🇧' },
    { id: 'ship-6', name: 'HARMONY OF THE SEAS', lat: 18.5, lng: -66.0, speed: 18, heading: 135, type: 'passenger', country: 'Bahamas', flag: '🇧🇸' },
    { id: 'ship-7', name: 'LIAONING', lat: 18.2, lng: 110.3, speed: 28, heading: 45, type: 'naval', country: 'China', flag: '🇨🇳' },
    { id: 'ship-8', name: 'ATLANTIC HERRING', lat: 62.0, lng: -4.0, speed: 8, heading: 0, type: 'fishing', country: 'Iceland', flag: '🇮🇸' },
    { id: 'ship-9', name: 'ADMIRAL KUZNETSOV', lat: 69.0, lng: 33.0, speed: 20, heading: 270, type: 'naval', country: 'Russia', flag: '🇷🇺' },
    { id: 'ship-10', name: 'MAERSK ALABAMA', lat: 2.0, lng: 45.0, speed: 15, heading: 225, type: 'cargo', country: 'Denmark', flag: '🇩🇰' },
  ];
  return ships;
}

function generateCyberThreats(): CyberThreat[] {
  return [
    { id: 'ct-1', attackType: 'Ransomware', sourceLat: 55.7, sourceLng: 37.6, targetLat: 50.8, targetLng: 4.3, severity: 'critical', target: 'EU Healthcare Systems', source: 'CERT-EU', timestamp: new Date().toISOString(), status: 'active' },
    { id: 'ct-2', attackType: 'DDoS', sourceLat: 39.9, sourceLng: 116.4, targetLat: 1.3, targetLng: 103.8, severity: 'high', target: 'APAC Banking Network', source: 'FS-ISAC', timestamp: new Date().toISOString(), status: 'active' },
    { id: 'ct-3', attackType: 'Supply Chain', sourceLat: 35.7, sourceLng: 51.4, targetLat: 37.8, targetLng: -122.4, severity: 'critical', target: 'Fortune 500 Vendor', source: 'CISA', timestamp: new Date().toISOString(), status: 'investigating' },
    { id: 'ct-4', attackType: 'Zero-Day', sourceLat: 28.6, sourceLng: 77.2, targetLat: 51.5, targetLng: -0.1, severity: 'critical', target: 'Defense Contractor', source: 'NCSC', timestamp: new Date().toISOString(), status: 'investigating' },
    { id: 'ct-5', attackType: 'APT Intrusion', sourceLat: 55.0, sourceLng: 82.9, targetLat: 38.9, targetLng: -77.0, severity: 'high', target: 'Gov Infrastructure', source: 'NSA/CSS', timestamp: new Date().toISOString(), status: 'active' },
    { id: 'ct-6', attackType: 'SCADA Attack', sourceLat: 33.3, sourceLng: 44.4, targetLat: 32.1, targetLng: 34.8, severity: 'high', target: 'Water Treatment', source: 'ICS-CERT', timestamp: new Date().toISOString(), status: 'mitigated' },
  ];
}

function generateMilitaryEvents(): GlobeEvent[] {
  return [
    { id: 'mil-1', type: 'military', title: 'Drone Strike Near Border Zone', description: 'UAV strike reported near contested border region.', lat: 48.3, lng: 37.8, severity: 'critical', timestamp: new Date().toISOString(), source: 'Liveuamap' },
    { id: 'mil-2', type: 'military', title: 'Naval Exercise - South China Sea', description: 'Multiple carrier groups conducting exercises.', lat: 15.5, lng: 114.0, severity: 'high', timestamp: new Date().toISOString(), source: 'OSINT Naval' },
    { id: 'mil-3', type: 'military', title: 'Missile Test Launch Detected', description: 'Ballistic missile test detected via satellite.', lat: 39.0, lng: 125.8, severity: 'critical', timestamp: new Date().toISOString(), source: 'NORAD' },
    { id: 'mil-4', type: 'military', title: 'Airstrikes Reported', description: 'Multiple airstrikes confirmed in conflict zone.', lat: 33.5, lng: 36.3, severity: 'high', timestamp: new Date().toISOString(), source: 'CENTCOM' },
    { id: 'mil-5', type: 'protest', title: 'Mass Protests in Tehran', description: 'Large-scale civilian protests across cities.', lat: 35.7, lng: 51.4, severity: 'medium', timestamp: new Date().toISOString(), source: 'Social Media OSINT' },
  ];
}

export function useSimulatedData() {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [ships] = useState<ShipData[]>(generateShips());
  const [cyberThreats] = useState<CyberThreat[]>(generateCyberThreats());
  const [militaryEvents] = useState<GlobeEvent[]>(generateMilitaryEvents());

  useEffect(() => {
    const updateSatellites = () => setSatellites(generateSatellites());
    updateSatellites();
    const interval = setInterval(updateSatellites, 5000);
    return () => clearInterval(interval);
  }, []);

  return { satellites, ships, cyberThreats, militaryEvents };
}
