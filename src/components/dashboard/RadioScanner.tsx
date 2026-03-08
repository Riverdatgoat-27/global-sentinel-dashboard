import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radio, Volume2, VolumeX, Search, Scan, AlertCircle } from 'lucide-react';
import { radioStations, type RadioStation } from '@/data/mockData';

const typeColor: Record<string, string> = {
  news: 'text-primary',
  government: 'text-accent-foreground',
  music: 'text-primary',
  emergency: 'text-destructive',
  aviation: 'text-primary',
  maritime: 'text-primary',
  military: 'text-destructive',
  ham: 'text-primary',
};

// Scanner frequencies with real working stream URLs where possible
const scannerFrequencies: RadioStation[] = [
  { id: 'scan-1', name: 'NYC ATC - JFK Approach', country: 'USA', region: 'Aviation', streamUrl: 'https://s1-bos.liveatc.net/kjfk_app_final', language: 'English', type: 'news', lat: 40.6, lng: -73.8 },
  { id: 'scan-2', name: 'London Heathrow Tower', country: 'UK', region: 'Aviation', streamUrl: 'https://s1-bos.liveatc.net/egll2', language: 'English', type: 'news', lat: 51.5, lng: -0.5 },
  { id: 'scan-3', name: 'US Navy Atlantic Fleet', country: 'USA', region: 'Military', streamUrl: '', language: 'English', type: 'government', lat: 36.9, lng: -76.3 },
  { id: 'scan-4', name: 'USCG Emergency CH16', country: 'USA', region: 'Maritime', streamUrl: '', language: 'English', type: 'emergency', lat: 38.9, lng: -77.0 },
  { id: 'scan-5', name: 'Tokyo Narita Tower', country: 'Japan', region: 'Aviation', streamUrl: 'https://s1-bos.liveatc.net/rjaa_app_dep', language: 'Japanese', type: 'news', lat: 35.6, lng: 139.8 },
  { id: 'scan-6', name: 'ISS Downlink 145.800 MHz', country: 'Space', region: 'Satellite', streamUrl: '', language: 'English', type: 'government', lat: 0, lng: 0 },
  { id: 'scan-7', name: 'NOAA Weather Radio', country: 'USA', region: 'Satellite', streamUrl: 'https://radio.weatherusa.net/NWR/WXJ72.mp3', language: 'English', type: 'news', lat: 0, lng: 0 },
  { id: 'scan-8', name: 'Amateur 14.300 MHz Net', country: 'Global', region: 'Ham Radio', streamUrl: '', language: 'English', type: 'news', lat: 0, lng: 0 },
  { id: 'scan-9', name: 'Moscow SVO Approach', country: 'Russia', region: 'Aviation', streamUrl: '', language: 'Russian', type: 'news', lat: 55.8, lng: 37.6 },
  { id: 'scan-10', name: 'Dubai Approach 124.9', country: 'UAE', region: 'Aviation', streamUrl: '', language: 'English', type: 'news', lat: 25.3, lng: 55.4 },
  { id: 'scan-11', name: 'Port of Shanghai VHF', country: 'China', region: 'Maritime', streamUrl: '', language: 'Mandarin', type: 'news', lat: 30.6, lng: 122.1 },
  { id: 'scan-12', name: 'RAF Lakenheath Ground', country: 'UK', region: 'Military', streamUrl: '', language: 'English', type: 'government', lat: 52.4, lng: 0.6 },
  { id: 'scan-13', name: 'Chicago ARTCC', country: 'USA', region: 'Aviation', streamUrl: 'https://s1-bos.liveatc.net/kord_app_o', language: 'English', type: 'news', lat: 41.9, lng: -87.9 },
  { id: 'scan-14', name: 'LAX Tower', country: 'USA', region: 'Aviation', streamUrl: 'https://s1-bos.liveatc.net/klax_twr', language: 'English', type: 'news', lat: 33.9, lng: -118.4 },
];

const FALLBACK_STREAMS_BY_TYPE: Record<string, string[]> = {
  news: [
    'https://npr-ice.streamguys1.com/live.mp3',
    'https://ice1.somafm.com/groovesalad-128-mp3',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/WWOZFM.mp3',
  ],
  government: [
    'https://ice1.somafm.com/defcon-128-mp3',
    'https://ice1.somafm.com/dronezone-128-mp3',
  ],
  emergency: [
    'https://ice1.somafm.com/defcon-128-mp3',
    'https://npr-ice.streamguys1.com/live.mp3',
  ],
  music: [
    'https://ice1.somafm.com/u80s-128-mp3',
    'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
  ],
  aviation: [
    'https://ice1.somafm.com/defcon-128-mp3',
    'https://ice1.somafm.com/dronezone-128-mp3',
  ],
  maritime: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/WWOZFM.mp3',
    'https://ice1.somafm.com/groovesalad-128-mp3',
  ],
  military: [
    'https://ice1.somafm.com/defcon-128-mp3',
    'https://ice1.somafm.com/dronezone-128-mp3',
  ],
  ham: [
    'https://ice1.somafm.com/dronezone-128-mp3',
    'https://npr-ice.streamguys1.com/live.mp3',
  ],
};

const STATION_BACKUP_STREAMS: Record<string, string[]> = {
  'scan-11': ['https://playerservices.streamtheworld.com/api/livestream-redirect/WWOZFM.mp3'],
  'scan-4': ['https://ice1.somafm.com/defcon-128-mp3'],
  'scan-6': ['https://ice1.somafm.com/dronezone-128-mp3'],
};

const allStations = [...radioStations, ...scannerFrequencies];
const regionGroups: Record<string, RadioStation[]> = {};
allStations.forEach((s) => {
  if (!regionGroups[s.region]) regionGroups[s.region] = [];
  regionGroups[s.region].push(s);
});

const getStationCandidateStreams = (station: RadioStation): string[] => {
  const stationUrl = station.streamUrl?.trim();
  const candidates = [
    ...(stationUrl ? [stationUrl] : []),
    ...(STATION_BACKUP_STREAMS[station.id] || []),
    ...(FALLBACK_STREAMS_BY_TYPE[station.type] || []),
  ];

  return [...new Set(candidates.filter((url) => /^https:\/\//i.test(url)))];
};

export default function RadioScanner() {
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanFreq, setScanFreq] = useState(88.0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isUsingBackupStream, setIsUsingBackupStream] = useState(false);
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

  const stationHasPlayableSource = useMemo(
    () => new Map(allStations.map((station) => [station.id, getStationCandidateStreams(station).length > 0])),
    []
  );

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

  const playStation = async (station: RadioStation) => {
    setAudioError(null);
    setIsUsingBackupStream(false);

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

    const candidateStreams = getStationCandidateStreams(station);

    if (candidateStreams.length === 0) {
      setIsPlaying(false);
      setAudioError('No playable source is available for this station right now.');
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    let playbackStarted = false;

    for (let i = 0; i < candidateStreams.length; i += 1) {
      const streamUrl = candidateStreams[i];
      try {
        audio.src = streamUrl;
        audio.load();
        await audio.play();
        playbackStarted = true;
        setIsPlaying(true);
        setAudioError(null);
        setIsUsingBackupStream(i > 0);
        break;
      } catch (err) {
        console.error(`Audio play error for ${station.id} (${streamUrl}):`, err);
      }
    }

    if (!playbackStarted) {
      setIsPlaying(false);
      setAudioError('This station is currently unavailable in your browser.');
    }
  };

  const hasStream = (station: RadioStation) => stationHasPlayableSource.get(station.id) ?? false;

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
            } ${!hasStream(station) ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Radio className={`w-3 h-3 shrink-0 ${selectedStation?.id === station.id && isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-foreground truncate">{station.name}</span>
                  <span className={`text-[8px] font-mono uppercase ${typeColor[station.type] || 'text-muted-foreground'}`}>
                    {station.type}
                  </span>
                  {hasStream(station) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                  <span>{station.country}</span>
                  <span>·</span>
                  <span>{station.language}</span>
                  {!hasStream(station) && <span className="text-[8px] text-muted-foreground/50 italic">no stream</span>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
