import { useState } from 'react';
import { motion } from 'framer-motion';
import { Atom, ChevronDown, ChevronUp, Factory, Shield } from 'lucide-react';

interface NuclearArsenal {
  country: string;
  flag: string;
  totalWarheads: number;
  deployed: number;
  reserve: number;
  retired: number;
  icbms: number;
  slbms: number;
  bombers: number;
  tactical: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  natoMember: boolean;
  lastTest: string;
  treaty: string;
}

const NUCLEAR_DATA: NuclearArsenal[] = [
  { country: 'Russia', flag: '🇷🇺', totalWarheads: 5889, deployed: 1674, reserve: 2815, retired: 1400, icbms: 310, slbms: 160, bombers: 66, tactical: 1912, trend: 'stable', natoMember: false, lastTest: '1990', treaty: 'New START (expiring)' },
  { country: 'United States', flag: '🇺🇸', totalWarheads: 5244, deployed: 1670, reserve: 1938, retired: 1636, icbms: 400, slbms: 280, bombers: 66, tactical: 200, trend: 'stable', natoMember: true, lastTest: '1992', treaty: 'New START' },
  { country: 'China', flag: '🇨🇳', totalWarheads: 500, deployed: 350, reserve: 150, retired: 0, icbms: 130, slbms: 72, bombers: 20, tactical: 0, trend: 'increasing', natoMember: false, lastTest: '1996', treaty: 'None' },
  { country: 'France', flag: '🇫🇷', totalWarheads: 290, deployed: 280, reserve: 10, retired: 0, icbms: 0, slbms: 64, bombers: 40, tactical: 0, trend: 'stable', natoMember: true, lastTest: '1996', treaty: 'CTBT' },
  { country: 'United Kingdom', flag: '🇬🇧', totalWarheads: 225, deployed: 120, reserve: 105, retired: 0, icbms: 0, slbms: 48, bombers: 0, tactical: 0, trend: 'stable', natoMember: true, lastTest: '1991', treaty: 'NPT' },
  { country: 'Pakistan', flag: '🇵🇰', totalWarheads: 170, deployed: 0, reserve: 170, retired: 0, icbms: 0, slbms: 0, bombers: 36, tactical: 24, trend: 'increasing', natoMember: false, lastTest: '1998', treaty: 'None' },
  { country: 'India', flag: '🇮🇳', totalWarheads: 172, deployed: 0, reserve: 172, retired: 0, icbms: 12, slbms: 8, bombers: 48, tactical: 0, trend: 'increasing', natoMember: false, lastTest: '1998', treaty: 'None' },
  { country: 'Israel', flag: '🇮🇱', totalWarheads: 90, deployed: 0, reserve: 90, retired: 0, icbms: 24, slbms: 0, bombers: 12, tactical: 0, trend: 'stable', natoMember: false, lastTest: 'Undisclosed', treaty: 'Undeclared' },
  { country: 'North Korea', flag: '🇰🇵', totalWarheads: 50, deployed: 0, reserve: 50, retired: 0, icbms: 6, slbms: 2, bombers: 0, tactical: 10, trend: 'increasing', natoMember: false, lastTest: '2017', treaty: 'Withdrew NPT' },
];

const trendColor = { increasing: 'text-neon-red', decreasing: 'text-neon-green', stable: 'text-muted-foreground' };
const trendIcon = { increasing: '▲', decreasing: '▼', stable: '—' };

export default function NuclearPanel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const totalGlobal = NUCLEAR_DATA.reduce((s, c) => s + c.totalWarheads, 0);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Atom className="w-3.5 h-3.5 text-neon-amber" />
        Nuclear Arsenal
        <span className="ml-auto text-[8px] text-neon-red font-mono">{totalGlobal.toLocaleString()} WARHEADS</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {NUCLEAR_DATA.map((c, i) => (
          <motion.div key={c.country} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`border-b border-border ${expanded === c.country ? 'bg-muted/20' : ''}`}>
            <div className="px-2.5 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(expanded === c.country ? null : c.country)}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-foreground">{c.country}</span>
                    {c.natoMember && <span className="text-[7px] font-mono text-neon-cyan px-1 rounded bg-neon-cyan/10 border border-neon-cyan/20">NATO</span>}
                    <span className={`text-[8px] font-mono ${trendColor[c.trend]}`}>{trendIcon[c.trend]}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-red/70 rounded-full" style={{ width: `${(c.totalWarheads / NUCLEAR_DATA[0].totalWarheads) * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-neon-red font-semibold">{c.totalWarheads.toLocaleString()}</span>
                  </div>
                </div>
                {expanded === c.country ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
            {expanded === c.country && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-3 pb-2 space-y-1">
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[8px] font-mono">
                  <span className="text-muted-foreground">Deployed:</span><span className="text-foreground">{c.deployed.toLocaleString()}</span>
                  <span className="text-muted-foreground">Reserve:</span><span className="text-foreground">{c.reserve.toLocaleString()}</span>
                  <span className="text-muted-foreground">Retired:</span><span className="text-foreground">{c.retired.toLocaleString()}</span>
                  <span className="text-muted-foreground">ICBMs:</span><span className="text-foreground">{c.icbms}</span>
                  <span className="text-muted-foreground">SLBMs:</span><span className="text-foreground">{c.slbms}</span>
                  <span className="text-muted-foreground">Bombers:</span><span className="text-foreground">{c.bombers}</span>
                  <span className="text-muted-foreground">Tactical:</span><span className="text-foreground">{c.tactical}</span>
                  <span className="text-muted-foreground">Last Test:</span><span className="text-foreground">{c.lastTest}</span>
                  <span className="text-muted-foreground">Treaty:</span><span className="text-foreground">{c.treaty}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
