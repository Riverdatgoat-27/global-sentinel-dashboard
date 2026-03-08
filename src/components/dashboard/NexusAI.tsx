import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Brain, Sparkles, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { AlertNotification } from '@/types/intelligence';

export interface CortanaAction {
  action: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  panel?: string;
  type?: string;
  query?: string;
  layer?: string;
  visible?: boolean;
  region?: string;
}

interface Props {
  alerts: AlertNotification[];
  onCommand?: (command: string) => void;
  onAction?: (action: CortanaAction) => void;
  getContext?: () => string;
}

const WAKE_WORD = 'hey cortana';

function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.15;
  utterance.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  // Pick a female voice that sounds closest to Cortana
  const preferred = voices.find(v =>
    v.name.includes('Samantha') || v.name.includes('Google UK English Female') ||
    v.name.includes('Microsoft Zira') || v.name.includes('Karen') ||
    v.name.includes('Moira') || v.name.includes('Fiona') ||
    (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

// Hologram ring animation component
function HologramAvatar({ speaking, listening }: { speaking: boolean; listening: boolean }) {
  return (
    <div className="relative w-20 h-20 mx-auto mb-3">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          boxShadow: `0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.15)`,
        }}
        animate={{
          scale: speaking ? [1, 1.15, 1] : listening ? [1, 1.08, 1] : [1, 1.03, 1],
          opacity: speaking ? [0.8, 1, 0.8] : [0.5, 0.7, 0.5],
        }}
        transition={{ duration: speaking ? 0.8 : 2, repeat: Infinity }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-primary/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ boxShadow: `inset 0 0 15px hsl(var(--primary) / 0.2)` }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-4 rounded-full border border-primary/60"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* Core icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: speaking ? [1, 1.1, 1] : [1, 1.02, 1],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Brain className="w-7 h-7 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
        </motion.div>
      </div>
      {/* Particle dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/80"
          style={{
            top: '50%', left: '50%',
          }}
          animate={{
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 38, 0],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 38, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
      {/* Speaking waveform */}
      {speaking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-primary rounded-full"
              animate={{ height: [3, 10 + Math.random() * 6, 3] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NexusAI({ alerts, onCommand, onAction, getContext }: Props) {
  const [visible, setVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [activated, setActivated] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<any>(null);
  const spokenAlerts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Welcome greeting
  useEffect(() => {
    if (hasGreeted) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      setVisible(true);
      const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
      const greeting = criticalCount > 0
        ? `Welcome, General. Cortana online. I'm detecting ${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} requiring your attention. I'm ready to assist with full command capabilities.`
        : `Welcome, General. Cortana online. All systems nominal. Global monitoring active. I can control the globe, analyze threats, track assets, and manage all station systems. Standing by.`;
      setAiResponse(greeting);
      if (!muted) {
        setSpeaking(true);
        speak(greeting, () => setSpeaking(false));
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasGreeted, alerts, muted]);

  // Speak new critical alerts
  useEffect(() => {
    if (muted) return;
    alerts.filter(a => a.severity === 'critical' && !a.acknowledged && !spokenAlerts.current.has(a.id)).forEach(alert => {
      spokenAlerts.current.add(alert.id);
      if (!hasGreeted) return;
      setTimeout(() => {
        setSpeaking(true);
        speak(`Alert: ${alert.title}`, () => setSpeaking(false));
      }, 500);
    });
  }, [alerts, muted, hasGreeted]);

  // Process command through AI backend
  const processCommand = useCallback(async (command: string) => {
    setProcessing(true);
    setAiResponse('Processing...');

    const context = getContext?.() || '';
    const alertContext = alerts.filter(a => !a.acknowledged).slice(0, 5)
      .map(a => `[${a.severity}] ${a.title}: ${a.description}`).join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('cortana-command', {
        body: {
          command,
          context: `Active alerts:\n${alertContext}\n\nDashboard state: ${context}`,
        },
      });

      if (error) throw error;

      const { text, actions } = data as { text: string; actions: CortanaAction[] };
      setAiResponse(text);

      if (!muted) {
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
      }

      // Execute actions
      if (actions?.length) {
        for (const action of actions) {
          onAction?.(action);
          // Small delay between chained actions
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } catch (e) {
      console.error('Cortana error:', e);
      const fallback = "I'm experiencing a connection issue, General. Falling back to local processing.";
      setAiResponse(fallback);
      if (!muted) {
        setSpeaking(true);
        speak(fallback, () => setSpeaking(false));
      }
      // Fallback to simple local commands
      handleLocalCommand(command);
    } finally {
      setProcessing(false);
    }
  }, [alerts, muted, onAction, getContext]);

  const handleLocalCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('alert')) onCommand?.('alerts');
    else if (lower.includes('cctv') || lower.includes('camera')) onCommand?.('cctv');
    else if (lower.includes('financial') || lower.includes('market')) onCommand?.('financial');
    else if (lower.includes('radio') || lower.includes('scanner')) onCommand?.('radio');
  }, [onCommand]);

  // Voice recognition
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t; else interim += t;
      }
      const full = (final + interim).toLowerCase().trim();
      setTranscript(full);

      if (full.includes(WAKE_WORD) || activated) {
        const commandPart = full.replace(WAKE_WORD, '').trim();
        if (final && commandPart.length > 3) {
          processCommand(commandPart);
          setActivated(false);
          setTranscript('');
        } else if (full.includes(WAKE_WORD) && !activated) {
          setActivated(true);
          setVisible(true);
          if (!muted) {
            setSpeaking(true);
            speak("Yes, General?", () => setSpeaking(false));
          }
          setAiResponse("Listening for your command...");
        }
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => { if (listening) try { recognition.start(); } catch {} };

    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); } catch {}
  }, [activated, muted, listening, processCommand]);

  const stopListening = useCallback(() => {
    setListening(false);
    setActivated(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || processing) return;
    processCommand(textInput.trim());
    setTextInput('');
  }, [textInput, processing, processCommand]);

  return (
    <>
      {/* Floating button */}
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
            className="fixed bottom-20 right-4 z-[100] w-80 bg-card/95 border border-primary/20 rounded-lg overflow-hidden backdrop-blur-md"
            style={{ boxShadow: '0 8px 40px hsl(0 0% 0% / 0.6), 0 0 30px hsl(var(--primary) / 0.15)' }}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-primary/5">
              <div className="relative">
                <Brain className="w-4 h-4 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              </div>
              <span className="font-mono text-xs font-semibold text-foreground tracking-wide">CORTANA</span>
              <span className="text-[8px] text-primary/60 font-mono">NEXUS v5.0</span>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setMuted(!muted)} className="p-1 rounded hover:bg-muted/50 transition-colors" title={muted ? 'Unmute' : 'Mute'}>
                  {muted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-neon-cyan" />}
                </button>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`p-1 rounded transition-colors ${listening ? 'bg-neon-red/20 text-neon-red' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  title={listening ? 'Stop listening' : 'Start voice'}
                >
                  {listening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setVisible(false)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Hologram + Response */}
            <div className="p-3 max-h-56 overflow-y-auto">
              <HologramAvatar speaking={speaking} listening={listening && activated} />

              {processing && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  <span className="text-[9px] text-primary font-mono">PROCESSING...</span>
                </div>
              )}

              {aiResponse && !processing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-foreground leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[9px] text-primary font-mono uppercase">CORTANA</span>
                  </div>
                  {aiResponse}
                </motion.div>
              )}
            </div>

            {/* Voice status */}
            {listening && (
              <div className="px-3 py-2 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} className="w-0.5 bg-neon-cyan rounded-full"
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {activated ? 'AWAITING COMMAND...' : `Say "Hey Cortana" to activate`}
                  </span>
                </div>
                {transcript && <p className="text-[10px] text-neon-cyan font-mono mt-1 truncate">"{transcript}"</p>}
              </div>
            )}

            {/* Text input */}
            <form onSubmit={handleTextSubmit} className="px-3 py-2 border-t border-border flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Type a command..."
                className="flex-1 bg-muted/30 border border-border/50 rounded px-2 py-1 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                disabled={processing}
              />
              <button
                type="submit"
                disabled={processing || !textInput.trim()}
                className="p-1 rounded bg-primary/20 hover:bg-primary/30 transition-colors disabled:opacity-30"
              >
                <Send className="w-3 h-3 text-primary" />
              </button>
            </form>

            {/* Quick commands */}
            <div className="px-3 py-2 border-t border-border">
              <div className="text-[8px] text-muted-foreground font-mono uppercase mb-1.5">Quick Commands</div>
              <div className="flex flex-wrap gap-1">
                {[
                  'Show latest alerts',
                  'Zoom into Middle East',
                  'Show military aircraft',
                  'Switch to CCTV',
                  'Threat analysis',
                  'Show all ships',
                ].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => processCommand(cmd)}
                    disabled={processing}
                    className="px-2 py-0.5 text-[8px] font-mono bg-muted/30 border border-border/50 rounded hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
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
