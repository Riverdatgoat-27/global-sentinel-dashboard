import { useState, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, FastForward } from 'lucide-react';

interface Props {
  onTimeChange?: (time: number) => void;
}

export default function TimelineSlider({ onTimeChange }: Props) {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  
  const [currentTime, setCurrentTime] = useState(now);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 60000 * speed; // each tick = 1 minute * speed
        if (next >= now) {
          setIsPlaying(false);
          return now;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, speed, now]);

  useEffect(() => {
    onTimeChange?.(currentTime);
  }, [currentTime, onTimeChange]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
    setIsPlaying(false);
  }, []);

  const skipBack = () => {
    setCurrentTime(prev => Math.max(dayAgo, prev - 3600000));
    setIsPlaying(false);
  };

  const skipForward = () => {
    setCurrentTime(prev => Math.min(now, prev + 3600000));
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    setSpeed(prev => prev >= 10 ? 1 : prev === 1 ? 2 : prev === 2 ? 5 : 10);
  };

  const formatTime = (t: number) => {
    const d = new Date(t);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  const progress = ((currentTime - dayAgo) / (now - dayAgo)) * 100;

  return (
    <div className="panel px-3 py-1.5 flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-neon-green" />
        <span className="text-[9px] font-display tracking-wider text-neon-green">TIMELINE</span>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={skipBack} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
          <SkipBack className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-0.5 text-neon-green hover:text-foreground transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={skipForward} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="w-3 h-3" />
        </button>
        <button onClick={cycleSpeed} className="p-0.5 flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
          <FastForward className="w-3 h-3" />
          <span className="text-[8px] font-mono">{speed}x</span>
        </button>
      </div>

      <div className="flex-1 relative">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-cyan)))',
            }}
          />
        </div>
        <input
          type="range"
          min={dayAgo}
          max={now}
          value={currentTime}
          onChange={handleSlider}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="text-[9px] font-mono text-muted-foreground tabular-nums whitespace-nowrap">
        {formatTime(currentTime)}
      </span>
    </div>
  );
}
