import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, RefreshCw, Filter } from 'lucide-react';
import type { NewsArticle } from '@/hooks/useRealTimeNews';

const categoryIcon: Record<string, string> = {
  war: '⚔️', military: '🎖️', cyber: '💻', geopolitical: '🌐', disaster: '🌊', protest: '✊',
};

const categoryColor: Record<string, string> = {
  war: 'text-neon-red', military: 'text-neon-amber', cyber: 'text-neon-cyan',
  geopolitical: 'text-primary', disaster: 'text-neon-amber', protest: 'text-neon-green',
};

interface Props {
  news: NewsArticle[];
  loading: boolean;
  onRefresh: () => void;
}

export default function NewsFeedPanel({ news, loading, onRefresh }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    setLastRefresh(Date.now());
  }, [news]);

  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);
  const categories = ['all', 'war', 'military', 'cyber', 'geopolitical', 'disaster'];

  const timeSinceRefresh = Math.floor((Date.now() - lastRefresh) / 1000);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Newspaper className="w-3.5 h-3.5 text-primary" />
        Live Global News
        <span className="ml-auto flex items-center gap-1.5">
          <span className="text-[8px] text-muted-foreground font-mono">{filtered.length} articles</span>
          <button onClick={onRefresh} className="p-0.5 hover:bg-muted/50 rounded transition-colors" title="Refresh">
            <RefreshCw className={`w-3 h-3 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </span>
      </div>

      {/* Category filters */}
      <div className="flex gap-0.5 px-2 py-1 border-b border-border bg-card/50 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-1.5 py-0.5 text-[8px] font-mono uppercase rounded transition-colors whitespace-nowrap ${
              filter === cat ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {cat === 'all' ? '📡 ALL' : `${categoryIcon[cat]} ${cat}`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-[10px] text-muted-foreground">
            {loading ? 'Fetching live intelligence...' : 'No articles in this category'}
          </div>
        ) : (
          filtered.map((article, i) => (
            <motion.a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="block px-2.5 py-2 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors group"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0 mt-0.5">{categoryIcon[article.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={`text-[7px] font-mono uppercase ${categoryColor[article.category]}`}>{article.category}</span>
                    <span className="text-[7px] text-muted-foreground">•</span>
                    <span className="text-[7px] text-muted-foreground font-mono">{article.source}</span>
                  </div>
                  <p className="text-[10px] text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(article.timestamp).toLocaleTimeString()}</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))
        )}
      </div>
    </div>
  );
}
