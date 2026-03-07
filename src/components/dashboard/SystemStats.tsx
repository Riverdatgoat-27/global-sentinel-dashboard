import { motion } from 'framer-motion';
import { Activity, Database, Cpu, Eye } from 'lucide-react';

const stats = [
  { icon: Activity, label: 'DATA STREAMS', value: '2,847', color: 'text-neon-green' },
  { icon: Database, label: 'SOURCES ACTIVE', value: '143', color: 'text-neon-cyan' },
  { icon: Cpu, label: 'PROCESSING', value: '98.2%', color: 'text-neon-amber' },
  { icon: Eye, label: 'FEEDS MONITORED', value: '12,403', color: 'text-neon-green' },
];

const SystemStats = () => {
  return (
    <div className="panel h-full">
      <div className="panel-header">
        <Cpu className="w-3.5 h-3.5 text-neon-green" />
        System Status
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className="bg-card p-3 flex flex-col items-center justify-center text-center"
          >
            <stat.icon className={`w-4 h-4 mb-1 ${stat.color}`} />
            <span className={`text-lg font-display font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-[8px] text-muted-foreground tracking-widest mt-0.5">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SystemStats;
