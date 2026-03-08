import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Rocket, Shield, Zap, Check } from 'lucide-react';
import type { AlertNotification } from '@/types/intelligence';

interface Props {
  alerts: AlertNotification[];
  onAcknowledge: (id: string) => void;
}

const typeConfig: Record<string, { icon: typeof Zap; color: string }> = {
  cyber: { icon: Shield, color: 'text-neon-cyan' },
  missile: { icon: Rocket, color: 'text-neon-red' },
  military: { icon: AlertTriangle, color: 'text-neon-amber' },
  disaster: { icon: Zap, color: 'text-neon-amber' },
  market: { icon: Zap, color: 'text-neon-green' },
};

export default function AlertPanel({ alerts, onAcknowledge }: Props) {
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const criticalCount = unacknowledged.filter(a => a.severity === 'critical').length;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Bell className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'text-neon-red threat-pulse' : 'text-neon-amber'}`} />
        Alerts
        {criticalCount > 0 && (
          <span className="ml-1 text-[9px] text-neon-red font-mono threat-pulse">
            {criticalCount} CRITICAL
          </span>
        )}
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {unacknowledged.length} ACTIVE
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {alerts.slice(0, 15).map((alert, i) => {
            const config = typeConfig[alert.type] || typeConfig.military;
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: alert.acknowledged ? 0.4 : 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`px-2.5 py-2 border-b border-border transition-colors ${
                  !alert.acknowledged ? 'hover:bg-muted/30' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${alert.acknowledged ? 'text-muted-foreground' : config.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-display tracking-wider uppercase ${
                        alert.severity === 'critical' && !alert.acknowledged ? 'text-neon-red glow-text-red' : 'text-muted-foreground'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-foreground leading-snug">{alert.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{alert.description}</p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="shrink-0 p-1 text-muted-foreground hover:text-neon-green transition-colors"
                      title="Acknowledge"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
