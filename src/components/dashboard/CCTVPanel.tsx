import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

// Real public camera YouTube live streams embeddable
const liveCameras = [
  { id: 'cam-1', name: 'Times Square NYC', location: 'New York, USA', embedId: 'AdUw5RdyZxI', type: 'city' as const },
  { id: 'cam-2', name: 'Jackson Hole', location: 'Wyoming, USA', embedId: 'DoGXOP1FMbE', type: 'city' as const },
  { id: 'cam-3', name: 'Venice Beach', location: 'Los Angeles, USA', embedId: 'ZIvLTIBbpLQ', type: 'city' as const },
  { id: 'cam-4', name: 'Miami Beach', location: 'Florida, USA', embedId: '2DC9xXSIDhI', type: 'city' as const },
  { id: 'cam-5', name: 'Dublin City', location: 'Dublin, Ireland', embedId: 'Y87VCkoqNKU', type: 'city' as const },
  { id: 'cam-6', name: 'ISS Earth View', location: 'Low Earth Orbit', embedId: 'xRPTBhmcyXY', type: 'weather' as const },
  { id: 'cam-7', name: 'Tokyo Skyline', location: 'Tokyo, Japan', embedId: 'DjYZk8nrXVY', type: 'city' as const },
  { id: 'cam-8', name: 'Port of LA', location: 'Los Angeles, USA', embedId: '1NdFfMLRGNw', type: 'port' as const },
];

export default function CCTVPanel() {
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const activeCam = liveCameras.find(c => c.id === selectedCam);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Camera className="w-3.5 h-3.5 text-neon-cyan" />
        Public CCTV
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {liveCameras.length} LIVE FEEDS
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Camera list */}
        <div className={`${selectedCam ? 'w-36' : 'w-full'} shrink-0 overflow-y-auto border-r border-border transition-all`}>
          {liveCameras.map((cam, i) => (
            <motion.div
              key={cam.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedCam(selectedCam === cam.id ? null : cam.id)}
              className={`px-2.5 py-2 border-b border-border cursor-pointer transition-colors ${
                selectedCam === cam.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCam === cam.id ? 'bg-neon-green animate-pulse' : 'bg-neon-green/40'}`} />
                <span className="text-[10px] font-medium text-foreground truncate">{cam.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground ml-3.5">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate">{cam.location}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Embedded stream viewer */}
        <AnimatePresence>
          {selectedCam && activeCam && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex flex-col min-w-0 bg-background"
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-[10px] font-medium text-foreground truncate">{activeCam.name}</span>
                  <span className="text-[8px] text-neon-green uppercase font-mono">LIVE</span>
                </div>
                <button
                  onClick={() => setSelectedCam(null)}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 relative bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeCam.embedId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1`}
                  className="absolute inset-0 w-full h-full"
                  title={activeCam.name}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
