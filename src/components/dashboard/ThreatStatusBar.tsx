import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Wifi, Clock, Radio } from 'lucide-react';

const ThreatStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [threatLevel] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcString = time.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <div className="panel border-b border-border px-4 py-1.5 flex items-center justify-between gap-4 text-xs shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-neon-green" />
        <span className="font-display text-sm tracking-wider glow-text">NEXUS COMMAND</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground text-[10px]">OSINT INTELLIGENCE v4.0</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">THREAT INDEX</span>
          <div className="w-24 h-1.5 bg-muted rounded-sm overflow-hidden">
            <motion.div
              className="h-full rounded-sm"
              style={{ background: 'linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-amber)), hsl(var(--neon-red)))' }}
              initial={{ width: 0 }}
              animate={{ width: `${threatLevel}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
          <span className="glow-text-red font-display font-bold text-[11px]">{threatLevel}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-neon-red threat-pulse" />
          <span className="text-neon-red font-semibold text-[10px]">ELEVATED</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-neon-green threat-pulse" />
          <span className="text-neon-green text-[10px]">LIVE</span>
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
