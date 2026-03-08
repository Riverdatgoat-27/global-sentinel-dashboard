import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Maximize2, Minimize2, MapPin, RefreshCw } from 'lucide-react';
import type { CCTVCamera } from '@/types/intelligence';

interface Props {
  camera: CCTVCamera;
  onClose: () => void;
}

// Map camera IDs to Windy webcam embed URLs
const WEBCAM_MAP: Record<string, string> = {
  'cam-1': 'https://webcams.windy.com/webcams/public/embed/player/1241697801/day',
  'cam-2': 'https://webcams.windy.com/webcams/public/embed/player/1586352498/day',
  'cam-3': 'https://webcams.windy.com/webcams/public/embed/player/1242006498/day',
  'cam-4': 'https://webcams.windy.com/webcams/public/embed/player/1170151498/day',
  'cam-5': 'https://webcams.windy.com/webcams/public/embed/player/1170151498/day',
  'cam-6': 'https://webcams.windy.com/webcams/public/embed/player/1586352124/day',
  'cam-7': 'https://webcams.windy.com/webcams/public/embed/player/1459274124/day',
  'cam-8': 'https://webcams.windy.com/webcams/public/embed/player/1140875498/day',
  'cam-9': 'https://webcams.windy.com/webcams/public/embed/player/1586779498/day',
  'cam-10': 'https://webcams.windy.com/webcams/public/embed/player/1586352222/day',
};

export default function CCTVViewer({ camera, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const embedUrl = WEBCAM_MAP[camera.id] || `https://webcams.windy.com/webcams/public/embed/player/1241697801/day`;

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute z-20 bg-card/95 border border-primary/30 rounded-lg overflow-hidden backdrop-blur-md ${
        expanded ? 'inset-4' : 'top-14 right-2 w-72 h-52'
      }`}
      style={{ boxShadow: '0 8px 40px hsl(0 0% 0% / 0.6), 0 0 20px hsl(var(--primary) / 0.1)' }}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border bg-primary/5">
        <Camera className="w-3.5 h-3.5 text-neon-cyan" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[10px] font-semibold text-foreground truncate">{camera.name}</span>
            <span className="text-[8px] text-neon-green font-mono">LIVE</span>
          </div>
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
            <MapPin className="w-2.5 h-2.5" />
            <span>{camera.location}</span>
          </div>
        </div>
        <button onClick={() => setRefreshKey(k => k + 1)} className="p-1 hover:bg-muted/50 rounded">
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted/50 rounded">
          {expanded ? <Minimize2 className="w-3 h-3 text-muted-foreground" /> : <Maximize2 className="w-3 h-3 text-muted-foreground" />}
        </button>
        <button onClick={onClose} className="p-1 hover:bg-muted/50 rounded">
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 bg-black relative" style={{ height: 'calc(100% - 36px)' }}>
        <iframe
          key={refreshKey}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          title={camera.name}
          allow="autoplay"
          loading="lazy"
          style={{ border: 'none' }}
        />
        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between pointer-events-none">
          <span className="text-[8px] font-mono text-white/70 bg-black/60 px-1 rounded">
            {camera.lat.toFixed(4)}°N, {camera.lng.toFixed(4)}°E
          </span>
          <span className="text-[8px] font-mono text-neon-green bg-black/60 px-1 rounded animate-pulse">
            ● LIVE WEBCAM
          </span>
        </div>
      </div>
    </motion.div>
  );
}
