import { motion } from 'framer-motion';

const RadarWidget = () => {
  return (
    <div className="panel h-full flex flex-col items-center justify-center p-4">
      <div className="panel-header w-full">
        <span className="w-2 h-2 rounded-full bg-neon-green" />
        Threat Radar
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-40 h-40">
          {/* Radar circles */}
          {[1, 0.75, 0.5, 0.25].map((scale) => (
            <div
              key={scale}
              className="absolute rounded-full border border-border"
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
                top: `${(1 - scale) * 50}%`,
                left: `${(1 - scale) * 50}%`,
              }}
            />
          ))}
          {/* Cross lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
          {/* Sweep */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--neon-green)), transparent)',
              boxShadow: '0 0 8px hsl(var(--neon-green) / 0.5)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          {/* Blips */}
          {[
            { x: 60, y: 25 },
            { x: 75, y: 55 },
            { x: 30, y: 70 },
            { x: 45, y: 35 },
            { x: 80, y: 40 },
          ].map((blip, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-neon-green"
              style={{
                left: `${blip.x}%`,
                top: `${blip.y}%`,
                boxShadow: '0 0 6px hsl(var(--neon-green))',
              }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground font-display tracking-wider">
        5 CONTACTS TRACKED
      </div>
    </div>
  );
};

export default RadarWidget;
