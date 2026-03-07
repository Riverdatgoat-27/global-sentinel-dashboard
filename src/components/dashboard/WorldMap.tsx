import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { threatEvents, type ThreatEvent } from '@/data/mockData';
import { X, ExternalLink } from 'lucide-react';

const severityColors: Record<string, string> = {
  critical: 'hsl(var(--neon-red))',
  high: 'hsl(var(--neon-amber))',
  medium: 'hsl(var(--neon-cyan))',
  low: 'hsl(var(--neon-green))',
};

const typeIcons: Record<string, string> = {
  cyber: '⚡',
  military: '🎯',
  protest: '📢',
  financial: '💰',
  geopolitical: '🌐',
};

const WorldMap = () => {
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="w-2 h-2 rounded-full bg-neon-green threat-pulse" />
        Global Intelligence Map
        <span className="ml-auto text-muted-foreground text-[10px] font-mono">{threatEvents.length} ACTIVE EVENTS</span>
      </div>
      <div className="flex-1 relative grid-overlay overflow-hidden">
        {/* SVG World Map Outline */}
        <svg viewBox="0 0 100 60" className="w-full h-full absolute inset-0 opacity-20" preserveAspectRatio="xMidYMid meet">
          {/* Simplified continent outlines */}
          {/* North America */}
          <path d="M10,15 Q12,12 18,12 Q22,10 25,14 Q27,16 25,22 Q24,28 22,32 Q20,36 18,38 Q15,35 12,32 Q10,28 8,24 Q7,20 10,15Z" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="0.3" />
          {/* South America */}
          <path d="M22,38 Q25,36 28,38 Q30,42 30,46 Q28,50 26,54 Q24,56 22,54 Q20,50 20,46 Q20,42 22,38Z" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="0.3" />
          {/* Europe */}
          <path d="M45,14 Q48,12 52,14 Q54,16 55,18 Q53,22 50,24 Q48,22 46,20 Q44,18 45,14Z" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="0.3" />
          {/* Africa */}
          <path d="M48,26 Q52,24 55,26 Q58,30 58,36 Q56,42 54,46 Q52,48 50,46 Q48,42 46,38 Q46,32 48,26Z" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="0.3" />
          {/* Asia */}
          <path d="M58,12 Q65,10 72,12 Q78,14 82,16 Q85,20 84,26 Q80,30 76,32 Q72,30 68,28 Q64,26 60,24 Q58,20 58,12Z" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="0.3" />
          {/* Australia */}
          <path d="M78,44 Q82,42 86,44 Q88,46 86,50 Q84,52 80,50 Q78,48 78,44Z" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="0.3" />
          {/* Grid lines */}
          {[0,10,20,30,40,50,60].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--neon-green))" strokeWidth="0.05" opacity="0.3" />
          ))}
          {[0,10,20,30,40,50,60,70,80,90,100].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="60" stroke="hsl(var(--neon-green))" strokeWidth="0.05" opacity="0.3" />
          ))}
        </svg>

        {/* Event Markers */}
        {threatEvents.map((event) => (
          <motion.button
            key={event.id}
            className="absolute z-10"
            style={{
              left: `${event.coordinates.x}%`,
              top: `${event.coordinates.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => setSelectedEvent(event)}
            whileHover={{ scale: 1.5 }}
          >
            {/* Pulse rings */}
            <span
              className="absolute w-6 h-6 rounded-full -inset-1"
              style={{
                background: severityColors[event.severity],
                opacity: 0.15,
                animation: 'pulse-ring 2s ease-out infinite',
              }}
            />
            <span
              className="absolute w-4 h-4 rounded-full -inset-0"
              style={{
                background: severityColors[event.severity],
                opacity: 0.3,
                animation: 'pulse-ring 2s ease-out 0.5s infinite',
              }}
            />
            {/* Core dot */}
            <span
              className="relative block w-2.5 h-2.5 rounded-full"
              style={{
                background: severityColors[event.severity],
                boxShadow: `0 0 8px ${severityColors[event.severity]}, 0 0 16px ${severityColors[event.severity]}`,
              }}
            />
          </motion.button>
        ))}

        {/* Event Detail Panel */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-2 right-2 w-72 panel glow-border z-20"
            >
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[selectedEvent.type]}</span>
                    <span
                      className="text-[10px] font-display uppercase px-2 py-0.5 rounded-sm"
                      style={{
                        background: `${severityColors[selectedEvent.severity]}20`,
                        color: severityColors[selectedEvent.severity],
                        border: `1px solid ${severityColors[selectedEvent.severity]}40`,
                      }}
                    >
                      {selectedEvent.severity}
                    </span>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{selectedEvent.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>📍 {selectedEvent.location}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{new Date(selectedEvent.timestamp).toLocaleTimeString()}</span>
                  <span className="flex items-center gap-1 text-neon-cyan">
                    <ExternalLink className="w-2.5 h-2.5" />
                    {selectedEvent.source}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorldMap;
