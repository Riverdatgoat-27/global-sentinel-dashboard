import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Factory, DollarSign, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CountryEconomy {
  country: string;
  flag: string;
  gdp: string;
  gdpGrowth: number;
  inflation: number;
  debt: string;
  debtToGdp: number;
  tariffs: { partner: string; rate: number; change: number }[];
  factories: { name: string; product: string; output: string }[];
  sanctions: string[];
  tradeBalance: string;
}

const ECONOMIES: CountryEconomy[] = [
  {
    country: 'United States', flag: '🇺🇸', gdp: '$28.78T', gdpGrowth: 2.1, inflation: 3.2, debt: '$36.2T', debtToGdp: 126,
    tariffs: [
      { partner: 'China', rate: 145, change: 20 }, { partner: 'EU', rate: 25, change: 15 },
      { partner: 'Canada', rate: 25, change: 25 }, { partner: 'Mexico', rate: 25, change: 25 },
    ],
    factories: [
      { name: 'Lockheed Martin Ft. Worth', product: 'F-35 Fighter Jets', output: '156/year' },
      { name: 'Tesla Gigafactory TX', product: 'EVs & Batteries', output: '500K/year' },
      { name: 'Intel Fab 52 AZ', product: 'Semiconductors (3nm)', output: '30K wafers/month' },
    ],
    sanctions: ['Russia (full)', 'Iran (full)', 'North Korea', 'Syria', 'Venezuela (partial)'],
    tradeBalance: '-$773B',
  },
  {
    country: 'China', flag: '🇨🇳', gdp: '$19.37T', gdpGrowth: 4.6, inflation: 0.4, debt: '$14.5T', debtToGdp: 83,
    tariffs: [
      { partner: 'USA', rate: 125, change: 50 }, { partner: 'EU', rate: 8, change: 0 },
      { partner: 'Australia', rate: 80, change: -40 },
    ],
    factories: [
      { name: 'SMIC Shanghai', product: 'Semiconductors (7nm)', output: '100K wafers/month' },
      { name: 'BYD Shenzhen', product: 'EVs & Batteries', output: '3M/year' },
      { name: 'CASIC Wuhan', product: 'Hypersonic Missiles', output: 'Classified' },
    ],
    sanctions: ['Targeted US tech sanctions', 'Rare earth export controls'],
    tradeBalance: '+$823B',
  },
  {
    country: 'Russia', flag: '🇷🇺', gdp: '$2.24T', gdpGrowth: 1.3, inflation: 8.9, debt: '$350B', debtToGdp: 20,
    tariffs: [
      { partner: 'EU', rate: 35, change: 0 }, { partner: 'China', rate: 5, change: -3 },
    ],
    factories: [
      { name: 'UralVagonZavod', product: 'T-90M Tanks', output: '200/year (wartime surge)' },
      { name: 'UAC Komsomolsk', product: 'Su-57 Fighters', output: '12/year' },
      { name: 'Almaz-Antey', product: 'S-400/S-500 SAMs', output: '4 batteries/year' },
    ],
    sanctions: ['Western full sanctions', 'SWIFT exclusion (partial)', 'Oil price cap $60/bbl'],
    tradeBalance: '+$120B',
  },
  {
    country: 'EU (aggregate)', flag: '🇪🇺', gdp: '$18.35T', gdpGrowth: 0.8, inflation: 2.4, debt: '$14.8T', debtToGdp: 82,
    tariffs: [
      { partner: 'USA', rate: 25, change: 10 }, { partner: 'China', rate: 45, change: 9 },
      { partner: 'UK', rate: 0, change: 0 },
    ],
    factories: [
      { name: 'Airbus Toulouse', product: 'A320neo / A350', output: '75/month' },
      { name: 'Rheinmetall Düsseldorf', product: 'Leopard 2A8 Tanks', output: '120/year' },
      { name: 'ASML Veldhoven', product: 'EUV Lithography', output: '60 machines/year' },
    ],
    sanctions: ['Russia (14 packages)', 'Belarus', 'Iran (partial)'],
    tradeBalance: '+$45B',
  },
  {
    country: 'India', flag: '🇮🇳', gdp: '$4.11T', gdpGrowth: 6.5, inflation: 5.1, debt: '$2.4T', debtToGdp: 82,
    tariffs: [
      { partner: 'USA', rate: 26, change: 0 }, { partner: 'China', rate: 70, change: 5 },
    ],
    factories: [
      { name: 'HAL Bangalore', product: 'Tejas Mk2 Fighters', output: '16/year' },
      { name: 'Foxconn Chennai', product: 'iPhones', output: '20M/year' },
    ],
    sanctions: [],
    tradeBalance: '-$248B',
  },
  {
    country: 'Iran', flag: '🇮🇷', gdp: '$388B', gdpGrowth: -2.1, inflation: 42.5, debt: '$35B', debtToGdp: 32,
    tariffs: [
      { partner: 'China', rate: 4, change: 0 }, { partner: 'Russia', rate: 5, change: -5 },
    ],
    factories: [
      { name: 'Natanz Enrichment', product: 'Enriched Uranium (60%)', output: '6kg/month' },
      { name: 'IRGC Aerospace', product: 'Shahed-136 Drones', output: '1000+/year' },
      { name: 'Defense Industries', product: 'Emad/Sejjil MRBMs', output: '50/year est.' },
    ],
    sanctions: ['US maximum pressure', 'EU sanctions', 'UN JCPOA violations'],
    tradeBalance: '+$12B (est.)',
  },
];

export default function EconomicsPanel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'tariffs' | 'factories'>('overview');

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
        Global Economics
        <span className="ml-auto text-[8px] text-muted-foreground font-mono">LIVE DATA</span>
      </div>
      <div className="flex border-b border-border bg-card/50">
        {(['overview', 'tariffs', 'factories'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-2 py-1 text-[8px] font-mono uppercase tracking-wider transition-all ${
              tab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'overview' ? '💰 GDP' : t === 'tariffs' ? '📊 TARIFFS' : '🏭 FACTORIES'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {ECONOMIES.map((e, i) => (
          <motion.div key={e.country} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`border-b border-border ${expanded === e.country ? 'bg-muted/20' : ''}`}>
            <div className="px-2.5 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(expanded === e.country ? null : e.country)}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{e.flag}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-foreground">{e.country}</span>
                  <div className="flex items-center gap-3 text-[8px] font-mono mt-0.5">
                    {tab === 'overview' && (
                      <>
                        <span className="text-muted-foreground">GDP: <span className="text-foreground">{e.gdp}</span></span>
                        <span className={e.gdpGrowth > 0 ? 'text-neon-green' : 'text-neon-red'}>
                          {e.gdpGrowth > 0 ? '+' : ''}{e.gdpGrowth}%
                        </span>
                        <span className="text-muted-foreground">INF: <span className={e.inflation > 5 ? 'text-neon-red' : 'text-neon-amber'}>{e.inflation}%</span></span>
                      </>
                    )}
                    {tab === 'tariffs' && (
                      <span className="text-muted-foreground">{e.tariffs.length} trade partners • Balance: <span className={e.tradeBalance.startsWith('+') ? 'text-neon-green' : 'text-neon-red'}>{e.tradeBalance}</span></span>
                    )}
                    {tab === 'factories' && (
                      <span className="text-muted-foreground">{e.factories.length} key facilities</span>
                    )}
                  </div>
                </div>
                {expanded === e.country ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
            {expanded === e.country && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-3 pb-2 space-y-1.5">
                {tab === 'overview' && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[8px] font-mono">
                    <span className="text-muted-foreground">GDP:</span><span className="text-foreground">{e.gdp}</span>
                    <span className="text-muted-foreground">Growth:</span><span className={e.gdpGrowth > 0 ? 'text-neon-green' : 'text-neon-red'}>{e.gdpGrowth}%</span>
                    <span className="text-muted-foreground">Inflation:</span><span className="text-foreground">{e.inflation}%</span>
                    <span className="text-muted-foreground">Debt:</span><span className="text-foreground">{e.debt}</span>
                    <span className="text-muted-foreground">Debt/GDP:</span><span className={e.debtToGdp > 100 ? 'text-neon-red' : 'text-foreground'}>{e.debtToGdp}%</span>
                    <span className="text-muted-foreground">Trade:</span><span className={e.tradeBalance.startsWith('+') ? 'text-neon-green' : 'text-neon-red'}>{e.tradeBalance}</span>
                  </div>
                )}
                {tab === 'tariffs' && (
                  <div className="space-y-1">
                    {e.tariffs.map((t, j) => (
                      <div key={j} className="flex items-center gap-2 text-[8px] font-mono">
                        <span className="text-muted-foreground w-16 truncate">{t.partner}:</span>
                        <span className="text-foreground font-semibold">{t.rate}%</span>
                        {t.change !== 0 && (
                          <span className={`flex items-center gap-0.5 ${t.change > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                            {t.change > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                            {Math.abs(t.change)}%
                          </span>
                        )}
                      </div>
                    ))}
                    {e.sanctions.length > 0 && (
                      <div className="mt-1">
                        <span className="text-[7px] text-neon-red font-mono">SANCTIONS:</span>
                        {e.sanctions.map((s, j) => (
                          <div key={j} className="text-[8px] text-foreground/70 ml-2">• {s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {tab === 'factories' && (
                  <div className="space-y-1">
                    {e.factories.map((f, j) => (
                      <div key={j} className="p-1.5 bg-muted/10 rounded border border-border/30">
                        <div className="text-[9px] font-semibold text-foreground">{f.name}</div>
                        <div className="flex items-center justify-between text-[8px] font-mono mt-0.5">
                          <span className="text-neon-cyan">{f.product}</span>
                          <span className="text-muted-foreground">{f.output}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
