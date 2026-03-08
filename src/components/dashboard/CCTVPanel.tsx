import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, X, Maximize2, Minimize2 } from 'lucide-react';
import { cctvCameras } from '@/data/mockData';

export default function CCTVPanel() {
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const activeCam = cctvCameras.find(c => c.id === selectedCam);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Camera className="w-3.5 h-3.5 text-neon-cyan" />
        Public CCTV
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {cctvCameras.length} FEEDS
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Camera list */}
        <div className={`${selectedCam ? 'w-36' : 'w-full'} shrink-0 overflow-y-auto border-r border-border transition-all`}>
          {cctvCameras.map((cam, i) => (
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
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCam === cam.id ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
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
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-red threat-pulse" />
                  <span className="text-[10px] font-medium text-foreground truncate">{activeCam.name}</span>
                  <span className="text-[8px] text-muted-foreground uppercase">{activeCam.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => setSelectedCam(null)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-black">
                {activeCam.url ? (
                  <iframe
                    src={activeCam.url}
                    className="absolute inset-0 w-full h-full"
                    title={activeCam.name}
                    allow="autoplay; encrypted-media"
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">
                    <div className="text-center">
                      <Camera className="w-6 h-6 mx-auto mb-1 opacity-30" />
                      <p>Feed unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
