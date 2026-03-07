import { motion } from 'framer-motion';
import { Layers, Radar, Plane, Ship, Satellite, Shield, Mountain, Swords } from 'lucide-react';
import type { LayerVisibility } from '@/types/intelligence';

interface Props {
  layers: LayerVisibility;
  onToggle: (layer: keyof LayerVisibility) => void;
  counts: Record<string, number>;
}

const layerConfig: { key: keyof LayerVisibility; label: string; icon: typeof Radar; color: string }[] = [
  { key: 'earthquakes', label: 'SEISMIC', icon: Mountain, color: 'text-neon-amber' },
  { key: 'cyberAttacks', label: 'CYBER', icon: Shield, color: 'text-neon-red' },
  { key: 'military', label: 'MILITARY', icon: Swords, color: 'text-neon-red' },
  { key: 'aircraft', label: 'AIRCRAFT', icon: Plane, color: 'text-neon-cyan' },
  { key: 'satellites', label: 'SATELLITES', icon: Satellite, color: 'text-neon-blue' },
  { key: 'ships', label: 'MARITIME', icon: Ship, color: 'text-neon-green' },
];

export default function LayerControls({ layers, onToggle, counts }: Props) {
  return (
    <div className="absolute top-12 left-2 z-10 panel glow-border w-36">
      <div className="panel-header text-[9px]">
        <Layers className="w-3 h-3 text-neon-green" />
        Layers
      </div>
      <div className="p-1.5 space-y-0.5">
        {layerConfig.map(({ key, label, icon: Icon, color }) => (
          <motion.button
            key={key}
            onClick={() => onToggle(key)}
            className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded-sm text-[9px] transition-colors ${
              layers[key] ? 'bg-muted/50' : 'opacity-40'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <Icon className={`w-3 h-3 ${layers[key] ? color : 'text-muted-foreground'}`} />
            <span className={`font-display tracking-wider ${layers[key] ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
            <span className="ml-auto text-muted-foreground font-mono text-[8px]">
              {counts[key] || 0}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
