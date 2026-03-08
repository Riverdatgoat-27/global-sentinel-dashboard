import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Emotion = 'neutral' | 'alert' | 'thinking' | 'happy' | 'concerned' | 'serious';

interface Props {
  emotion: Emotion;
  speaking: boolean;
  listening: boolean;
  visible: boolean;
}

// Walking skeleton hologram that roams the screen
export default function CortanaOverlay({ emotion, speaking, listening, visible }: Props) {
  const [posX, setPosX] = useState(70); // % from left
  const [posY, setPosY] = useState(75); // % from top  
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [walking, setWalking] = useState(true);
  const [legPhase, setLegPhase] = useState(0);
  const frameRef = useRef(0);

  // Walking animation
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      if (speaking || listening) {
        setWalking(false);
        return;
      }
      setWalking(true);
      setPosX(prev => {
        const next = prev + direction * 0.15;
        if (next > 85) { setDirection(-1); return 85; }
        if (next < 15) { setDirection(1); return 15; }
        return next;
      });
      // Slight vertical bob
      setPosY(prev => 75 + Math.sin(Date.now() / 800) * 1.5);
      setLegPhase(prev => prev + 0.15);
    }, 50);
    return () => clearInterval(interval);
  }, [visible, speaking, listening, direction]);

  const getColor = () => {
    switch (emotion) {
      case 'alert': return '#ff4444';
      case 'thinking': return '#ffaa00';
      case 'happy': return '#44ff88';
      case 'concerned': return '#ffaa00';
      case 'serious': return '#6688ff';
      default: return 'hsl(var(--primary))';
    }
  };

  const c = getColor();
  const legAngle = walking ? Math.sin(legPhase) * 25 : 0;
  const armAngle = walking ? Math.sin(legPhase + Math.PI) * 20 : (speaking ? Math.sin(Date.now() / 300) * 8 : 0);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[90]"
        >
          <div
            className="absolute transition-none"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              transform: `translate(-50%, -100%) scaleX(${direction})`,
              filter: `drop-shadow(0 0 12px ${c}40) drop-shadow(0 0 30px ${c}15)`,
            }}
          >
            <svg width="60" height="100" viewBox="0 0 60 100" className="overflow-visible">
              {/* Scan lines overlay */}
              <defs>
                <linearGradient id="skelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={c} stopOpacity="0.3" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#glow)" opacity={0.85}>
                {/* HEAD - skull outline */}
                <ellipse cx="30" cy="12" rx="9" ry="11" fill="none" stroke={c} strokeWidth="1.2" opacity="0.8" />
                {/* Cranium detail */}
                <path d="M21 12 Q30 2 39 12" fill="none" stroke={c} strokeWidth="0.6" opacity="0.4" />
                
                {/* Eyes */}
                <g>
                  <ellipse cx="25.5" cy="12" rx="2.5" ry="2" fill="none" stroke={c} strokeWidth="0.8">
                    <animate attributeName="ry" values={speaking ? "2;1.2;2" : "2;2;2"} dur="0.3s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="25.5" cy="12" r="1" fill={c} opacity="0.9">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  
                  <ellipse cx="34.5" cy="12" rx="2.5" ry="2" fill="none" stroke={c} strokeWidth="0.8">
                    <animate attributeName="ry" values={speaking ? "2;1.2;2" : "2;2;2"} dur="0.3s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="34.5" cy="12" r="1" fill={c} opacity="0.9">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </g>

                {/* Nose */}
                <line x1="30" y1="14" x2="30" y2="16.5" stroke={c} strokeWidth="0.6" opacity="0.5" />
                
                {/* Mouth */}
                {speaking ? (
                  <g>
                    <rect x="26" y="18" width="8" height="2" rx="1" fill="none" stroke={c} strokeWidth="0.7">
                      <animate attributeName="height" values="1;3;1" dur="0.2s" repeatCount="indefinite" />
                    </rect>
                  </g>
                ) : (
                  <line x1="26" y1="19" x2="34" y2="19" stroke={c} strokeWidth="0.7" opacity="0.6" />
                )}

                {/* SPINE / NECK */}
                <line x1="30" y1="23" x2="30" y2="28" stroke={c} strokeWidth="1" opacity="0.7" />
                
                {/* RIBCAGE */}
                <line x1="30" y1="28" x2="30" y2="52" stroke={c} strokeWidth="1" opacity="0.6" />
                {/* Ribs */}
                {[30, 34, 38, 42, 46].map((y, i) => (
                  <g key={i}>
                    <path d={`M30 ${y} Q${22 - i} ${y + 1} ${20} ${y + 3}`} fill="none" stroke={c} strokeWidth="0.6" opacity="0.4" />
                    <path d={`M30 ${y} Q${38 + i} ${y + 1} ${40} ${y + 3}`} fill="none" stroke={c} strokeWidth="0.6" opacity="0.4" />
                  </g>
                ))}
                
                {/* PELVIS */}
                <path d="M22 52 Q30 58 38 52" fill="none" stroke={c} strokeWidth="0.8" opacity="0.5" />

                {/* SHOULDERS */}
                <line x1="18" y1="28" x2="42" y2="28" stroke={c} strokeWidth="1" opacity="0.7" />
                
                {/* LEFT ARM */}
                <g style={{ transformOrigin: '18px 28px', transform: `rotate(${armAngle}deg)` }}>
                  <line x1="18" y1="28" x2="14" y2="45" stroke={c} strokeWidth="0.8" opacity="0.6" />
                  <line x1="14" y1="45" x2="12" y2="55" stroke={c} strokeWidth="0.7" opacity="0.5" />
                  {/* Hand bones */}
                  <circle cx="12" cy="55" r="1.5" fill="none" stroke={c} strokeWidth="0.5" opacity="0.4" />
                </g>
                
                {/* RIGHT ARM */}
                <g style={{ transformOrigin: '42px 28px', transform: `rotate(${-armAngle}deg)` }}>
                  <line x1="42" y1="28" x2="46" y2="45" stroke={c} strokeWidth="0.8" opacity="0.6" />
                  <line x1="46" y1="45" x2="48" y2="55" stroke={c} strokeWidth="0.7" opacity="0.5" />
                  <circle cx="48" cy="55" r="1.5" fill="none" stroke={c} strokeWidth="0.5" opacity="0.4" />
                </g>

                {/* LEFT LEG */}
                <g style={{ transformOrigin: '26px 54px', transform: `rotate(${legAngle}deg)` }}>
                  <line x1="26" y1="54" x2="23" y2="75" stroke={c} strokeWidth="0.9" opacity="0.6" />
                  <line x1="23" y1="75" x2="21" y2="92" stroke={c} strokeWidth="0.7" opacity="0.5" />
                  <ellipse cx="20" cy="94" rx="3" ry="1.5" fill="none" stroke={c} strokeWidth="0.5" opacity="0.4" />
                </g>
                
                {/* RIGHT LEG */}
                <g style={{ transformOrigin: '34px 54px', transform: `rotate(${-legAngle}deg)` }}>
                  <line x1="34" y1="54" x2="37" y2="75" stroke={c} strokeWidth="0.9" opacity="0.6" />
                  <line x1="37" y1="75" x2="39" y2="92" stroke={c} strokeWidth="0.7" opacity="0.5" />
                  <ellipse cx="40" cy="94" rx="3" ry="1.5" fill="none" stroke={c} strokeWidth="0.5" opacity="0.4" />
                </g>

                {/* Energy core in chest */}
                <circle cx="30" cy="36" r="3" fill={c} opacity="0.15">
                  <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="30" cy="36" r="1.5" fill={c} opacity="0.5">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Ground shadow */}
              <ellipse cx="30" cy="98" rx="12" ry="2" fill={c} opacity="0.1">
                <animate attributeName="rx" values="10;14;10" dur="2s" repeatCount="indefinite" />
              </ellipse>

              {/* Listening indicator rings */}
              {listening && (
                <g>
                  <circle cx="30" cy="12" r="15" fill="none" stroke={c} strokeWidth="0.3" opacity="0.3">
                    <animate attributeName="r" values="15;25;15" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* Status text */}
              <text x="30" y="-3" textAnchor="middle" fill={c} fontSize="4" fontFamily="monospace" opacity="0.6">
                {speaking ? '◉ SPEAKING' : listening ? '◉ LISTENING' : `◉ ${emotion.toUpperCase()}`}
              </text>
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
