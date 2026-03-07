import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Wifi, Clock } from 'lucide-react';

const ThreatStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [threatLevel] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcString = time.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <div className="panel border-b border-border px-4 py-2 flex items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-neon-green" />
        <span className="font-display text-sm tracking-wider glow-text">NEXUS COMMAND</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground">OSINT INTELLIGENCE PLATFORM v3.7.1</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground uppercase tracking-wider">Global Threat Index</span>
          <div className="w-32 h-2 bg-muted rounded-sm overflow-hidden">
            <motion.div
              className="h-full rounded-sm"
              style={{ background: 'linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-amber)), hsl(var(--neon-red)))' }}
              initial={{ width: 0 }}
              animate={{ width: `${threatLevel}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
          <span className="glow-text-red font-display font-bold">{threatLevel}/100</span>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-neon-red threat-pulse" />
          <span className="text-neon-red font-semibold">ELEVATED</span>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3 text-neon-green" />
          <span className="text-neon-green">LIVE</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono tabular-nums">{utcString}</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatStatusBar;
