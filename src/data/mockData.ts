import type { InfrastructurePoint, CCTVCamera, VideoIntel, MissileEvent } from '@/types/intelligence';

export type ThreatEvent = {
  id: string;
  type: 'cyber' | 'military' | 'protest' | 'financial' | 'geopolitical';
  title: string;
  description: string;
  location: string;
  coordinates: { x: number; y: number };
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
};

export type CyberAttack = {
  id: string;
  target: string;
  attackType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  country: string;
  timestamp: string;
  source: string;
  status: 'active' | 'mitigated' | 'investigating';
};

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  category: 'cyber' | 'military' | 'geopolitical' | 'financial';
  timestamp: string;
};

export type FinancialTicker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: 'defense' | 'cyber' | 'tech' | 'commodity' | 'crypto';
};

export const financialTickers: FinancialTicker[] = [
  { symbol: 'RTX', name: 'Raytheon', price: 124.57, change: 3.42, changePercent: 2.82, sector: 'defense' },
  { symbol: 'LMT', name: 'Lockheed Martin', price: 498.23, change: 8.15, changePercent: 1.66, sector: 'defense' },
  { symbol: 'NOC', name: 'Northrop Grumman', price: 512.30, change: 6.89, changePercent: 1.36, sector: 'defense' },
  { symbol: 'CRWD', name: 'CrowdStrike', price: 342.18, change: -2.34, changePercent: -0.68, sector: 'cyber' },
  { symbol: 'PANW', name: 'Palo Alto Networks', price: 298.45, change: 4.12, changePercent: 1.40, sector: 'cyber' },
  { symbol: 'S', name: 'SentinelOne', price: 28.90, change: 0.85, changePercent: 3.03, sector: 'cyber' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 892.45, change: 12.67, changePercent: 1.44, sector: 'tech' },
  { symbol: 'MSFT', name: 'Microsoft', price: 425.67, change: 3.21, changePercent: 0.76, sector: 'tech' },
  { symbol: 'GOOGL', name: 'Google', price: 175.23, change: -1.45, changePercent: -0.82, sector: 'tech' },
  { symbol: 'PLTR', name: 'Palantir', price: 78.92, change: 4.21, changePercent: 5.63, sector: 'tech' },
  { symbol: 'BTC', name: 'Bitcoin', price: 97842.00, change: -1245.00, changePercent: -1.26, sector: 'crypto' },
  { symbol: 'OIL', name: 'Crude Oil', price: 84.32, change: 1.87, changePercent: 2.27, sector: 'commodity' },
];

export const infrastructurePoints: InfrastructurePoint[] = [
  { id: 'inf-1', name: 'JFK International Airport', lat: 40.64, lng: -73.78, type: 'airport', country: 'USA', description: 'Major international hub' },
  { id: 'inf-2', name: 'Heathrow Airport', lat: 51.47, lng: -0.46, type: 'airport', country: 'UK', description: 'Largest airport in Europe' },
  { id: 'inf-3', name: 'Port of Shanghai', lat: 30.63, lng: 122.07, type: 'port', country: 'China', description: 'World busiest container port' },
  { id: 'inf-4', name: 'Port of Rotterdam', lat: 51.95, lng: 4.15, type: 'port', country: 'Netherlands', description: 'Largest port in Europe' },
  { id: 'inf-5', name: 'Pentagon', lat: 38.87, lng: -77.06, type: 'military_base', country: 'USA', description: 'US Dept of Defense HQ' },
  { id: 'inf-6', name: 'Ramstein Air Base', lat: 49.44, lng: 7.60, type: 'military_base', country: 'Germany', description: 'USAFE headquarters' },
  { id: 'inf-7', name: 'Zaporizhzhia NPP', lat: 47.51, lng: 34.59, type: 'nuclear_plant', country: 'Ukraine', description: 'Largest nuclear plant in Europe' },
  { id: 'inf-8', name: 'Fukushima Daiichi', lat: 37.42, lng: 141.03, type: 'nuclear_plant', country: 'Japan', description: 'Decommissioned nuclear plant' },
  { id: 'inf-9', name: 'AWS US-East-1', lat: 39.04, lng: -77.49, type: 'data_center', country: 'USA', description: 'Major cloud data center region' },
  { id: 'inf-10', name: 'Google Hamina DC', lat: 60.57, lng: 27.19, type: 'data_center', country: 'Finland', description: 'Google data center' },
  { id: 'inf-11', name: 'Dubai International', lat: 25.25, lng: 55.36, type: 'airport', country: 'UAE', description: 'World busiest international airport' },
  { id: 'inf-12', name: 'Diego Garcia', lat: -7.32, lng: 72.42, type: 'military_base', country: 'USA/UK', description: 'Joint naval support facility' },
  { id: 'inf-13', name: 'Naval Station Norfolk', lat: 36.95, lng: -76.33, type: 'military_base', country: 'USA', description: 'Largest naval station in the world' },
  { id: 'inf-14', name: 'Port of Singapore', lat: 1.26, lng: 103.84, type: 'port', country: 'Singapore', description: 'Major transshipment hub' },
];

export const cctvCameras: CCTVCamera[] = [
  { id: 'cam-1', name: 'Times Square NYC', location: 'New York, USA', url: 'AdUw5RdyZxI', thumbnailUrl: '', type: 'city', country: 'USA', lat: 40.76, lng: -73.98 },
  { id: 'cam-2', name: 'Shibuya Crossing', location: 'Tokyo, Japan', url: 'DjYZk8nrXVY', thumbnailUrl: '', type: 'city', country: 'Japan', lat: 35.66, lng: 139.70 },
  { id: 'cam-3', name: 'Abbey Road London', location: 'London, UK', url: 'Y87VCkoqNKU', thumbnailUrl: '', type: 'city', country: 'UK', lat: 51.53, lng: -0.18 },
  { id: 'cam-4', name: 'Port of LA', location: 'Los Angeles, USA', url: '1NdFfMLRGNw', thumbnailUrl: '', type: 'port', country: 'USA', lat: 33.74, lng: -118.27 },
  { id: 'cam-5', name: 'Miami Beach', location: 'Miami, USA', url: '2DC9xXSIDhI', thumbnailUrl: '', type: 'city', country: 'USA', lat: 25.79, lng: -80.13 },
  { id: 'cam-6', name: 'ISS Earth View', location: 'Low Earth Orbit', url: 'xRPTBhmcyXY', thumbnailUrl: '', type: 'weather', country: 'Intl', lat: 0.0, lng: 0.0 },
  { id: 'cam-7', name: 'Jackson Hole WY', location: 'Wyoming, USA', url: 'DoGXOP1FMbE', thumbnailUrl: '', type: 'city', country: 'USA', lat: 43.48, lng: -110.76 },
  { id: 'cam-8', name: 'Venice Beach LA', location: 'Los Angeles, USA', url: 'ZIvLTIBbpLQ', thumbnailUrl: '', type: 'city', country: 'USA', lat: 33.99, lng: -118.47 },
  { id: 'cam-9', name: 'Dublin City', location: 'Dublin, Ireland', url: 'LCvW29tHYKA', thumbnailUrl: '', type: 'city', country: 'Ireland', lat: 53.35, lng: -6.26 },
  { id: 'cam-10', name: 'Bosphorus Istanbul', location: 'Istanbul, Turkey', url: 'cKLcmJZo8Qg', thumbnailUrl: '', type: 'port', country: 'Turkey', lat: 41.01, lng: 29.00 },
];

export const videoIntel: VideoIntel[] = [
  { id: 'vid-1', title: 'Military Convoy Movement - Eastern Europe', thumbnailUrl: '', videoUrl: '', embedUrl: '', source: 'OSINT Aggregator', category: 'military', timestamp: new Date().toISOString(), location: 'Eastern Europe' },
  { id: 'vid-2', title: 'Mass Protest Downtown - Tehran', thumbnailUrl: '', videoUrl: '', embedUrl: '', source: 'Social Media / X', category: 'protest', timestamp: new Date().toISOString(), location: 'Tehran, Iran' },
  { id: 'vid-3', title: 'Naval Exercise - Pacific Fleet', thumbnailUrl: '', videoUrl: '', embedUrl: '', source: 'Naval News', category: 'military', timestamp: new Date().toISOString(), location: 'Western Pacific' },
  { id: 'vid-4', title: 'Earthquake Aftermath - Indonesia', thumbnailUrl: '', videoUrl: '', embedUrl: '', source: 'Reuters', category: 'disaster', timestamp: new Date().toISOString(), location: 'Indonesia' },
  { id: 'vid-5', title: 'Cyber Attack Response Briefing', thumbnailUrl: '', videoUrl: '', embedUrl: '', source: 'CISA', category: 'cyber', timestamp: new Date().toISOString(), location: 'Washington DC' },
  { id: 'vid-6', title: 'Airstrike Footage - Conflict Zone', thumbnailUrl: '', videoUrl: '', embedUrl: '', source: 'Liveuamap / Telegram', category: 'military', timestamp: new Date().toISOString(), location: 'Middle East' },
];

export const missileEvents: MissileEvent[] = [
  { id: 'msl-1', title: 'Ballistic Missile Test Launch', launchLat: 39.0, launchLng: 125.8, targetLat: 40.5, targetLng: 132.0, severity: 'critical', timestamp: new Date().toISOString(), source: 'NORAD', type: 'ballistic', status: 'test' },
  { id: 'msl-2', title: 'Cruise Missile Strike', launchLat: 48.3, launchLng: 37.8, targetLat: 50.4, targetLng: 30.5, severity: 'critical', timestamp: new Date().toISOString(), source: 'Liveuamap', type: 'cruise', status: 'launched' },
  { id: 'msl-3', title: 'Intercepted Missile - Iron Dome', launchLat: 31.5, launchLng: 34.3, targetLat: 32.1, targetLng: 34.8, severity: 'high', timestamp: new Date().toISOString(), source: 'IDF', type: 'ballistic', status: 'intercepted' },
];

// Radio stations organized by region
export interface RadioStation {
  id: string;
  name: string;
  country: string;
  region: string;
  streamUrl: string;
  language: string;
  type: 'news' | 'music' | 'government' | 'emergency';
  lat: number;
  lng: number;
}

export const radioStations: RadioStation[] = [
  // News
  { id: 'radio-1', name: 'NPR News', country: 'USA', region: 'North America', streamUrl: 'https://npr-ice.streamguys1.com/live.mp3', language: 'English', type: 'news', lat: 38.9, lng: -77.0 },
  { id: 'radio-2', name: 'BBC World Service', country: 'UK', region: 'Europe', streamUrl: 'http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_world_service.m3u8', language: 'English', type: 'news', lat: 51.5, lng: -0.1 },
  { id: 'radio-3', name: 'France Info', country: 'France', region: 'Europe', streamUrl: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3', language: 'French', type: 'news', lat: 48.9, lng: 2.3 },
  { id: 'radio-4', name: 'Deutsche Welle', country: 'Germany', region: 'Europe', streamUrl: 'https://dw-radio.streamguys.com/dw-de.mp3', language: 'German', type: 'news', lat: 50.7, lng: 7.0 },
  { id: 'radio-6', name: 'ABC News Radio', country: 'Australia', region: 'Oceania', streamUrl: 'https://live-radio01.mediahubaustralia.com/2TJW/mp3/', language: 'English', type: 'news', lat: -33.9, lng: 151.2 },
  { id: 'radio-13', name: 'Radio New Zealand', country: 'New Zealand', region: 'Oceania', streamUrl: 'https://radionz-ice.streamguys.com/national.mp3', language: 'English', type: 'news', lat: -41.3, lng: 174.8 },
  { id: 'radio-14', name: 'CBC Radio One', country: 'Canada', region: 'North America', streamUrl: 'https://cbcliveradio-lh.akamaihd.net/i/CBCR1_TOR@382229/master.m3u8', language: 'English', type: 'news', lat: 43.7, lng: -79.4 },
  { id: 'radio-15', name: 'WNYC FM', country: 'USA', region: 'North America', streamUrl: 'https://fm939.wnyc.org/wnycfm', language: 'English', type: 'news', lat: 40.7, lng: -74.0 },
  // Police & Emergency Scanners (Broadcastify public feeds)
  { id: 'radio-30', name: 'LAPD Police Scanner', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/14439', language: 'English', type: 'emergency', lat: 34.05, lng: -118.24 },
  { id: 'radio-31', name: 'NYPD Manhattan', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/32318', language: 'English', type: 'emergency', lat: 40.71, lng: -74.01 },
  { id: 'radio-32', name: 'Chicago Police Zone 1', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/17690', language: 'English', type: 'emergency', lat: 41.88, lng: -87.63 },
  { id: 'radio-33', name: 'Houston Fire/EMS', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/14580', language: 'English', type: 'emergency', lat: 29.76, lng: -95.37 },
  { id: 'radio-34', name: 'Miami-Dade Police', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/14603', language: 'English', type: 'emergency', lat: 25.76, lng: -80.19 },
  { id: 'radio-35', name: 'London Met Police', country: 'UK', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/15096', language: 'English', type: 'emergency', lat: 51.50, lng: -0.12 },
  { id: 'radio-36', name: 'FDNY Citywide', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/9558', language: 'English', type: 'emergency', lat: 40.75, lng: -73.99 },
  { id: 'radio-37', name: 'Dallas Police', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/13579', language: 'English', type: 'emergency', lat: 32.78, lng: -96.80 },
  { id: 'radio-38', name: 'San Francisco Police', country: 'USA', region: 'Police/Emergency', streamUrl: 'https://broadcastify.cdnstream1.com/14054', language: 'English', type: 'emergency', lat: 37.77, lng: -122.42 },
  { id: 'radio-39', name: 'Air Traffic Control JFK', country: 'USA', region: 'Aviation', streamUrl: 'https://broadcastify.cdnstream1.com/36472', language: 'English', type: 'government', lat: 40.64, lng: -73.78 },
  { id: 'radio-40', name: 'ATC LAX Tower', country: 'USA', region: 'Aviation', streamUrl: 'https://broadcastify.cdnstream1.com/36471', language: 'English', type: 'government', lat: 33.94, lng: -118.41 },
  // Music & Other
  { id: 'radio-16', name: 'KEXP Seattle', country: 'USA', region: 'North America', streamUrl: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', language: 'English', type: 'music', lat: 47.6, lng: -122.3 },
  { id: 'radio-17', name: 'SomaFM DEF CON', country: 'USA', region: 'North America', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3', language: 'English', type: 'government', lat: 37.8, lng: -122.4 },
  { id: 'radio-18', name: 'SomaFM Drone Zone', country: 'USA', region: 'North America', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3', language: 'English', type: 'music', lat: 37.8, lng: -122.4 },
  { id: 'radio-22', name: 'SomaFM Mission Control', country: 'USA', region: 'North America', streamUrl: 'https://ice1.somafm.com/missioncontrol-128-mp3', language: 'English', type: 'government', lat: 37.8, lng: -122.4 },
  { id: 'radio-23', name: 'Classic FM (UK)', country: 'UK', region: 'Europe', streamUrl: 'https://media-ice.musicradio.com/ClassicFMMP3', language: 'English', type: 'music', lat: 51.5, lng: -0.1 },
  { id: 'radio-24', name: 'Radio Swiss Jazz', country: 'Switzerland', region: 'Europe', streamUrl: 'https://stream.srg-ssr.ch/m/rsj/mp3_128', language: 'English', type: 'music', lat: 46.9, lng: 7.4 },
];

// Country label data for the 3D globe
export interface CountryLabel {
  name: string;
  lat: number;
  lng: number;
  size: 'large' | 'medium' | 'small';
}

export const countryLabels: CountryLabel[] = [
  // Major powers
  { name: 'UNITED STATES', lat: 39.8, lng: -98.6, size: 'large' },
  { name: 'RUSSIA', lat: 61.5, lng: 95.0, size: 'large' },
  { name: 'CHINA', lat: 35.9, lng: 104.2, size: 'large' },
  { name: 'BRAZIL', lat: -14.2, lng: -51.9, size: 'large' },
  { name: 'CANADA', lat: 56.1, lng: -106.3, size: 'large' },
  { name: 'AUSTRALIA', lat: -25.3, lng: 133.8, size: 'large' },
  { name: 'INDIA', lat: 20.6, lng: 79.0, size: 'large' },

  // Europe
  { name: 'UK', lat: 55.4, lng: -3.4, size: 'medium' },
  { name: 'FRANCE', lat: 46.2, lng: 2.2, size: 'medium' },
  { name: 'GERMANY', lat: 51.2, lng: 10.5, size: 'medium' },
  { name: 'ITALY', lat: 41.9, lng: 12.6, size: 'medium' },
  { name: 'SPAIN', lat: 40.5, lng: -3.7, size: 'medium' },
  { name: 'UKRAINE', lat: 48.4, lng: 31.2, size: 'medium' },
  { name: 'POLAND', lat: 51.9, lng: 19.1, size: 'small' },
  { name: 'NORWAY', lat: 60.5, lng: 8.5, size: 'small' },
  { name: 'SWEDEN', lat: 60.1, lng: 18.6, size: 'small' },
  { name: 'FINLAND', lat: 61.9, lng: 25.7, size: 'small' },
  { name: 'TURKEY', lat: 39.0, lng: 35.2, size: 'medium' },

  // Middle East
  { name: 'IRAN', lat: 32.4, lng: 53.7, size: 'medium' },
  { name: 'IRAQ', lat: 33.2, lng: 43.7, size: 'small' },
  { name: 'SAUDI ARABIA', lat: 23.9, lng: 45.1, size: 'medium' },
  { name: 'ISRAEL', lat: 31.0, lng: 34.9, size: 'small' },
  { name: 'SYRIA', lat: 35.0, lng: 38.0, size: 'small' },
  { name: 'UAE', lat: 23.4, lng: 53.8, size: 'small' },

  // Asia
  { name: 'JAPAN', lat: 36.2, lng: 138.3, size: 'medium' },
  { name: 'S. KOREA', lat: 35.9, lng: 127.8, size: 'small' },
  { name: 'N. KOREA', lat: 40.3, lng: 127.5, size: 'small' },
  { name: 'TAIWAN', lat: 23.7, lng: 121.0, size: 'small' },
  { name: 'PAKISTAN', lat: 30.4, lng: 69.3, size: 'medium' },
  { name: 'INDONESIA', lat: -0.8, lng: 113.9, size: 'medium' },

  // Africa
  { name: 'EGYPT', lat: 26.8, lng: 30.8, size: 'medium' },
  { name: 'NIGERIA', lat: 9.1, lng: 8.7, size: 'medium' },
  { name: 'S. AFRICA', lat: -30.6, lng: 22.9, size: 'medium' },
  { name: 'ETHIOPIA', lat: 9.1, lng: 40.5, size: 'small' },
  { name: 'KENYA', lat: -0.0, lng: 37.9, size: 'small' },
  { name: 'LIBYA', lat: 26.3, lng: 17.2, size: 'small' },
  { name: 'SUDAN', lat: 12.9, lng: 30.2, size: 'small' },

  // South America
  { name: 'ARGENTINA', lat: -38.4, lng: -63.6, size: 'medium' },
  { name: 'COLOMBIA', lat: 4.6, lng: -74.3, size: 'small' },
  { name: 'VENEZUELA', lat: 6.4, lng: -66.6, size: 'small' },
  { name: 'CHILE', lat: -35.7, lng: -71.5, size: 'small' },
  { name: 'MEXICO', lat: 23.6, lng: -102.6, size: 'medium' },

  // Oceans
  { name: 'ATLANTIC OCEAN', lat: 14.6, lng: -28.7, size: 'large' },
  { name: 'PACIFIC OCEAN', lat: 0.0, lng: -160.0, size: 'large' },
  { name: 'INDIAN OCEAN', lat: -20.0, lng: 80.0, size: 'large' },
  { name: 'ARCTIC OCEAN', lat: 82.0, lng: 0.0, size: 'medium' },
];

export const threatEvents: ThreatEvent[] = [
  { id: '1', type: 'cyber', title: 'Ransomware Attack on EU Healthcare', description: 'Large-scale ransomware campaign targeting healthcare infrastructure across multiple EU member states.', location: 'Brussels, Belgium', coordinates: { x: 52, y: 28 }, severity: 'critical', timestamp: '2026-03-07T08:23:00Z', source: 'CERT-EU' },
  { id: '2', type: 'military', title: 'Naval Exercise in South China Sea', description: 'Multiple carrier groups detected conducting exercises near disputed territories.', location: 'South China Sea', coordinates: { x: 78, y: 48 }, severity: 'high', timestamp: '2026-03-07T06:45:00Z', source: 'OSINT Naval Tracking' },
  { id: '3', type: 'cyber', title: 'DDoS on Financial Infrastructure', description: 'Coordinated DDoS attacks targeting major banking systems in Southeast Asia.', location: 'Singapore', coordinates: { x: 77, y: 52 }, severity: 'high', timestamp: '2026-03-07T07:12:00Z', source: 'FS-ISAC' },
  { id: '4', type: 'military', title: 'Drone Strike Near Border Zone', description: 'Unmanned aerial vehicle strike reported near contested border region.', location: 'Eastern Ukraine', coordinates: { x: 58, y: 26 }, severity: 'critical', timestamp: '2026-03-07T05:30:00Z', source: 'Liveuamap' },
  { id: '5', type: 'protest', title: 'Mass Protests in Tehran', description: 'Large-scale civilian protests reported across multiple cities.', location: 'Tehran, Iran', coordinates: { x: 63, y: 35 }, severity: 'medium', timestamp: '2026-03-07T04:00:00Z', source: 'Social Media OSINT' },
  { id: '6', type: 'cyber', title: 'Supply Chain Attack Detected', description: 'Sophisticated supply chain compromise affecting major software vendor.', location: 'San Francisco, USA', coordinates: { x: 15, y: 33 }, severity: 'critical', timestamp: '2026-03-07T09:00:00Z', source: 'CISA' },
  { id: '7', type: 'geopolitical', title: 'Sanctions Package Announced', description: 'New comprehensive sanctions targeting semiconductor exports.', location: 'Washington D.C., USA', coordinates: { x: 24, y: 33 }, severity: 'medium', timestamp: '2026-03-07T10:00:00Z', source: 'Reuters' },
  { id: '8', type: 'military', title: 'Missile Test Launch Detected', description: 'Ballistic missile test launch detected via satellite imagery.', location: 'Pyongyang, DPRK', coordinates: { x: 81, y: 32 }, severity: 'critical', timestamp: '2026-03-07T03:15:00Z', source: 'NORAD' },
  { id: '9', type: 'cyber', title: 'Zero-Day Exploit Active in Wild', description: 'Critical zero-day vulnerability being actively exploited in enterprise systems.', location: 'Global', coordinates: { x: 50, y: 30 }, severity: 'critical', timestamp: '2026-03-07T08:45:00Z', source: 'Microsoft MSRC' },
  { id: '10', type: 'financial', title: 'Crypto Exchange Hack', description: 'Major cryptocurrency exchange reports unauthorized access to hot wallets.', location: 'Cayman Islands', coordinates: { x: 23, y: 42 }, severity: 'high', timestamp: '2026-03-07T07:30:00Z', source: 'CoinDesk' },
];

export const cyberAttacks: CyberAttack[] = [
  { id: '1', target: 'EU Health Systems', attackType: 'Ransomware', severity: 'critical', country: 'Belgium', timestamp: '2026-03-07T08:23:00Z', source: 'CERT-EU', status: 'active' },
  { id: '2', target: 'APAC Banking Network', attackType: 'DDoS', severity: 'high', country: 'Singapore', timestamp: '2026-03-07T07:12:00Z', source: 'FS-ISAC', status: 'active' },
  { id: '3', target: 'Fortune 500 Software Vendor', attackType: 'Supply Chain', severity: 'critical', country: 'USA', timestamp: '2026-03-07T09:00:00Z', source: 'CISA', status: 'investigating' },
  { id: '4', target: 'Enterprise Windows Systems', attackType: 'Zero-Day Exploit', severity: 'critical', country: 'Global', timestamp: '2026-03-07T08:45:00Z', source: 'MSRC', status: 'active' },
  { id: '5', target: 'CryptoVault Exchange', attackType: 'Unauthorized Access', severity: 'high', country: 'Cayman Islands', timestamp: '2026-03-07T07:30:00Z', source: 'CoinDesk', status: 'investigating' },
  { id: '6', target: 'Telecom Provider', attackType: 'Malware', severity: 'medium', country: 'Brazil', timestamp: '2026-03-07T06:00:00Z', source: 'LACNIC CSIRT', status: 'mitigated' },
  { id: '7', target: 'Defense Contractor', attackType: 'APT Intrusion', severity: 'critical', country: 'UK', timestamp: '2026-03-07T05:15:00Z', source: 'NCSC', status: 'investigating' },
  { id: '8', target: 'Water Treatment Plant', attackType: 'SCADA Attack', severity: 'high', country: 'Israel', timestamp: '2026-03-07T04:30:00Z', source: 'ICS-CERT', status: 'mitigated' },
];

export const newsItems: NewsItem[] = [
  { id: '1', headline: 'Critical Infrastructure Under Siege: Multi-Vector Attack Campaign', summary: 'Coordinated cyber-physical attacks targeting water, energy, and healthcare sectors across NATO allies.', source: 'CyberScoop', category: 'cyber', timestamp: '2026-03-07T09:30:00Z' },
  { id: '2', headline: 'Carrier Strike Group Repositioned to Western Pacific', summary: 'USS Gerald R. Ford carrier strike group ordered to redeploy amid rising tensions.', source: 'Naval News', category: 'military', timestamp: '2026-03-07T08:00:00Z' },
  { id: '3', headline: 'New Sanctions Package Targets Semiconductor Supply Chain', summary: 'Expanded export controls expected to impact AI chip production and distribution.', source: 'Reuters', category: 'geopolitical', timestamp: '2026-03-07T07:45:00Z' },
  { id: '4', headline: 'Defense Stocks Surge Amid Escalating Global Tensions', summary: 'Raytheon, Lockheed Martin, and Palantir see significant gains as defense spending increases.', source: 'Bloomberg', category: 'financial', timestamp: '2026-03-07T07:00:00Z' },
  { id: '5', headline: 'Satellite Imagery Reveals New Military Installations', summary: 'Commercial satellite data shows rapid construction of hardened facilities.', source: 'Bellingcat', category: 'military', timestamp: '2026-03-07T06:30:00Z' },
  { id: '6', headline: 'Ransomware Group Claims 2TB Data Exfiltration', summary: 'LockBit successor group threatens to release classified government documents.', source: 'BleepingComputer', category: 'cyber', timestamp: '2026-03-07T06:00:00Z' },
];
