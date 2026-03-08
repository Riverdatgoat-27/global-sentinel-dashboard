import { useState, useEffect, useCallback } from 'react';
import type { SatelliteData, ShipData, CyberThreat, GlobeEvent, MissileEvent, AlertNotification, MarineAnimal } from '@/types/intelligence';
import { missileEvents as staticMissiles } from '@/data/mockData';

function generateSatellites(): SatelliteData[] {
  const satellites: SatelliteData[] = [];
  const categories: SatelliteData['category'][] = ['communication', 'military', 'gps', 'weather', 'starlink'];
  const countries = ['USA', 'Russia', 'China', 'EU', 'Japan', 'India'];
  const names = [
    'ISS (ZARYA)', 'NOAA-20', 'GOES-16', 'GPS IIR-11', 'STARLINK-5421',
    'COSMOS 2558', 'YAOGAN-35', 'INTELSAT 39', 'ASTRA 2G', 'METEOSAT-11',
    'STARLINK-5422', 'STARLINK-5423', 'GPS IIF-12', 'MUOS-5', 'WGS-10',
    'BEIDOU-3 M23', 'GLONASS-M 747', 'IRIDIUM 180', 'ORBCOMM FM116', 'COSMOS 2560',
    'STARLINK-6001', 'STARLINK-6002', 'STARLINK-6003', 'TDRS-13', 'NROL-82',
  ];

  for (let i = 0; i < 25; i++) {
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
  return [
    { id: 'ship-1', name: 'MSC OSCAR', lat: 1.3, lng: 103.8, speed: 14, heading: 270, type: 'cargo', country: 'Panama', flag: '🇵🇦', mmsi: '353136000', imo: '9703291', owner: 'Mediterranean Shipping Company', builtYear: 2015, builtAt: 'Daewoo, South Korea', grossTonnage: 192237, length: 395 },
    { id: 'ship-2', name: 'EVER GIVEN', lat: 30.0, lng: 32.3, speed: 12, heading: 180, type: 'cargo', country: 'Panama', flag: '🇵🇦', mmsi: '353136001', imo: '9811000', owner: 'Shoei Kisen Kaisha', builtYear: 2018, builtAt: 'Imabari, Japan', grossTonnage: 220940, length: 400 },
    { id: 'ship-3', name: 'JAHRE VIKING', lat: 25.0, lng: 55.0, speed: 10, heading: 90, type: 'tanker', country: 'Norway', flag: '🇳🇴', mmsi: '259000001', owner: 'First Olsen Tankers', builtYear: 1979, builtAt: 'Yokosuka, Japan', grossTonnage: 260941, length: 458 },
    { id: 'ship-4', name: 'USS GERALD R. FORD', lat: 36.0, lng: -6.0, speed: 30, heading: 90, type: 'naval', country: 'USA', flag: '🇺🇸', mmsi: 'WARSHIP', owner: 'US Navy', builtYear: 2017, builtAt: 'Newport News, VA', grossTonnage: 100000, length: 337 },
    { id: 'ship-5', name: 'HMS QUEEN ELIZABETH', lat: 50.8, lng: -1.1, speed: 25, heading: 180, type: 'naval', country: 'UK', flag: '🇬🇧', mmsi: 'WARSHIP', owner: 'Royal Navy', builtYear: 2017, builtAt: 'Rosyth, Scotland', grossTonnage: 65000, length: 284 },
    { id: 'ship-6', name: 'HARMONY OF THE SEAS', lat: 18.5, lng: -66.0, speed: 18, heading: 135, type: 'passenger', country: 'Bahamas', flag: '🇧🇸', mmsi: '311000001', imo: '9682875', owner: 'Royal Caribbean', builtYear: 2016, builtAt: 'Saint-Nazaire, France', grossTonnage: 226963, length: 362 },
    { id: 'ship-7', name: 'LIAONING', lat: 18.2, lng: 110.3, speed: 28, heading: 45, type: 'naval', country: 'China', flag: '🇨🇳', mmsi: 'WARSHIP', owner: 'PLA Navy', builtYear: 2012, builtAt: 'Dalian, China', grossTonnage: 60000, length: 305 },
    { id: 'ship-8', name: 'ATLANTIC HERRING', lat: 62.0, lng: -4.0, speed: 8, heading: 0, type: 'fishing', country: 'Iceland', flag: '🇮🇸', mmsi: '251000001', owner: 'Samherji hf', builtYear: 2005, builtAt: 'Akureyri, Iceland', grossTonnage: 3200, length: 75 },
    { id: 'ship-9', name: 'ADMIRAL KUZNETSOV', lat: 69.0, lng: 33.0, speed: 20, heading: 270, type: 'naval', country: 'Russia', flag: '🇷🇺', mmsi: 'WARSHIP', owner: 'Russian Navy', builtYear: 1990, builtAt: 'Mykolaiv, Ukraine', grossTonnage: 58600, length: 305 },
    { id: 'ship-10', name: 'MAERSK ALABAMA', lat: 2.0, lng: 45.0, speed: 15, heading: 225, type: 'cargo', country: 'Denmark', flag: '🇩🇰', mmsi: '220000001', owner: 'Maersk Line', builtYear: 1998, builtAt: 'Jinhae, South Korea', grossTonnage: 17000, length: 155 },
    { id: 'ship-11', name: 'PACIFIC EXPLORER', lat: -15.0, lng: 165.0, speed: 12, heading: 315, type: 'cargo', country: 'Marshall Islands', flag: '🇲🇭', owner: 'Pacific International Lines', builtYear: 2010, builtAt: 'Shanghai, China', grossTonnage: 85000, length: 290 },
    { id: 'ship-12', name: 'SHANDONG', lat: 20.0, lng: 112.0, speed: 26, heading: 180, type: 'naval', country: 'China', flag: '🇨🇳', mmsi: 'WARSHIP', owner: 'PLA Navy', builtYear: 2019, builtAt: 'Dalian, China', grossTonnage: 70000, length: 315 },
  ];
}

function moveShips(ships: ShipData[]): ShipData[] {
  return ships.map(ship => {
    const speedFactor = ship.speed * 0.00005;
    const headingRad = (ship.heading * Math.PI) / 180;
    let newLat = ship.lat + Math.cos(headingRad) * speedFactor;
    let newLng = ship.lng + Math.sin(headingRad) * speedFactor;
    let newHeading = ship.heading + (Math.random() - 0.5) * 2;
    if (newHeading < 0) newHeading += 360;
    if (newHeading >= 360) newHeading -= 360;
    if (newLng > 180) newLng -= 360;
    if (newLng < -180) newLng += 360;
    newLat = Math.max(-85, Math.min(85, newLat));
    return { ...ship, lat: newLat, lng: newLng, heading: newHeading };
  });
}

function generateMarineAnimals(): MarineAnimal[] {
  return [
    { id: 'ma-1', name: 'Blue-17', species: 'Blue Whale', lat: -33.5, lng: 17.8, speed: 4.5, heading: 180, tracker: 'NOAA-SWFSC', lastPing: new Date().toISOString(), category: 'whale' },
    { id: 'ma-2', name: 'Humpback-42', species: 'Humpback Whale', lat: 21.3, lng: -157.8, speed: 5.2, heading: 220, tracker: 'HIHWNMS', lastPing: new Date().toISOString(), category: 'whale' },
    { id: 'ma-3', name: 'GWS-Alpha', species: 'Great White Shark', lat: -34.0, lng: 151.2, speed: 3.1, heading: 90, tracker: 'CSIRO-IMOS', lastPing: new Date().toISOString(), category: 'shark' },
    { id: 'ma-4', name: 'Mako-09', species: 'Shortfin Mako', lat: 28.5, lng: -15.4, speed: 7.8, heading: 270, tracker: 'ICCAT', lastPing: new Date().toISOString(), category: 'shark' },
    { id: 'ma-5', name: 'Leatherback-LT3', species: 'Leatherback Turtle', lat: 8.2, lng: -79.5, speed: 1.8, heading: 315, tracker: 'Sea Turtle Conservancy', lastPing: new Date().toISOString(), category: 'turtle' },
    { id: 'ma-6', name: 'Green-GH22', species: 'Green Sea Turtle', lat: -23.4, lng: 152.0, speed: 1.2, heading: 45, tracker: 'GBRMPA', lastPing: new Date().toISOString(), category: 'turtle' },
    { id: 'ma-7', name: 'Bottlenose-Pod9', species: 'Bottlenose Dolphin', lat: 36.8, lng: -6.2, speed: 8.5, heading: 120, tracker: 'ACCOBAMS', lastPing: new Date().toISOString(), category: 'dolphin' },
    { id: 'ma-8', name: 'Orca-J35', species: 'Orca', lat: 48.4, lng: -123.2, speed: 6.0, heading: 200, tracker: 'NOAA-NWFSC', lastPing: new Date().toISOString(), category: 'whale' },
    { id: 'ma-9', name: 'Elephant-Seal-04', species: 'Elephant Seal', lat: -54.3, lng: -36.5, speed: 2.5, heading: 160, tracker: 'BAS', lastPing: new Date().toISOString(), category: 'seal' },
    { id: 'ma-10', name: 'Tiger-Shark-TS7', species: 'Tiger Shark', lat: 21.0, lng: -156.5, speed: 4.2, heading: 90, tracker: 'HIMB', lastPing: new Date().toISOString(), category: 'shark' },
    { id: 'ma-11', name: 'Narwhal-N12', species: 'Narwhal', lat: 76.5, lng: -71.0, speed: 2.0, heading: 30, tracker: 'DFO-Canada', lastPing: new Date().toISOString(), category: 'whale' },
    { id: 'ma-12', name: 'Hammerhead-HH5', species: 'Hammerhead Shark', lat: 0.7, lng: -90.3, speed: 3.5, heading: 150, tracker: 'CDF-Galapagos', lastPing: new Date().toISOString(), category: 'shark' },
  ];
}

function moveMarineAnimals(animals: MarineAnimal[]): MarineAnimal[] {
  return animals.map(a => {
    const speedFactor = a.speed * 0.00003;
    const headingRad = (a.heading * Math.PI) / 180;
    let newLat = a.lat + Math.cos(headingRad) * speedFactor;
    let newLng = a.lng + Math.sin(headingRad) * speedFactor;
    let newHeading = a.heading + (Math.random() - 0.5) * 8;
    if (newHeading < 0) newHeading += 360;
    if (newHeading >= 360) newHeading -= 360;
    if (newLng > 180) newLng -= 360;
    if (newLng < -180) newLng += 360;
    newLat = Math.max(-85, Math.min(85, newLat));
    return { ...a, lat: newLat, lng: newLng, heading: newHeading, lastPing: new Date().toISOString() };
  });
}

function generateCyberThreats(): CyberThreat[] {
  return [
    { id: 'ct-1', attackType: 'Ransomware', sourceLat: 55.7, sourceLng: 37.6, targetLat: 50.8, targetLng: 4.3, severity: 'critical', target: 'EU Healthcare Systems', source: 'CERT-EU', timestamp: new Date().toISOString(), status: 'active' },
    { id: 'ct-2', attackType: 'DDoS', sourceLat: 39.9, sourceLng: 116.4, targetLat: 1.3, targetLng: 103.8, severity: 'high', target: 'APAC Banking Network', source: 'FS-ISAC', timestamp: new Date().toISOString(), status: 'active' },
    { id: 'ct-3', attackType: 'Supply Chain', sourceLat: 35.7, sourceLng: 51.4, targetLat: 37.8, targetLng: -122.4, severity: 'critical', target: 'Fortune 500 Vendor', source: 'CISA', timestamp: new Date().toISOString(), status: 'investigating' },
    { id: 'ct-4', attackType: 'Zero-Day', sourceLat: 28.6, sourceLng: 77.2, targetLat: 51.5, targetLng: -0.1, severity: 'critical', target: 'Defense Contractor', source: 'NCSC', timestamp: new Date().toISOString(), status: 'investigating' },
    { id: 'ct-5', attackType: 'APT Intrusion', sourceLat: 55.0, sourceLng: 82.9, targetLat: 38.9, targetLng: -77.0, severity: 'high', target: 'Gov Infrastructure', source: 'NSA/CSS', timestamp: new Date().toISOString(), status: 'active' },
    { id: 'ct-6', attackType: 'SCADA Attack', sourceLat: 33.3, sourceLng: 44.4, targetLat: 32.1, targetLng: 34.8, severity: 'high', target: 'Water Treatment', source: 'ICS-CERT', timestamp: new Date().toISOString(), status: 'mitigated' },
    { id: 'ct-7', attackType: 'Phishing', sourceLat: 37.5, sourceLng: 127.0, targetLat: 35.7, targetLng: 139.7, severity: 'medium', target: 'Japanese Corp Networks', source: 'JPCERT', timestamp: new Date().toISOString(), status: 'investigating' },
    { id: 'ct-8', attackType: 'Wiper Malware', sourceLat: 55.7, sourceLng: 37.6, targetLat: 50.4, targetLng: 30.5, severity: 'critical', target: 'Energy Grid', source: 'CERT-UA', timestamp: new Date().toISOString(), status: 'active' },
  ];
}

function generateMilitaryEvents(): GlobeEvent[] {
  return [
    { id: 'mil-1', type: 'military', title: 'Drone Strike Near Border Zone', description: 'UAV strike reported near contested border region.', lat: 48.3, lng: 37.8, severity: 'critical', timestamp: new Date().toISOString(), source: 'Liveuamap' },
    { id: 'mil-2', type: 'military', title: 'Naval Exercise - South China Sea', description: 'Multiple carrier groups conducting exercises.', lat: 15.5, lng: 114.0, severity: 'high', timestamp: new Date().toISOString(), source: 'OSINT Naval' },
    { id: 'mil-3', type: 'military', title: 'Missile Test Launch Detected', description: 'Ballistic missile test detected via satellite.', lat: 39.0, lng: 125.8, severity: 'critical', timestamp: new Date().toISOString(), source: 'NORAD' },
    { id: 'mil-4', type: 'military', title: 'Airstrikes Reported', description: 'Multiple airstrikes confirmed in conflict zone.', lat: 33.5, lng: 36.3, severity: 'high', timestamp: new Date().toISOString(), source: 'CENTCOM' },
    { id: 'mil-5', type: 'protest', title: 'Mass Protests in Tehran', description: 'Large-scale civilian protests across cities.', lat: 35.7, lng: 51.4, severity: 'medium', timestamp: new Date().toISOString(), source: 'Social Media OSINT' },
    { id: 'mil-6', type: 'military', title: 'Military Buildup Near Taiwan Strait', description: 'Increased PLA activity detected via SIGINT.', lat: 24.5, lng: 118.0, severity: 'high', timestamp: new Date().toISOString(), source: 'INDOPACOM' },
    { id: 'mil-7', type: 'military', title: 'Submarine Detected - Arctic', description: 'Nuclear submarine surfacing detected by SOSUS.', lat: 72.0, lng: 25.0, severity: 'medium', timestamp: new Date().toISOString(), source: 'NORAD' },
  ];
}

function generateAlerts(cyberThreats: CyberThreat[], militaryEvents: GlobeEvent[], missiles: MissileEvent[]): AlertNotification[] {
  const alerts: AlertNotification[] = [];
  cyberThreats.filter(t => t.severity === 'critical' && t.status === 'active').forEach(t => {
    alerts.push({ id: `alert-${t.id}`, type: 'cyber', title: `CRITICAL: ${t.attackType} - ${t.target}`, description: `Active ${t.attackType} attack targeting ${t.target}. Source: ${t.source}`, severity: 'critical', timestamp: t.timestamp, lat: t.targetLat, lng: t.targetLng, acknowledged: false });
  });
  missiles.forEach(m => {
    alerts.push({ id: `alert-${m.id}`, type: 'missile', title: `MISSILE: ${m.title}`, description: `${m.type} missile ${m.status}. Source: ${m.source}`, severity: m.severity, timestamp: m.timestamp, lat: m.launchLat, lng: m.launchLng, acknowledged: false });
  });
  militaryEvents.filter(e => e.severity === 'critical').forEach(e => {
    alerts.push({ id: `alert-${e.id}`, type: 'military', title: e.title, description: e.description, severity: e.severity, timestamp: e.timestamp, lat: e.lat, lng: e.lng, acknowledged: false });
  });
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function useSimulatedData() {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [ships, setShips] = useState<ShipData[]>([]);
  const [marineAnimals, setMarineAnimals] = useState<MarineAnimal[]>([]);
  const [cyberThreats] = useState<CyberThreat[]>(generateCyberThreats());
  const [militaryEvents] = useState<GlobeEvent[]>(generateMilitaryEvents());
  const [missiles] = useState<MissileEvent[]>(staticMissiles);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  useEffect(() => {
    const updateSatellites = () => setSatellites(generateSatellites());
    updateSatellites();
    const interval = setInterval(updateSatellites, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShips(generateShips());
    const interval = setInterval(() => {
      setShips(prev => moveShips(prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMarineAnimals(generateMarineAnimals());
    const interval = setInterval(() => {
      setMarineAnimals(prev => moveMarineAnimals(prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAlerts(generateAlerts(cyberThreats, militaryEvents, missiles));
  }, [cyberThreats, militaryEvents, missiles]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  return { satellites, ships, marineAnimals, cyberThreats, militaryEvents, missiles, alerts, acknowledgeAlert };
}
