import { motion } from 'framer-motion';
import { Shield, CircleDot } from 'lucide-react';
import type { CyberThreat } from '@/types/intelligence';

const severityBg: Record<string, string> = {
  critical: 'bg-neon-red/10 border-neon-red/30 text-neon-red',
  high: 'bg-neon-amber/10 border-neon-amber/30 text-neon-amber',
  medium: 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan',
  low: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
};

const statusColor: Record<string, string> = {
  active: 'text-neon-red',
  investigating: 'text-neon-amber',
  mitigated: 'text-neon-green',
};

interface Props {
  threats: CyberThreat[];
}

const CyberAttackMonitor = ({ threats }: Props) => {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Shield className="w-3.5 h-3.5 text-neon-red" />
        Cyber Threat Monitor
        <span className="ml-auto text-[9px] text-neon-red font-mono threat-pulse">
          {threats.filter(a => a.status === 'active').length} ACTIVE
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threats.map((attack, i) => (
          <motion.div
            key={attack.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="px-2.5 py-2 border-b border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-semibold text-foreground truncate">{attack.target}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-sm border ${severityBg[attack.severity]}`}>
                {attack.severity.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <span className="font-display tracking-wider">{attack.attackType}</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px]">
              <div className="flex items-center gap-1">
                <CircleDot className={`w-2.5 h-2.5 ${statusColor[attack.status]}`} />
                <span className={statusColor[attack.status]}>{attack.status.toUpperCase()}</span>
              </div>
              <span className="text-muted-foreground">{attack.source}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CyberAttackMonitor;
