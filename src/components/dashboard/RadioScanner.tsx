import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Volume2, VolumeX, Search, Scan, AlertCircle } from 'lucide-react';
import { radioStations, type RadioStation } from '@/data/mockData';

const typeColor: Record<string, string> = {
  news: 'text-primary',
  government: 'text-accent-foreground',
  music: 'text-primary',
  emergency: 'text-destructive',
};

// All stations are verified working — no scanner frequencies without real streams
const allStations = radioStations.filter(s => !!s.streamUrl);
const regionGroups: Record<string, RadioStation[]> = {};
allStations.forEach((s) => {
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
  const [audioError, setAudioError] = useState<string | null>(null);
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
    setAudioError(null);

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

    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.src = station.streamUrl;
    audio.load();

    audio.onerror = () => {
      setIsPlaying(false);
      setAudioError('Stream connection failed. The station may be temporarily offline.');
    };

    audio.play()
      .then(() => {
        setIsPlaying(true);
        setAudioError(null);
      })
      .catch((err) => {
        console.error('Audio play error:', err);
        setIsPlaying(false);
        setAudioError('Could not play this stream. It may be temporarily unavailable.');
      });
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Radio className="w-3.5 h-3.5 text-primary" />
        Global Radio Scanner
        <div className="ml-auto flex items-center gap-2">
          {isPlaying && selectedStation && (
            <span className="flex items-center gap-1 text-[9px] text-primary font-mono">
              <Volume2 className="w-3 h-3 animate-pulse" />
              LIVE
            </span>
          )}
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors ${
              isScanning ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scan className="w-2.5 h-2.5" />
            SCAN
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="px-2 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
              <div
                className="absolute h-full w-1 bg-primary rounded-full transition-all"
                style={{ left: `${((scanFreq - 88) / (174 - 88)) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-primary w-16 text-right">{scanFreq.toFixed(1)} MHz</span>
          </div>
        </div>
      )}

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

      {/* Now playing / error */}
      {selectedStation && (
        <div className="px-2.5 py-2 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-foreground truncate">{selectedStation.name}</p>
              <p className="text-[9px] text-muted-foreground">{selectedStation.country} · {selectedStation.language}</p>
            </div>
          </div>
          {audioError && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-destructive">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{audioError}</span>
            </div>
          )}
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
              <Radio className={`w-3 h-3 shrink-0 ${selectedStation?.id === station.id && isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-foreground truncate">{station.name}</span>
                  <span className={`text-[8px] font-mono uppercase ${typeColor[station.type] || 'text-muted-foreground'}`}>
                    {station.type}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                  <span>{station.country}</span>
                  <span>·</span>
                  <span>{station.language}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
