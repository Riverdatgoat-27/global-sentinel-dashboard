import { motion } from 'framer-motion';
import { threatEvents } from '@/data/mockData';
import { AlertTriangle, Zap, Target, Megaphone, DollarSign, Globe } from 'lucide-react';

const typeConfig: Record<string, { icon: typeof Zap; label: string }> = {
  cyber: { icon: Zap, label: 'CYBER' },
  military: { icon: Target, label: 'MILITARY' },
  protest: { icon: Megaphone, label: 'PROTEST' },
  financial: { icon: DollarSign, label: 'FINANCIAL' },
  geopolitical: { icon: Globe, label: 'GEOPOLITICAL' },
};

const severityClass: Record<string, string> = {
  critical: 'text-neon-red glow-text-red',
  high: 'text-neon-amber glow-text-amber',
  medium: 'text-neon-cyan glow-text-cyan',
  low: 'text-neon-green glow-text',
};

const EventFeed = () => {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <AlertTriangle className="w-3.5 h-3.5 text-neon-amber" />
        Live Event Feed
        <span className="ml-auto w-2 h-2 rounded-full bg-neon-red threat-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {threatEvents.map((event, i) => {
          const config = typeConfig[event.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="px-3 py-2.5 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-display tracking-wider text-muted-foreground">{config.label}</span>
                    <span className={`text-[9px] font-display uppercase ${severityClass[event.severity]}`}>
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-snug truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{event.location}</span>
                    <span>•</span>
                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EventFeed;
