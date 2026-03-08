import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Volume2, VolumeX, MapPin, Globe } from 'lucide-react';
import { radioStations, type RadioStation } from '@/data/mockData';

const typeColor: Record<string, string> = {
  news: 'text-neon-cyan',
  government: 'text-neon-amber',
  music: 'text-neon-green',
  emergency: 'text-neon-red',
};

const regionStations: Record<string, RadioStation[]> = {};
radioStations.forEach(s => {
  if (!regionStations[s.region]) regionStations[s.region] = [];
  regionStations[s.region].push(s);
});

export default function RadioPanel() {
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const regions = ['all', ...Object.keys(regionStations)];
  const filtered = selectedRegion === 'all' ? radioStations : (regionStations[selectedRegion] || []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
      audio.onerror = () => setIsPlaying(false);
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Radio className="w-3.5 h-3.5 text-neon-cyan" />
        World Radio
        {isPlaying && selectedStation && (
          <span className="ml-auto flex items-center gap-1 text-[9px] text-neon-green font-mono">
            <Volume2 className="w-3 h-3" />
            LIVE
          </span>
        )}
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
            transition={{ delay: i * 0.03 }}
            onClick={() => playStation(station)}
            className={`px-2.5 py-2 border-b border-border cursor-pointer transition-colors ${
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
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{station.country}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Globe className="w-2.5 h-2.5" />
                    <span>{station.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
