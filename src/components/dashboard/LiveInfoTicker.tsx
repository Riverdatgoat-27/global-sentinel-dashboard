import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plane, Radio, Globe } from 'lucide-react';

interface TickerItem {
  id: string;
  type: 'war' | 'flight' | 'alert' | 'news';
  text: string;
  severity?: 'critical' | 'high' | 'medium';
  timestamp: number;
}

interface Props {
  aircraft: { callsign: string | null; originCountry: string; altitude: number | null; velocity: number | null }[];
  alerts: { id: string; title: string; severity: string; acknowledged: boolean }[];
  gdeltEvents: { title: string; type: string; source: string }[];
}

const WAR_ZONES = [
  { name: 'Ukraine-Russia Conflict', region: 'Eastern Europe', status: 'ACTIVE', since: '2022' },
  { name: 'Israel-Hamas War', region: 'Middle East', status: 'ACTIVE', since: '2023' },
  { name: 'Iran-US Tensions', region: 'Middle East', status: 'ESCALATING', since: '2026' },
  { name: 'Sudan Civil War', region: 'East Africa', status: 'ACTIVE', since: '2023' },
  { name: 'Myanmar Civil War', region: 'Southeast Asia', status: 'ACTIVE', since: '2021' },
];

export default function LiveInfoTicker({ aircraft, alerts, gdeltEvents }: Props) {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build ticker items from live data
  useEffect(() => {
    const items: TickerItem[] = [];

    // Active wars
    WAR_ZONES.forEach((war, i) => {
      items.push({
        id: `war-${i}`,
        type: 'war',
        text: `⚔️ ${war.name} — ${war.region} — Status: ${war.status} (since ${war.since})`,
        severity: war.status === 'ESCALATING' ? 'critical' : 'high',
        timestamp: Date.now(),
      });
    });

    // Critical alerts
    alerts.filter(a => !a.acknowledged && (a.severity === 'critical' || a.severity === 'high')).forEach(a => {
      items.push({
        id: `alert-${a.id}`,
        type: 'alert',
        text: `🚨 ${a.title}`,
        severity: a.severity as any,
        timestamp: Date.now(),
      });
    });

    // Active flights
    const militaryFlights = aircraft.filter(a => 
      a.callsign && (a.callsign.startsWith('RCH') || a.callsign.startsWith('RRR') || a.callsign.startsWith('CFC') || a.callsign.startsWith('SAM'))
    );
    if (militaryFlights.length > 0) {
      items.push({
        id: 'mil-flights',
        type: 'flight',
        text: `✈️ ${militaryFlights.length} military aircraft tracked — ${militaryFlights.map(f => f.callsign).join(', ')}`,
        severity: 'medium',
        timestamp: Date.now(),
      });
    }

    items.push({
      id: 'total-aircraft',
      type: 'flight',
      text: `✈️ Tracking ${aircraft.length} aircraft globally — ${aircraft.filter(a => a.altitude && a.altitude > 10000).length} at cruise altitude`,
      timestamp: Date.now(),
    });

    // GDELT news
    gdeltEvents.filter(e => e.type === 'military' || e.type === 'cyber').slice(0, 3).forEach((e, i) => {
      items.push({
        id: `gdelt-${i}`,
        type: 'news',
        text: `📰 ${e.title} — Source: ${e.source}`,
        timestamp: Date.now(),
      });
    });

    setTickerItems(items);
  }, [aircraft, alerts, gdeltEvents]);

  // Rotate through items
  useEffect(() => {
    if (tickerItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % tickerItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  if (tickerItems.length === 0) return null;

  const current = tickerItems[currentIndex];
  const getIcon = () => {
    switch (current?.type) {
      case 'war': return <AlertTriangle className="w-3 h-3 text-neon-red" />;
      case 'flight': return <Plane className="w-3 h-3 text-neon-cyan" />;
      case 'alert': return <Radio className="w-3 h-3 text-neon-amber" />;
      case 'news': return <Globe className="w-3 h-3 text-primary" />;
      default: return <Globe className="w-3 h-3 text-primary" />;
    }
  };

  const getSeverityColor = () => {
    switch (current?.severity) {
      case 'critical': return 'border-neon-red/30 bg-neon-red/5';
      case 'high': return 'border-neon-amber/30 bg-neon-amber/5';
      default: return 'border-border/50 bg-card/50';
    }
  };

  return (
    <div className={`absolute top-10 left-2 right-2 z-10 border rounded px-2 py-1 backdrop-blur-sm ${getSeverityColor()}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-neon-red"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <span className="text-[7px] font-mono text-neon-red uppercase tracking-wider">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5"
            >
              {getIcon()}
              <span className="text-[9px] font-mono text-foreground truncate">{current?.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="text-[7px] font-mono text-muted-foreground shrink-0">
          {currentIndex + 1}/{tickerItems.length}
        </span>
      </div>
    </div>
  );
}
