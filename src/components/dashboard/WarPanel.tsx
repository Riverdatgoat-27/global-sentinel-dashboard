import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, MapPin, Clock, Users, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from 'lucide-react';
import type { ActiveConflict } from '@/hooks/useRealTimeNews';

const statusColor: Record<string, string> = {
  active: 'text-neon-red',
  escalating: 'text-neon-amber animate-pulse',
  ceasefire: 'text-neon-green',
  frozen: 'text-muted-foreground',
};

const statusBg: Record<string, string> = {
  active: 'bg-neon-red/10 border-neon-red/30',
  escalating: 'bg-neon-amber/10 border-neon-amber/30',
  ceasefire: 'bg-neon-green/10 border-neon-green/30',
  frozen: 'bg-muted/10 border-border',
};

interface Props {
  conflicts: ActiveConflict[];
  onNavigate?: (lat: number, lng: number) => void;
}

export default function WarPanel({ conflicts, onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Swords className="w-3.5 h-3.5 text-neon-red" />
        Active Conflicts
        <span className="ml-auto flex items-center gap-1">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-neon-red" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <span className="text-[9px] text-neon-red font-mono">{conflicts.length} ACTIVE</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conflicts.map((conflict, i) => (
          <motion.div
            key={conflict.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`border-b border-border ${expandedId === conflict.id ? 'bg-muted/20' : ''}`}
          >
            <div
              className="px-2.5 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === conflict.id ? null : conflict.id)}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${statusColor[conflict.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground truncate">{conflict.name}</span>
                    <span className={`text-[7px] font-mono uppercase px-1 py-0.5 rounded border ${statusBg[conflict.status]} ${statusColor[conflict.status]}`}>
                      {conflict.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{conflict.region}</span>
                    <span>Since {conflict.startYear}</span>
                  </div>
                </div>
                <button
                  className="p-0.5 text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.(conflict.lat, conflict.lng);
                  }}
                >
                  <MapPin className="w-3 h-3 hover:text-primary transition-colors" />
                </button>
                {expandedId === conflict.id ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>

            <AnimatePresence>
              {expandedId === conflict.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-2.5 space-y-1.5">
                    <p className="text-[9px] text-foreground/80 leading-relaxed">{conflict.description}</p>
                    
                    <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                      <Users className="w-2.5 h-2.5" />
                      <span className="font-mono">Parties: {conflict.parties.join(' vs ')}</span>
                    </div>
                    
                    <div className="text-[8px] text-neon-red font-mono">
                      Casualties: {conflict.casualties}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[8px] text-muted-foreground font-mono">RECENT EVENTS:</span>
                      {conflict.recentEvents.map((event, j) => (
                        <div key={j} className="flex items-start gap-1 text-[9px] text-foreground/70">
                          <span className="text-neon-amber">•</span>
                          <span>{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
