import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Maximize2, Minimize2, MapPin } from 'lucide-react';
import type { CCTVCamera } from '@/types/intelligence';

interface Props {
  camera: CCTVCamera;
  onClose: () => void;
}

export default function CCTVViewer({ camera, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);
  // camera.url now stores YouTube embed IDs directly
  const embedId = camera.url;

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
      {/* Header */}
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
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted/50 rounded transition-colors">
          {expanded ? <Minimize2 className="w-3 h-3 text-muted-foreground" /> : <Maximize2 className="w-3 h-3 text-muted-foreground" />}
        </button>
        <button onClick={onClose} className="p-1 hover:bg-muted/50 rounded transition-colors">
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Video */}
      <div className="flex-1 bg-black relative" style={{ height: 'calc(100% - 36px)' }}>
        {embedId ? (
          <iframe
            src={`https://www.youtube.com/embed/${embedId}?autoplay=1&mute=1&controls=1&modestbranding=1&playsinline=1`}
            className="absolute inset-0 w-full h-full"
            title={camera.name}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground font-mono">FEED CONNECTING...</p>
              <p className="text-[8px] text-muted-foreground/50 mt-1">{camera.location}</p>
              <p className="text-[8px] text-primary/50 mt-0.5">{camera.lat.toFixed(4)}°N, {camera.lng.toFixed(4)}°E</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
