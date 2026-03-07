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
};

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

export const financialTickers: FinancialTicker[] = [
  { symbol: 'RTX', name: 'Raytheon', price: 124.57, change: 3.42, changePercent: 2.82 },
  { symbol: 'LMT', name: 'Lockheed Martin', price: 498.23, change: 8.15, changePercent: 1.66 },
  { symbol: 'PLTR', name: 'Palantir', price: 78.92, change: 4.21, changePercent: 5.63 },
  { symbol: 'CRWD', name: 'CrowdStrike', price: 342.18, change: -2.34, changePercent: -0.68 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 892.45, change: 12.67, changePercent: 1.44 },
  { symbol: 'NOC', name: 'Northrop Grumman', price: 512.30, change: 6.89, changePercent: 1.36 },
  { symbol: 'BTC', name: 'Bitcoin', price: 97842.00, change: -1245.00, changePercent: -1.26 },
  { symbol: 'OIL', name: 'Crude Oil', price: 84.32, change: 1.87, changePercent: 2.27 },
];
