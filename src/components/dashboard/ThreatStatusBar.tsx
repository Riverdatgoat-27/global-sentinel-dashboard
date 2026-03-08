import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Activity } from 'lucide-react';

const ThreatStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [threatLevel] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcString = time.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-4 text-xs shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-primary" />
        <span className="font-display text-sm tracking-wide text-foreground">NEXUS COMMAND</span>
        <span className="text-muted-foreground text-[10px] font-mono">v4.0</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-mono">THREAT</span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-amber)), hsl(var(--neon-red)))' }}
              initial={{ width: 0 }}
              animate={{ width: `${threatLevel}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
          <span className="text-neon-red font-mono font-semibold text-[11px]">{threatLevel}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-neon-red threat-pulse" />
          <span className="text-neon-red font-medium text-[10px]">ELEVATED</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-neon-green" />
          <span className="text-neon-green text-[10px] font-mono">LIVE</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono tabular-nums text-[10px]">{utcString}</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatStatusBar;
