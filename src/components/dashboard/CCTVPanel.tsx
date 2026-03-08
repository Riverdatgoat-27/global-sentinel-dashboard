import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ExternalLink, MapPin } from 'lucide-react';
import { cctvCameras } from '@/data/mockData';

export default function CCTVPanel() {
  const [selectedCam, setSelectedCam] = useState<string | null>(null);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Camera className="w-3.5 h-3.5 text-neon-cyan" />
        Public CCTV
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {cctvCameras.length} FEEDS
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {cctvCameras.map((cam, i) => (
          <motion.div
            key={cam.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelectedCam(selectedCam === cam.id ? null : cam.id)}
            className={`px-2.5 py-2 border-b border-border cursor-pointer transition-colors ${
              selectedCam === cam.id ? 'bg-muted/40' : 'hover:bg-muted/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Camera className="w-3 h-3 text-neon-cyan shrink-0" />
                <span className="text-[10px] font-semibold text-foreground truncate">{cam.name}</span>
              </div>
              <span className="text-[8px] text-muted-foreground uppercase shrink-0">{cam.type}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate">{cam.location}</span>
            </div>
            {selectedCam === cam.id && cam.url && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2"
              >
                <a
                  href={cam.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[9px] text-neon-green hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Live Stream
                </a>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
