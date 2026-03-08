import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Ship, Satellite, Zap, Radio, Volume2, VolumeX, Crosshair, Globe, Gauge, Compass, Shield, Target, Navigation, Wifi, Signal } from 'lucide-react';
import type { AircraftState, SatelliteData, ShipData, CyberThreat } from '@/types/intelligence';

export type SelectedAsset =
  | { type: 'aircraft'; data: AircraftState }
  | { type: 'ship'; data: ShipData }
  | { type: 'satellite'; data: SatelliteData }
  | { type: 'cyber'; data: CyberThreat }
  | null;

interface Props {
  asset: SelectedAsset;
  onClose: () => void;
}

// Aviation radio frequencies by callsign prefix
const aviationFrequencies: Record<string, { freq: string; name: string }[]> = {
  UAL: [{ freq: '128.825', name: 'United Ops' }, { freq: '121.500', name: 'Emergency' }],
  BAW: [{ freq: '131.725', name: 'Speedbird Ops' }, { freq: '121.500', name: 'Emergency' }],
  DLH: [{ freq: '131.125', name: 'Lufthansa Ops' }],
  AAL: [{ freq: '129.125', name: 'American Ops' }],
  DAL: [{ freq: '130.025', name: 'Delta Ops' }],
  SWR: [{ freq: '136.025', name: 'Swiss Ops' }],
  AFR: [{ freq: '131.725', name: 'Air France Ops' }],
  MIL: [{ freq: '243.000', name: 'Military UHF Guard' }, { freq: '121.500', name: 'VHF Guard' }],
};

const satelliteFrequencies: Record<string, { freq: string; band: string }[]> = {
  communication: [{ freq: '3.7-4.2 GHz', band: 'C-Band Downlink' }, { freq: '11.7-12.2 GHz', band: 'Ku-Band' }],
  military: [{ freq: '7.25-7.75 GHz', band: 'X-Band Mil' }, { freq: '20.2-21.2 GHz', band: 'Ka-Band Mil' }],
  gps: [{ freq: '1575.42 MHz', band: 'L1 C/A' }, { freq: '1227.60 MHz', band: 'L2' }],
  weather: [{ freq: '1694.5 MHz', band: 'LRIT' }, { freq: '1707.0 MHz', band: 'HRIT' }],
  starlink: [{ freq: '10.7-12.7 GHz', band: 'Ku-Band DL' }, { freq: '14.0-14.5 GHz', band: 'Ku-Band UL' }],
};

const navalFrequencies = [
  { freq: '2182 kHz', name: 'Intl Distress' },
  { freq: '156.800 MHz', name: 'CH16 VHF' },
  { freq: '156.650 MHz', name: 'CH13 Bridge' },
  { freq: '243.000 MHz', name: 'Mil Guard UHF' },
];

// Live scanner stream URLs for aviation/maritime
const scannerStreams: Record<string, string> = {
  'New York TRACON': 'https://www.liveatc.net/hlisten.php?mount=kjfk_app_gnd',
  'London Control': 'https://www.liveatc.net/hlisten.php?mount=egll_app',
  'US Navy Fleet': 'https://www.broadcastify.com/listen/feed/22534',
};

function getAircraftType(ac: AircraftState): string {
  if (ac.callsign?.startsWith('MIL') || ac.category === 'military') return 'Military';
  if ((ac.velocity || 0) > 280) return 'High-Speed / Military';
  if (ac.callsign?.startsWith('N') && !ac.callsign?.match(/\d{3,}/)) return 'Private / GA';
  return 'Commercial';
}

function getCallsignPrefix(callsign: string | null): string {
  if (!callsign) return '';
  return callsign.replace(/\d+.*$/, '').substring(0, 3);
}

export default function AssetDetailPanel({ asset, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'radio' | 'signals'>('info');
  const [scannerPlaying, setScannerPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [asset]);

  if (!asset) return null;

  const tabs = ['info', 'radio', 'signals'] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-4 right-4 w-80 z-50 bg-card border border-border rounded-lg shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(var(--border))' }}
      >
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-border flex items-center gap-2 bg-muted/30">
          {asset.type === 'aircraft' && <Plane className="w-4 h-4 text-neon-cyan" />}
          {asset.type === 'ship' && <Ship className="w-4 h-4 text-neon-green" />}
          {asset.type === 'satellite' && <Satellite className="w-4 h-4 text-neon-blue" />}
          {asset.type === 'cyber' && <Zap className="w-4 h-4 text-neon-red" />}
          <span className="font-mono text-xs font-semibold text-foreground tracking-wide">
            {asset.type === 'aircraft' && (asset.data.callsign || asset.data.icao24.toUpperCase())}
            {asset.type === 'ship' && asset.data.name}
            {asset.type === 'satellite' && asset.data.name}
            {asset.type === 'cyber' && `${asset.data.attackType} — ${asset.data.target}`}
          </span>
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-muted/50 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-72 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="p-3 space-y-2">
              {asset.type === 'aircraft' && <AircraftInfo data={asset.data} />}
              {asset.type === 'ship' && <ShipInfo data={asset.data} />}
              {asset.type === 'satellite' && <SatelliteInfo data={asset.data} />}
              {asset.type === 'cyber' && <CyberInfo data={asset.data} />}
            </div>
          )}
          {activeTab === 'radio' && (
            <div className="p-3 space-y-2">
              {asset.type === 'aircraft' && <AircraftRadio data={asset.data} />}
              {asset.type === 'ship' && <ShipRadio />}
              {asset.type === 'satellite' && <SatelliteRadio data={asset.data} />}
              {asset.type === 'cyber' && (
                <div className="text-[10px] text-muted-foreground py-4 text-center">No radio frequencies for cyber events</div>
              )}
            </div>
          )}
          {activeTab === 'signals' && (
            <div className="p-3 space-y-2">
              <SignalIntelligence asset={asset} />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50">
      <span className="text-[9px] text-muted-foreground font-mono uppercase">{label}</span>
      <span className={`text-[10px] font-mono font-medium ${accent ? 'text-neon-cyan' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function AircraftInfo({ data }: { data: AircraftState }) {
  const type = getAircraftType(data);
  const isMil = type.includes('Military');
  return (
    <>
      <InfoRow label="Callsign" value={data.callsign || 'N/A'} accent />
      <InfoRow label="ICAO Hex" value={data.icao24.toUpperCase()} />
      <InfoRow label="Type" value={type} />
      <InfoRow label="Country" value={data.originCountry} />
      <InfoRow label="Altitude" value={data.altitude ? `${Math.round(data.altitude)}m / FL${Math.round(data.altitude / 30.48).toString().padStart(3, '0')}` : 'Ground'} />
      <InfoRow label="Speed" value={data.velocity ? `${Math.round(data.velocity)} kts` : '---'} />
      <InfoRow label="Heading" value={data.heading ? `${Math.round(data.heading)}°` : '---'} />
      <InfoRow label="Position" value={data.latitude && data.longitude ? `${data.latitude.toFixed(4)}°, ${data.longitude.toFixed(4)}°` : '---'} />
      {isMil && (
        <div className="mt-2 px-2 py-1.5 rounded bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-1.5 text-[9px] text-neon-red font-mono">
            <Shield className="w-3 h-3" />
            MILITARY ASSET — RESTRICTED TRACKING
          </div>
        </div>
      )}
    </>
  );
}

function ShipInfo({ data }: { data: ShipData }) {
  return (
    <>
      <InfoRow label="Vessel" value={data.name} accent />
      <InfoRow label="Flag" value={`${data.flag} ${data.country}`} />
      <InfoRow label="Type" value={data.type.toUpperCase()} />
      <InfoRow label="Speed" value={`${data.speed} kts`} />
      <InfoRow label="Heading" value={`${data.heading}°`} />
      <InfoRow label="Position" value={`${data.lat.toFixed(4)}°, ${data.lng.toFixed(4)}°`} />
      {data.type === 'naval' && (
        <div className="mt-2 px-2 py-1.5 rounded bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-1.5 text-[9px] text-neon-red font-mono">
            <Target className="w-3 h-3" />
            NAVAL COMBATANT — SIGINT ACTIVE
          </div>
        </div>
      )}
    </>
  );
}

function SatelliteInfo({ data }: { data: SatelliteData }) {
  return (
    <>
      <InfoRow label="Name" value={data.name} accent />
      <InfoRow label="Category" value={data.category.toUpperCase()} />
      <InfoRow label="Country" value={data.country} />
      <InfoRow label="Altitude" value={`${Math.round(data.altitude)} km`} />
      <InfoRow label="Velocity" value={`${data.velocity.toFixed(1)} km/s`} />
      <InfoRow label="Position" value={`${data.lat.toFixed(2)}°, ${data.lng.toFixed(2)}°`} />
      <InfoRow label="Orbit" value={data.altitude < 2000 ? 'LEO' : data.altitude < 35786 ? 'MEO' : 'GEO'} />
    </>
  );
}

function CyberInfo({ data }: { data: CyberThreat }) {
  return (
    <>
      <InfoRow label="Attack Type" value={data.attackType} accent />
      <InfoRow label="Target" value={data.target} />
      <InfoRow label="Severity" value={data.severity.toUpperCase()} />
      <InfoRow label="Status" value={data.status.toUpperCase()} />
      <InfoRow label="Source" value={data.source} />
      <InfoRow label="Origin" value={`${data.sourceLat.toFixed(2)}°, ${data.sourceLng.toFixed(2)}°`} />
      <InfoRow label="Target Loc" value={`${data.targetLat.toFixed(2)}°, ${data.targetLng.toFixed(2)}°`} />
      <InfoRow label="Time" value={new Date(data.timestamp).toLocaleString()} />
      <div className="mt-2 px-2 py-1.5 rounded bg-destructive/10 border border-destructive/20">
        <div className="flex items-center gap-1.5 text-[9px] text-neon-red font-mono">
          <Zap className="w-3 h-3" />
          {data.status === 'active' ? 'ACTIVE THREAT — MONITORING' : 'INVESTIGATION IN PROGRESS'}
        </div>
      </div>
    </>
  );
}

function FreqRow({ freq, label }: { freq: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-muted/30 border border-border/50">
      <Signal className="w-3 h-3 text-neon-green shrink-0" />
      <span className="text-[10px] font-mono text-neon-green">{freq}</span>
      <span className="text-[9px] text-muted-foreground ml-auto">{label}</span>
    </div>
  );
}

function AircraftRadio({ data }: { data: AircraftState }) {
  const prefix = getCallsignPrefix(data.callsign);
  const freqs = aviationFrequencies[prefix] || [{ freq: '121.500 MHz', name: 'Emergency Guard' }];

  return (
    <div className="space-y-1.5">
      <div className="text-[9px] text-muted-foreground font-mono uppercase mb-2">Aviation Frequencies</div>
      {freqs.map((f, i) => <FreqRow key={i} freq={`${f.freq} MHz`} label={f.name} />)}
      <FreqRow freq="121.500 MHz" label="VHF Guard" />
      <FreqRow freq="243.000 MHz" label="UHF Guard" />
      <div className="mt-3 text-[9px] text-muted-foreground font-mono uppercase mb-1">ATC Scanners</div>
      <div className="text-[10px] text-muted-foreground px-2 py-2 bg-muted/20 rounded border border-border/50">
        <div className="flex items-center gap-1.5 mb-1">
          <Wifi className="w-3 h-3 text-neon-cyan" />
          <span className="text-neon-cyan font-mono">LiveATC Scanner</span>
        </div>
        <p className="text-[9px] leading-relaxed">Listen to live ATC at liveatc.net for real-time communications on this frequency.</p>
      </div>
    </div>
  );
}

function ShipRadio() {
  return (
    <div className="space-y-1.5">
      <div className="text-[9px] text-muted-foreground font-mono uppercase mb-2">Maritime Frequencies</div>
      {navalFrequencies.map((f, i) => <FreqRow key={i} freq={f.freq} label={f.name} />)}
    </div>
  );
}

function SatelliteRadio({ data }: { data: SatelliteData }) {
  const freqs = satelliteFrequencies[data.category] || satelliteFrequencies.communication;
  return (
    <div className="space-y-1.5">
      <div className="text-[9px] text-muted-foreground font-mono uppercase mb-2">Satellite Bands</div>
      {freqs.map((f, i) => <FreqRow key={i} freq={f.freq} label={f.band} />)}
      <div className="mt-3 px-2 py-2 bg-muted/20 rounded border border-border/50">
        <div className="flex items-center gap-1.5 text-[9px] text-neon-blue font-mono">
          <Radio className="w-3 h-3" />
          SDR receivers can decode {data.category === 'weather' ? 'APT/LRIT imagery' : data.category === 'gps' ? 'navigation signals' : 'telemetry'} from this satellite
        </div>
      </div>
    </div>
  );
}

function SignalIntelligence({ asset }: { asset: SelectedAsset }) {
  if (!asset) return null;

  const signals = [
    { type: 'ELINT', strength: Math.random() * 100, desc: 'Electronic emissions detected' },
    { type: 'COMINT', strength: Math.random() * 100, desc: 'Communication intercepts' },
    { type: 'MASINT', strength: Math.random() * 60, desc: 'Measurement signatures' },
  ];

  return (
    <div className="space-y-2">
      <div className="text-[9px] text-muted-foreground font-mono uppercase mb-2">Signal Intelligence</div>
      {signals.map((sig, i) => (
        <div key={i} className="px-2 py-2 rounded bg-muted/20 border border-border/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono text-foreground">{sig.type}</span>
            <span className={`text-[9px] font-mono ${sig.strength > 70 ? 'text-neon-red' : sig.strength > 40 ? 'text-neon-amber' : 'text-neon-green'}`}>
              {sig.strength.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${sig.strength}%`,
                background: sig.strength > 70
                  ? 'hsl(var(--neon-red))'
                  : sig.strength > 40
                    ? 'hsl(var(--neon-amber))'
                    : 'hsl(var(--neon-green))',
              }}
            />
          </div>
          <p className="text-[8px] text-muted-foreground mt-1">{sig.desc}</p>
        </div>
      ))}
    </div>
  );
}
