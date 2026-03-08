import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Brain, Sparkles } from 'lucide-react';
import type { AlertNotification } from '@/types/intelligence';

interface Props {
  alerts: AlertNotification[];
  onCommand?: (command: string) => void;
}

const WAKE_WORD = 'hey ai';

function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.1;
  utterance.volume = 0.9;
  // Try to pick a female voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => 
    v.name.includes('Samantha') || v.name.includes('Google UK English Female') || 
    v.name.includes('Microsoft Zira') || v.name.includes('Karen') ||
    (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export default function NexusAI({ alerts, onCommand }: Props) {
  const [visible, setVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [activated, setActivated] = useState(false);
  const recognitionRef = useRef<any>(null);
  const spokenAlerts = useRef<Set<string>>(new Set());

  // Load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Welcome greeting on first visit
  useEffect(() => {
    if (hasGreeted) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      setVisible(true);
      const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
      const greeting = criticalCount > 0
        ? `Welcome, General. NEXUS Command is online. I'm detecting ${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} requiring your attention. Standing by for your orders.`
        : `Welcome, General. NEXUS Command is online. All systems nominal. Global monitoring active across all sectors. Standing by for your orders.`;
      setAiResponse(greeting);
      if (!muted) speak(greeting);
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasGreeted, alerts, muted]);

  // Speak new critical alerts
  useEffect(() => {
    if (muted) return;
    alerts.filter(a => a.severity === 'critical' && !a.acknowledged && !spokenAlerts.current.has(a.id)).forEach(alert => {
      spokenAlerts.current.add(alert.id);
      // Don't speak during greeting
      if (!hasGreeted) return;
      setTimeout(() => {
        speak(`Alert: ${alert.title}`);
      }, 500);
    });
  }, [alerts, muted, hasGreeted]);

  // Voice recognition setup
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }

      const full = (final + interim).toLowerCase().trim();
      setTranscript(full);

      // Check for wake word
      if (full.includes(WAKE_WORD) || activated) {
        const commandPart = full.replace(WAKE_WORD, '').trim();
        if (final && commandPart.length > 3) {
          handleVoiceCommand(commandPart);
          setActivated(false);
        } else if (full.includes(WAKE_WORD) && !activated) {
          setActivated(true);
          setVisible(true);
          if (!muted) speak("Yes, General?");
          setAiResponse("Listening for your command...");
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      // Restart if we're supposed to be listening
      if (listening) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {}
  }, [activated, muted, listening]);

  const stopListening = useCallback(() => {
    setListening(false);
    setActivated(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const handleVoiceCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    let response = '';

    if (cmd.includes('latest alert') || cmd.includes('alert')) {
      const unacked = alerts.filter(a => !a.acknowledged);
      if (unacked.length > 0) {
        response = `There are ${unacked.length} active alerts. The most critical: ${unacked[0].title}. ${unacked[0].description}`;
      } else {
        response = 'All alerts have been acknowledged. No new critical events.';
      }
    } else if (cmd.includes('threat') || cmd.includes('status')) {
      const critical = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
      response = `Current threat level is elevated. ${critical} critical events active. Global monitoring across all sectors.`;
    } else if (cmd.includes('camera') || cmd.includes('cctv')) {
      response = 'Switching to CCTV monitoring panel. Live camera feeds are available from multiple global locations.';
      onCommand?.('cctv');
    } else if (cmd.includes('financial') || cmd.includes('market')) {
      response = 'Opening financial markets panel. Defense sector and commodity tracking active.';
      onCommand?.('financial');
    } else if (cmd.includes('radio') || cmd.includes('scanner')) {
      response = 'Opening radio scanner. Multiple frequency bands available for monitoring.';
      onCommand?.('radio');
    } else {
      response = `Understood, General. Processing your request: "${command}". I'll update the display accordingly.`;
    }

    setAiResponse(response);
    if (!muted) speak(response);
    setTranscript('');
  }, [alerts, muted, onCommand]);

  return (
    <>
      {/* Floating AI button */}
      <motion.button
        onClick={() => setVisible(!visible)}
        className="fixed bottom-4 right-4 z-[100] w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm hover:bg-primary/30 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}
      >
        <Brain className="w-5 h-5 text-primary" />
        {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[8px] font-mono flex items-center justify-center text-destructive-foreground">
            {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length}
          </span>
        )}
      </motion.button>

      {/* AI Panel */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-[100] w-80 bg-card border border-border rounded-lg overflow-hidden"
            style={{ boxShadow: '0 8px 40px hsl(0 0% 0% / 0.6), 0 0 1px hsl(var(--border))' }}
          >
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-border flex items-center gap-2 bg-primary/5">
              <div className="relative">
                <Brain className="w-4 h-4 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              </div>
              <span className="font-mono text-xs font-semibold text-foreground tracking-wide">NEXUS AI</span>
              <span className="text-[8px] text-muted-foreground font-mono">v4.0</span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-neon-cyan" />}
                </button>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`p-1 rounded transition-colors ${listening ? 'bg-neon-red/20 text-neon-red' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  title={listening ? 'Stop listening' : 'Start voice recognition'}
                >
                  {listening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setVisible(false)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* AI Response */}
            <div className="p-3 max-h-48 overflow-y-auto">
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-foreground leading-relaxed"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[9px] text-primary font-mono uppercase">NEXUS Response</span>
                  </div>
                  {aiResponse}
                </motion.div>
              )}
            </div>

            {/* Voice status */}
            {listening && (
              <div className="px-3 py-2 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-neon-cyan rounded-full"
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {activated ? 'AWAITING COMMAND...' : `Say "${WAKE_WORD}" to activate`}
                  </span>
                </div>
                {transcript && (
                  <p className="text-[10px] text-neon-cyan font-mono mt-1 truncate">"{transcript}"</p>
                )}
              </div>
            )}

            {/* Quick commands */}
            <div className="px-3 py-2 border-t border-border">
              <div className="text-[8px] text-muted-foreground font-mono uppercase mb-1.5">Quick Commands</div>
              <div className="flex flex-wrap gap-1">
                {['Latest Alerts', 'Threat Status', 'Show CCTV', 'Markets'].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => handleVoiceCommand(cmd)}
                    className="px-2 py-0.5 text-[9px] font-mono bg-muted/30 border border-border/50 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
