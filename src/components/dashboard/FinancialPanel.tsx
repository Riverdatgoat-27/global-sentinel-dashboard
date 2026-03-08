import { useState } from 'react';
import { motion } from 'framer-motion';
import { financialTickers } from '@/data/mockData';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const sectorColors: Record<string, string> = {
  defense: 'text-neon-red',
  cyber: 'text-neon-cyan',
  tech: 'text-neon-blue',
  commodity: 'text-neon-amber',
  crypto: 'text-neon-green',
};

type Sector = 'all' | 'defense' | 'cyber' | 'tech' | 'commodity' | 'crypto';

const FinancialPanel = () => {
  const [filter, setFilter] = useState<Sector>('all');

  const filtered = filter === 'all' ? financialTickers : financialTickers.filter(t => t.sector === filter);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <BarChart3 className="w-3.5 h-3.5 text-neon-amber" />
        Markets
      </div>
      {/* Filter tabs */}
      <div className="flex gap-0.5 px-2 py-1 border-b border-border overflow-x-auto">
        {(['all', 'defense', 'cyber', 'tech'] as Sector[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-[8px] px-1.5 py-0.5 rounded-sm font-display tracking-wider uppercase transition-colors ${
              filter === s ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((ticker, i) => (
          <motion.div
            key={ticker.symbol}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-2.5 py-1.5 border-b border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-display font-bold text-foreground">{ticker.symbol}</span>
                <span className="text-[9px] text-muted-foreground">{ticker.name}</span>
                <span className={`text-[7px] uppercase ${sectorColors[ticker.sector] || 'text-muted-foreground'}`}>
                  {ticker.sector}
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="text-[10px] font-mono text-foreground">
                  ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center gap-0.5 text-[9px] font-mono ${ticker.change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {ticker.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FinancialPanel;
