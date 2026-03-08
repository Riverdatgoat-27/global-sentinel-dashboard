import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Volume2, VolumeX, Search, Globe, MapPin, Signal, Wifi, Scan } from 'lucide-react';
import { radioStations, type RadioStation } from '@/data/mockData';

const typeColor: Record<string, string> = {
  news: 'text-neon-cyan',
  government: 'text-neon-amber',
  music: 'text-neon-green',
  emergency: 'text-neon-red',
  aviation: 'text-neon-blue',
  maritime: 'text-neon-cyan',
  military: 'text-neon-red',
  ham: 'text-neon-green',
};

// Extended with scanner frequencies
const scannerFrequencies: RadioStation[] = [
  { id: 'scan-1', name: 'NYC ATC - JFK Approach', country: 'USA', region: 'Aviation', streamUrl: '', language: 'English', type: 'news', lat: 40.6, lng: -73.8 },
  { id: 'scan-2', name: 'London Heathrow Tower', country: 'UK', region: 'Aviation', streamUrl: '', language: 'English', type: 'news', lat: 51.5, lng: -0.5 },
  { id: 'scan-3', name: 'US Navy Atlantic Fleet', country: 'USA', region: 'Military', streamUrl: '', language: 'English', type: 'government', lat: 36.9, lng: -76.3 },
  { id: 'scan-4', name: 'Coast Guard CH16', country: 'USA', region: 'Maritime', streamUrl: '', language: 'English', type: 'emergency', lat: 38.9, lng: -77.0 },
  { id: 'scan-5', name: 'Tokyo ATC Approach', country: 'Japan', region: 'Aviation', streamUrl: '', language: 'Japanese', type: 'news', lat: 35.6, lng: 139.8 },
  { id: 'scan-6', name: 'ISS Downlink 145.800 MHz', country: 'Space', region: 'Satellite', streamUrl: '', language: 'English', type: 'government', lat: 0, lng: 0 },
  { id: 'scan-7', name: 'NOAA Weather Sat APT', country: 'USA', region: 'Satellite', streamUrl: '', language: 'Data', type: 'news', lat: 0, lng: 0 },
  { id: 'scan-8', name: 'Amateur 14.300 MHz Net', country: 'Global', region: 'Ham Radio', streamUrl: '', language: 'English', type: 'news', lat: 0, lng: 0 },
  { id: 'scan-9', name: 'Moscow ATC Center', country: 'Russia', region: 'Aviation', streamUrl: '', language: 'Russian', type: 'news', lat: 55.8, lng: 37.6 },
  { id: 'scan-10', name: 'Dubai Approach 124.9', country: 'UAE', region: 'Aviation', streamUrl: '', language: 'English', type: 'news', lat: 25.3, lng: 55.4 },
  { id: 'scan-11', name: 'Port of Shanghai VHF', country: 'China', region: 'Maritime', streamUrl: '', language: 'Mandarin', type: 'news', lat: 30.6, lng: 122.1 },
  { id: 'scan-12', name: 'RAF Lakenheath Ground', country: 'UK', region: 'Military', streamUrl: '', language: 'English', type: 'government', lat: 52.4, lng: 0.6 },
];

const allStations = [...radioStations, ...scannerFrequencies];
const regionGroups: Record<string, (RadioStation)[]> = {};
allStations.forEach(s => {
  if (!regionGroups[s.region]) regionGroups[s.region] = [];
  regionGroups[s.region].push(s);
});

export default function RadioScanner() {
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanFreq, setScanFreq] = useState(88.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const regions = ['all', ...Object.keys(regionGroups)];
  
  let filtered = selectedRegion === 'all' ? allStations : (regionGroups[selectedRegion] || []);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.country.toLowerCase().includes(term) ||
      s.language.toLowerCase().includes(term)
    );
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Scanning animation
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanFreq(prev => {
        const next = prev + 0.2;
        return next > 174 ? 88.0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isScanning]);

  const playStation = (station: RadioStation) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (selectedStation?.id === station.id && isPlaying) {
      setIsPlaying(false);
      setSelectedStation(null);
      return;
    }
    setSelectedStation(station);
    if (station.streamUrl) {
      const audio = new Audio(station.streamUrl);
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      audio.onerror = () => setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Radio className="w-3.5 h-3.5 text-neon-cyan" />
        Global Radio Scanner
        <div className="ml-auto flex items-center gap-2">
          {isPlaying && selectedStation && (
            <span className="flex items-center gap-1 text-[9px] text-neon-green font-mono">
              <Volume2 className="w-3 h-3" />
              LIVE
            </span>
          )}
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors ${
              isScanning ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scan className="w-2.5 h-2.5" />
            SCAN
          </button>
        </div>
      </div>

      {/* Scanner bar */}
      {isScanning && (
        <div className="px-2 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Signal className="w-3 h-3 text-neon-cyan animate-pulse" />
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
              <div
                className="absolute h-full w-1 bg-neon-cyan rounded-full transition-all"
                style={{ left: `${((scanFreq - 88) / (174 - 88)) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-neon-cyan w-16 text-right">{scanFreq.toFixed(1)} MHz</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-2 py-1.5 border-b border-border">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/50">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search frequencies..."
            className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground outline-none font-mono"
          />
        </div>
      </div>

      {/* Region filter */}
      <div className="flex gap-0.5 px-2 py-1 border-b border-border overflow-x-auto">
        {regions.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`text-[8px] px-1.5 py-0.5 rounded-sm font-mono tracking-wider uppercase whitespace-nowrap transition-colors ${
              selectedRegion === r ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r === 'all' ? 'ALL' : r}
          </button>
        ))}
      </div>

      {/* Now playing */}
      {selectedStation && (
        <div className="px-2.5 py-2 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-neon-green shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-foreground truncate">{selectedStation.name}</p>
              <p className="text-[9px] text-muted-foreground">{selectedStation.country} · {selectedStation.language}</p>
            </div>
          </div>
        </div>
      )}

      {/* Station list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((station, i) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => playStation(station)}
            className={`px-2.5 py-1.5 border-b border-border cursor-pointer transition-colors ${
              selectedStation?.id === station.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className={`w-3 h-3 shrink-0 ${selectedStation?.id === station.id && isPlaying ? 'text-neon-green' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-foreground truncate">{station.name}</span>
                  <span className={`text-[8px] font-mono uppercase ${typeColor[station.type] || 'text-muted-foreground'}`}>
                    {station.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                  <span>{station.country}</span>
                  <span>·</span>
                  <span>{station.language}</span>
                  {!station.streamUrl && <span className="text-[8px] text-muted-foreground/50">(metadata only)</span>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
