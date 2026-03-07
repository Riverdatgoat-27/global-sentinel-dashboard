import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { GlobeEvent, CyberThreat } from '@/types/intelligence';

interface Props {
  events: GlobeEvent[];
  cyberThreats: CyberThreat[];
}

export default function AIAnalysisPanel({ events, cyberThreats }: Props) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis('');

    const eventsContext = [
      ...events.map(e => `${e.type}: ${e.title} (${e.severity}) - ${e.description}`),
      ...cyberThreats.map(t => `Cyber ${t.attackType}: ${t.target} from ${t.source} (${t.severity})`),
    ].join('\n');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ events: eventsContext }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limited. Try again shortly.');
          setLoading(false);
          return;
        }
        if (response.status === 402) {
          setError('AI credits depleted. Add credits in settings.');
          setLoading(false);
          return;
        }
        throw new Error('Analysis failed');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) setAnalysis(prev => prev + content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on first mount with data
  useEffect(() => {
    if (events.length > 0 || cyberThreats.length > 0) {
      runAnalysis();
    }
  }, []); // Only on mount

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Brain className="w-3.5 h-3.5 text-neon-cyan" />
        AI Threat Analysis
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="ml-auto flex items-center gap-1 text-[9px] text-neon-green hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? 'ANALYZING...' : 'RE-ANALYZE'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="flex items-center gap-2 text-neon-red text-xs mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
        {analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap"
          >
            {analysis}
          </motion.div>
        ) : !loading && !error ? (
          <div className="text-[11px] text-muted-foreground italic">
            Waiting for intelligence data to analyze...
          </div>
        ) : null}
      </div>
    </div>
  );
}
