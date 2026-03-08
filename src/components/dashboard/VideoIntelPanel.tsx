import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Play, MapPin, Clock, X, ExternalLink, Globe } from 'lucide-react';
import { videoIntel } from '@/data/mockData';
import type { GlobeEvent } from '@/types/intelligence';

const categoryColor: Record<string, string> = {
  military: 'text-neon-red',
  protest: 'text-neon-amber',
  disaster: 'text-neon-amber',
  cyber: 'text-neon-cyan',
  geopolitical: 'text-neon-blue',
};

interface Props {
  gdeltEvents?: GlobeEvent[];
}

export default function VideoIntelPanel({ gdeltEvents = [] }: Props) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Build combined list: static video intel + GDELT events with media
  const allItems = [
    ...videoIntel.map(vid => ({
      id: vid.id,
      title: vid.title,
      category: vid.category,
      location: vid.location,
      timestamp: vid.timestamp,
      source: vid.source,
      embedUrl: vid.embedUrl || '',
      videoUrl: vid.videoUrl || '',
      mediaUrl: (vid as any).metadata?.url || '',
      imageUrl: (vid as any).metadata?.image || '',
    })),
    ...gdeltEvents.filter(e => e.metadata?.url).slice(0, 10).map(e => ({
      id: e.id,
      title: e.title,
      category: e.type === 'military' ? 'military' as const : e.type === 'protest' ? 'protest' as const : 'geopolitical' as const,
      location: e.metadata?.place || `${e.lat.toFixed(1)}, ${e.lng.toFixed(1)}`,
      timestamp: e.timestamp,
      source: e.source,
      embedUrl: '',
      videoUrl: '',
      mediaUrl: e.metadata?.url || '',
      imageUrl: e.metadata?.image || '',
    })),
  ];

  const activeItem = allItems.find(v => v.id === selectedItem);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Video className="w-3.5 h-3.5 text-neon-amber" />
        Social Media Intel
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {allItems.length} ITEMS
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Item list */}
        <div className={`${selectedItem ? 'w-44' : 'w-full'} shrink-0 overflow-y-auto border-r border-border transition-all`}>
          {allItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              className={`px-2.5 py-2 border-b border-border cursor-pointer transition-colors ${
                selectedItem === item.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-7 h-5 bg-muted rounded flex items-center justify-center shrink-0 mt-0.5">
                  {item.id.startsWith('gdelt') ? (
                    <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                  ) : (
                    <Play className="w-2.5 h-2.5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`text-[8px] font-mono tracking-wider uppercase ${categoryColor[item.category] || 'text-muted-foreground'}`}>
                    {item.category}
                  </span>
                  <p className="text-[10px] text-foreground leading-snug truncate">{item.title}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground">
                    <span className="truncate">{item.source}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail viewer */}
        <AnimatePresence>
          {selectedItem && activeItem && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex flex-col min-w-0 bg-background"
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[8px] font-mono tracking-wider uppercase ${categoryColor[activeItem.category]}`}>
                    {activeItem.category}
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate">{activeItem.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {activeItem.mediaUrl && (
                    <a
                      href={activeItem.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-black/50">
                {activeItem.embedUrl ? (
                  <iframe
                    src={activeItem.embedUrl}
                    className="absolute inset-0 w-full h-full"
                    title={activeItem.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : activeItem.mediaUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                    {activeItem.imageUrl && (
                      <img 
                        src={activeItem.imageUrl} 
                        alt={activeItem.title}
                        className="max-h-[60%] max-w-full object-contain rounded mb-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <p className="text-[10px] text-foreground text-center leading-snug mb-2 line-clamp-3">{activeItem.title}</p>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{activeItem.location}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{new Date(activeItem.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <a
                      href={activeItem.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-[10px] text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Read full article
                    </a>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">
                    <div className="text-center">
                      <Video className="w-6 h-6 mx-auto mb-1 opacity-30" />
                      <p>No media available</p>
                      <p className="text-[9px] mt-0.5">Source: {activeItem.source}</p>
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
