import { motion } from 'framer-motion';
import { newsItems } from '@/data/mockData';
import { Newspaper, ExternalLink } from 'lucide-react';

const categoryColor: Record<string, string> = {
  cyber: 'text-neon-green',
  military: 'text-neon-red',
  geopolitical: 'text-neon-cyan',
  financial: 'text-neon-amber',
};

const NewsFeed = () => {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Newspaper className="w-3.5 h-3.5 text-neon-cyan" />
        Intelligence Feed
      </div>
      <div className="flex-1 overflow-y-auto">
        {newsItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="px-3 py-2.5 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-display uppercase tracking-wider ${categoryColor[item.category]}`}>
                {item.category}
              </span>
              <span className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
            <h4 className="text-xs font-semibold text-foreground leading-snug mb-1">{item.headline}</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{item.summary}</p>
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-neon-cyan">
              <ExternalLink className="w-2.5 h-2.5" />
              <span>{item.source}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
