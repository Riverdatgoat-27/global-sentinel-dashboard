import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Play, MapPin, Clock, X, ExternalLink } from 'lucide-react';
import { videoIntel } from '@/data/mockData';

const categoryColor: Record<string, string> = {
  military: 'text-neon-red',
  protest: 'text-neon-amber',
  disaster: 'text-neon-amber',
  cyber: 'text-neon-cyan',
  geopolitical: 'text-neon-blue',
};

export default function VideoIntelPanel() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const activeVid = videoIntel.find(v => v.id === selectedVideo);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Video className="w-3.5 h-3.5 text-neon-amber" />
        Social Media Intel
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {videoIntel.length} CLIPS
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Video list */}
        <div className={`${selectedVideo ? 'w-44' : 'w-full'} shrink-0 overflow-y-auto border-r border-border transition-all`}>
          {videoIntel.map((vid, i) => (
            <motion.div
              key={vid.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedVideo(selectedVideo === vid.id ? null : vid.id)}
              className={`px-2.5 py-2 border-b border-border cursor-pointer transition-colors ${
                selectedVideo === vid.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-6 bg-muted rounded flex items-center justify-center shrink-0 mt-0.5">
                  <Play className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[8px] font-mono tracking-wider uppercase ${categoryColor[vid.category] || 'text-muted-foreground'}`}>
                      {vid.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground leading-snug truncate">{vid.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{vid.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Embedded video viewer */}
        <AnimatePresence>
          {selectedVideo && activeVid && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex flex-col min-w-0 bg-background"
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[8px] font-mono tracking-wider uppercase ${categoryColor[activeVid.category]}`}>
                    {activeVid.category}
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate">{activeVid.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {activeVid.videoUrl && (
                    <a
                      href={activeVid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-black">
                {activeVid.embedUrl ? (
                  <iframe
                    src={activeVid.embedUrl}
                    className="absolute inset-0 w-full h-full"
                    title={activeVid.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">
                    <div className="text-center">
                      <Video className="w-6 h-6 mx-auto mb-1 opacity-30" />
                      <p>No embed available</p>
                      <p className="text-[9px] mt-0.5">Source: {activeVid.source}</p>
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
