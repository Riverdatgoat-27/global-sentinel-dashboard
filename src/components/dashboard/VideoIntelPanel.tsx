import { motion } from 'framer-motion';
import { Video, Play, MapPin, Clock } from 'lucide-react';
import { videoIntel } from '@/data/mockData';

const categoryColor: Record<string, string> = {
  military: 'text-neon-red',
  protest: 'text-neon-amber',
  disaster: 'text-neon-amber',
  cyber: 'text-neon-cyan',
  geopolitical: 'text-neon-blue',
};

export default function VideoIntelPanel() {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Video className="w-3.5 h-3.5 text-neon-amber" />
        Video Intel
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {videoIntel.length} CLIPS
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {videoIntel.map((vid, i) => (
          <motion.div
            key={vid.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="px-2.5 py-2 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-6 bg-muted rounded-sm flex items-center justify-center shrink-0 mt-0.5">
                <Play className="w-3 h-3 text-neon-red" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[8px] font-display tracking-wider uppercase ${categoryColor[vid.category] || 'text-muted-foreground'}`}>
                    {vid.category}
                  </span>
                </div>
                <p className="text-[10px] text-foreground leading-snug truncate">{vid.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate">{vid.location}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(vid.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="text-[8px] text-muted-foreground mt-0.5">
                  SRC: {vid.source}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
