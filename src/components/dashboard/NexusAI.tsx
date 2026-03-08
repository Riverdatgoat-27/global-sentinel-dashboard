import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, Loader2 } from 'lucide-react';
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

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  alerts: AlertNotification[];
  onCommand?: (command: string) => void;
  onAction?: (action: CortanaAction) => void;
  getContext?: () => string;
}

type Emotion = 'neutral' | 'alert' | 'thinking' | 'happy' | 'concerned' | 'serious';

const WAKE_WORD = 'hey cortana';

function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  // More human-like voice settings
  utterance.rate = 0.95;
  utterance.pitch = 1.1;
  utterance.volume = 0.95;
  const voices = window.speechSynthesis.getVoices();
  // Priority order for most natural female voices
  const voicePreference = [
    'Microsoft Zira', 'Samantha', 'Karen', 'Moira', 'Tessa',
    'Google UK English Female', 'Fiona', 'Victoria', 'Allison',
    'Microsoft Jenny', 'Microsoft Aria',
  ];
  let preferred = null;
  for (const name of voicePreference) {
    preferred = voices.find(v => v.name.includes(name));
    if (preferred) break;
  }
  if (!preferred) preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
  if (!preferred) preferred = voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

// ===== Robot Hologram with Facial Expressions =====
function RobotHologram({ emotion, speaking, listening }: { emotion: Emotion; speaking: boolean; listening: boolean }) {
  // Eye expressions based on emotion
  const getEyeStyle = () => {
    switch (emotion) {
      case 'alert': return { scaleY: 1.3, color: 'hsl(var(--neon-red))' };
      case 'thinking': return { scaleY: 0.5, color: 'hsl(var(--neon-amber))' };
      case 'happy': return { scaleY: 0.7, color: 'hsl(var(--neon-green))' };
      case 'concerned': return { scaleY: 0.8, color: 'hsl(var(--neon-amber))' };
      case 'serious': return { scaleY: 1.1, color: 'hsl(var(--primary))' };
      default: return { scaleY: 1, color: 'hsl(var(--primary))' };
    }
  };

  const eyeStyle = getEyeStyle();

  return (
    <div className="relative w-24 h-28 mx-auto mb-2">
      {/* Holographic scan lines */}
      <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-px bg-primary/60"
            style={{ top: `${i * 8.3}%` }}
            animate={{ opacity: [0.2, 0.6, 0.2], x: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Outer hologram glow */}
      <motion.div
        className="absolute -inset-3 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse, ${eyeStyle.color.replace(')', ' / 0.12)')} 0%, transparent 70%)`,
          boxShadow: `0 0 40px ${eyeStyle.color.replace(')', ' / 0.2)')}, 0 0 80px ${eyeStyle.color.replace(')', ' / 0.08)')}`,
        }}
        animate={{
          scale: speaking ? [1, 1.08, 1] : [1, 1.02, 1],
          opacity: speaking ? [0.6, 1, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{ duration: speaking ? 0.6 : 2.5, repeat: Infinity }}
      />

      {/* Robot head shape */}
      <div className="absolute inset-0 rounded-xl border border-primary/30 bg-card/40 backdrop-blur-sm overflow-hidden"
        style={{ boxShadow: `inset 0 0 20px ${eyeStyle.color.replace(')', ' / 0.1)')}` }}>

        {/* Forehead panel */}
        <div className="absolute top-1 left-3 right-3 h-3 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: eyeStyle.color }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Eyes */}
        <div className="absolute top-6 left-0 right-0 flex justify-center gap-4">
          {/* Left eye */}
          <motion.div className="relative w-5 h-4 flex items-center justify-center">
            <motion.div
              className="w-4 rounded-full"
              style={{ backgroundColor: eyeStyle.color, height: '3px' }}
              animate={{
                scaleY: speaking ? [eyeStyle.scaleY, eyeStyle.scaleY * 0.6, eyeStyle.scaleY] : eyeStyle.scaleY,
                scaleX: emotion === 'happy' ? 1.2 : emotion === 'thinking' ? 0.9 : 1,
              }}
              transition={{ duration: speaking ? 0.3 : 0.5, repeat: speaking ? Infinity : 0 }}
            />
            {/* Eye glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 8px ${eyeStyle.color.replace(')', ' / 0.6)')}` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Pupil/iris */}
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: eyeStyle.color }}
              animate={{
                x: emotion === 'thinking' ? [0, 2, 0, -2, 0] : 0,
                scale: emotion === 'alert' ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: emotion === 'thinking' ? 3 : 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Right eye */}
          <motion.div className="relative w-5 h-4 flex items-center justify-center">
            <motion.div
              className="w-4 rounded-full"
              style={{ backgroundColor: eyeStyle.color, height: '3px' }}
              animate={{
                scaleY: speaking ? [eyeStyle.scaleY, eyeStyle.scaleY * 0.6, eyeStyle.scaleY] : eyeStyle.scaleY,
                scaleX: emotion === 'happy' ? 1.2 : emotion === 'thinking' ? 0.9 : 1,
              }}
              transition={{ duration: speaking ? 0.3 : 0.5, repeat: speaking ? Infinity : 0 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 8px ${eyeStyle.color.replace(')', ' / 0.6)')}` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: eyeStyle.color }}
              animate={{
                x: emotion === 'thinking' ? [0, 2, 0, -2, 0] : 0,
                scale: emotion === 'alert' ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: emotion === 'thinking' ? 3 : 1.5, repeat: Infinity, delay: 0.1 }}
            />
          </motion.div>
        </div>

        {/* Nose bridge */}
        <div className="absolute top-11 left-1/2 -translate-x-1/2 w-px h-2 bg-primary/20" />

        {/* Mouth */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2">
          {speaking ? (
            <div className="flex items-end gap-[1px]">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: '2px', backgroundColor: eyeStyle.color }}
                  animate={{ height: [2, 4 + Math.sin(i * 0.7) * 4, 2] }}
                  transition={{ duration: 0.2 + Math.random() * 0.15, repeat: Infinity, delay: i * 0.03 }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="rounded-full"
              style={{ backgroundColor: eyeStyle.color, width: emotion === 'happy' ? '14px' : '10px', height: '2px' }}
              animate={{
                scaleX: emotion === 'happy' ? [1, 1.1, 1] : emotion === 'concerned' ? [1, 0.8, 1] : 1,
                borderRadius: emotion === 'happy' ? '0 0 8px 8px' : '4px',
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Cheek indicators */}
        <div className="absolute top-12 left-2 w-1 h-1 rounded-full bg-primary/20" />
        <div className="absolute top-12 right-2 w-1 h-1 rounded-full bg-primary/20" />

        {/* Chin/jaw line */}
        <div className="absolute bottom-3 left-4 right-4 h-px bg-primary/15" />

        {/* Side panels (ears) */}
        <motion.div
          className="absolute top-5 -left-0.5 w-1 h-6 rounded-l bg-primary/25"
          animate={{ opacity: listening ? [0.3, 0.8, 0.3] : 0.3 }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-5 -right-0.5 w-1 h-6 rounded-r bg-primary/25"
          animate={{ opacity: listening ? [0.3, 0.8, 0.3] : 0.3 }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
        />

        {/* Neck / lower section */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-primary/5 border-t border-primary/20 rounded-b-lg" />
      </div>

      {/* Floating data particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-primary/60"
          style={{ top: '50%', left: '50%' }}
          animate={{
            x: [0, Math.cos(i * 90 * Math.PI / 180) * 50, 0],
            y: [0, Math.sin(i * 90 * Math.PI / 180) * 50, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}

      {/* Emotion label */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
        <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: eyeStyle.color }}>
          {emotion === 'neutral' ? 'ONLINE' : emotion.toUpperCase()}
        </span>
      </div>
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
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
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
        ? `Welcome back, General. Cortana here. I'm tracking ${criticalCount} critical situation${criticalCount > 1 ? 's' : ''} that need your attention. I've prepared a full briefing whenever you're ready. Just say the word.`
        : `Good to see you, General. Cortana online and fully operational. All global monitoring systems are green. I'm ready to assist with anything — analysis, tracking, threat assessment, or just a conversation. What's on your mind?`;
      setAiResponse(greeting);
      setEmotion(criticalCount > 0 ? 'concerned' : 'happy');
      if (!muted) {
        setSpeaking(true);
        speak(greeting, () => setSpeaking(false));
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasGreeted, alerts, muted]);

  // Alert voice notifications
  useEffect(() => {
    if (muted) return;
    alerts.filter(a => a.severity === 'critical' && !a.acknowledged && !spokenAlerts.current.has(a.id)).forEach(alert => {
      spokenAlerts.current.add(alert.id);
      if (!hasGreeted) return;
      setTimeout(() => {
        setEmotion('alert');
        setSpeaking(true);
        speak(`General, incoming alert: ${alert.title}`, () => { setSpeaking(false); setEmotion('neutral'); });
      }, 500);
    });
  }, [alerts, muted, hasGreeted]);

  // Process command via AI backend with conversation history
  const processCommand = useCallback(async (command: string) => {
    setProcessing(true);
    setEmotion('thinking');
    setAiResponse('');

    const context = getContext?.() || '';
    const alertContext = alerts.filter(a => !a.acknowledged).slice(0, 8)
      .map(a => `[${a.severity.toUpperCase()}] ${a.title}: ${a.description}`).join('\n');

    // Add user message to conversation
    const updatedConvo = [...conversation, { role: 'user' as const, content: command }];

    try {
      const { data, error } = await supabase.functions.invoke('cortana-command', {
        body: {
          command,
          context: `Active alerts:\n${alertContext}\n\nDashboard state: ${context}\n\nTimestamp: ${new Date().toISOString()}`,
          conversationHistory: updatedConvo.slice(-10),
        },
      });

      if (error) throw error;

      const { text, emotion: aiEmotion, actions } = data as { text: string; emotion: Emotion; actions: CortanaAction[] };
      setAiResponse(text);
      setEmotion(aiEmotion || 'neutral');

      // Update conversation history
      setConversation([...updatedConvo, { role: 'assistant', content: text }]);

      if (!muted) {
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
      }

      // Execute actions
      if (actions?.length) {
        for (const action of actions) {
          onAction?.(action);
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } catch (e) {
      console.error('Cortana error:', e);
      const fallback = "Having a brief connection issue, General. Let me try a local approach.";
      setAiResponse(fallback);
      setEmotion('concerned');
      if (!muted) {
        setSpeaking(true);
        speak(fallback, () => setSpeaking(false));
      }
      handleLocalCommand(command);
    } finally {
      setProcessing(false);
    }
  }, [alerts, muted, onAction, getContext, conversation]);

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
          setEmotion('happy');
          if (!muted) {
            setSpeaking(true);
            speak("I'm here, General. What do you need?", () => setSpeaking(false));
          }
          setAiResponse("Listening...");
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
        className="fixed bottom-4 right-4 z-[100] w-14 h-14 rounded-full border flex items-center justify-center backdrop-blur-sm transition-colors"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(var(--card) / 0.8) 100%)`,
          borderColor: `hsl(var(--primary) / 0.4)`,
          boxShadow: `0 0 25px hsl(var(--primary) / 0.3), 0 4px 15px hsl(0 0% 0% / 0.3)`,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Mini robot face on button */}
        <div className="relative w-6 h-7">
          <div className="absolute top-1 left-0 right-0 flex justify-center gap-2">
            <motion.div className="w-1.5 h-1 rounded-full bg-primary"
              animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.div className="w-1.5 h-1 rounded-full bg-primary"
              animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} />
          </div>
          <motion.div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-primary/60"
            animate={{ scaleX: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
        {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[8px] font-mono flex items-center justify-center text-destructive-foreground animate-pulse">
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
            className="fixed bottom-20 right-4 z-[100] w-80 bg-card/95 border rounded-lg overflow-hidden backdrop-blur-md"
            style={{
              borderColor: 'hsl(var(--primary) / 0.25)',
              boxShadow: '0 8px 40px hsl(0 0% 0% / 0.6), 0 0 40px hsl(var(--primary) / 0.12)',
            }}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-primary/5">
              <div className="relative w-2 h-2">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              </div>
              <span className="font-mono text-xs font-semibold text-foreground tracking-wide">CORTANA</span>
              <span className="text-[7px] text-muted-foreground font-mono px-1 py-0.5 rounded bg-muted/30 border border-border/50">AI v6.0</span>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setMuted(!muted)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  {muted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-neon-cyan" />}
                </button>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`p-1 rounded transition-colors ${listening ? 'bg-neon-red/20 text-neon-red' : 'hover:bg-muted/50 text-muted-foreground'}`}
                >
                  {listening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setVisible(false)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Hologram + Response */}
            <div className="p-3 max-h-64 overflow-y-auto">
              <RobotHologram emotion={emotion} speaking={speaking} listening={listening && activated} />

              {processing && (
                <div className="flex items-center justify-center gap-2 my-2">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  <span className="text-[9px] text-primary font-mono animate-pulse">ANALYZING...</span>
                </div>
              )}

              {aiResponse && !processing && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-foreground leading-relaxed mt-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[8px] text-primary font-mono uppercase tracking-wider">CORTANA</span>
                  </div>
                  <div className="pl-4 border-l-2 border-primary/20">{aiResponse}</div>
                </motion.div>
              )}
            </div>

            {/* Voice status */}
            {listening && (
              <div className="px-3 py-2 border-t border-border bg-muted/10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} className="w-0.5 bg-neon-cyan rounded-full"
                        animate={{ height: activated ? [4, 14, 4] : [3, 6, 3] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {activated ? 'LISTENING...' : 'Say "Hey Cortana"'}
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
                placeholder="Ask me anything..."
                className="flex-1 bg-muted/20 border border-border/50 rounded px-2 py-1.5 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                disabled={processing}
              />
              <button
                type="submit"
                disabled={processing || !textInput.trim()}
                className="p-1.5 rounded bg-primary/20 hover:bg-primary/30 transition-colors disabled:opacity-20"
              >
                {processing ? <Loader2 className="w-3 h-3 text-primary animate-spin" /> : <Send className="w-3 h-3 text-primary" />}
              </button>
            </form>

            {/* Quick commands */}
            <div className="px-3 py-2 border-t border-border">
              <div className="text-[7px] text-muted-foreground font-mono uppercase mb-1.5 tracking-wider">Quick Commands</div>
              <div className="flex flex-wrap gap-1">
                {[
                  'Brief me on threats',
                  'Zoom to Middle East',
                  'Track military jets',
                  'Open CCTV feeds',
                  'Global situation report',
                  'Show naval assets',
                  'What should I know?',
                  'Analyze patterns',
                ].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => processCommand(cmd)}
                    disabled={processing}
                    className="px-1.5 py-0.5 text-[7px] font-mono bg-muted/20 border border-border/40 rounded hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all disabled:opacity-20"
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
