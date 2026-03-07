import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Target, Megaphone, Mountain, Globe } from 'lucide-react';
import type { GlobeEvent, CyberThreat } from '@/types/intelligence';

const typeConfig: Record<string, { icon: typeof Zap; label: string }> = {
  earthquake: { icon: Mountain, label: 'SEISMIC' },
  cyber: { icon: Zap, label: 'CYBER' },
  military: { icon: Target, label: 'MILITARY' },
  protest: { icon: Megaphone, label: 'PROTEST' },
  financial: { icon: Globe, label: 'FINANCIAL' },
};

const severityClass: Record<string, string> = {
  critical: 'text-neon-red glow-text-red',
  high: 'text-neon-amber glow-text-amber',
  medium: 'text-neon-cyan glow-text-cyan',
  low: 'text-neon-green glow-text',
};

interface Props {
  events: GlobeEvent[];
  cyberThreats: CyberThreat[];
}

const EventFeed = ({ events, cyberThreats }: Props) => {
  const allEvents = [
    ...events.map(e => ({
      id: e.id,
      type: e.type,
      title: e.title,
      severity: e.severity,
      location: e.metadata?.place || `${e.lat.toFixed(1)}, ${e.lng.toFixed(1)}`,
      timestamp: e.timestamp,
      source: e.source,
    })),
    ...cyberThreats.map(t => ({
      id: t.id,
      type: 'cyber' as const,
      title: `${t.attackType} - ${t.target}`,
      severity: t.severity,
      location: t.target,
      timestamp: t.timestamp,
      source: t.source,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <AlertTriangle className="w-3.5 h-3.5 text-neon-amber" />
        Live Intel Feed
        <span className="ml-auto w-2 h-2 rounded-full bg-neon-red threat-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {allEvents.length === 0 ? (
          <div className="p-3 text-[10px] text-muted-foreground">Loading intelligence data...</div>
        ) : (
          allEvents.slice(0, 25).map((event, i) => {
            const config = typeConfig[event.type] || typeConfig.cyber;
            const Icon = config.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-2.5 py-2 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[8px] font-display tracking-wider text-muted-foreground">{config.label}</span>
                      <span className={`text-[8px] font-display uppercase ${severityClass[event.severity]}`}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground leading-snug truncate">{event.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-muted-foreground">
                      <span className="truncate">{event.location}</span>
                      <span>•</span>
                      <span className="shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventFeed;
