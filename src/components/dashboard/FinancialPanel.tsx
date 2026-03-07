import { motion } from 'framer-motion';
import { financialTickers } from '@/data/mockData';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const FinancialPanel = () => {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <BarChart3 className="w-3.5 h-3.5 text-neon-amber" />
        Financial Intelligence
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">LIVE MARKET DATA</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {financialTickers.map((ticker, i) => (
          <motion.div
            key={ticker.symbol}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-3 py-2 border-b border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display font-bold text-foreground">{ticker.symbol}</span>
                  <span className="text-[10px] text-muted-foreground">{ticker.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-foreground">
                  ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-mono ${ticker.change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {ticker.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  <span>{ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}</span>
                  <span>({ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
            {/* Mini sparkline bar */}
            <div className="mt-1.5 h-1 bg-muted rounded-sm overflow-hidden">
              <motion.div
                className={`h-full rounded-sm ${ticker.change >= 0 ? 'bg-neon-green/40' : 'bg-neon-red/40'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.abs(ticker.changePercent) * 15, 100)}%` }}
                transition={{ delay: i * 0.1 + 0.5, duration: 1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FinancialPanel;
