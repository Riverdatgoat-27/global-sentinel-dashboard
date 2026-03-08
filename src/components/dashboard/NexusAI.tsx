import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CortanaOverlay from './CortanaOverlay';
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
  timestamp: number;
}

interface Props {
  alerts: AlertNotification[];
  onCommand?: (command: string) => void;
  onAction?: (action: CortanaAction) => void;
  getContext?: () => string;
}

type Emotion = 'neutral' | 'alert' | 'thinking' | 'happy' | 'concerned' | 'serious';

const WAKE_WORD = 'hey cortana';
const SILENCE_TIMEOUT = 4000;

// ===== Speech Synthesis =====
let cachedVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;
  const priorities = [
    'Microsoft Jenny Online', 'Microsoft Aria Online', 'Google UK English Female',
    'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria', 'Allison', 'Ava',
  ];
  for (const name of priorities) {
    const found = voices.find(v => v.name.includes(name));
    if (found) { cachedVoice = found; return found; }
  }
  const fallback = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  cachedVoice = fallback;
  return fallback;
}

function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  
  const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').replace(/\{[^}]*\}/g, '').replace(/\[.*?\]/g, '').trim();
  if (!cleanText) { onEnd?.(); return; }
  
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  let idx = 0;
  
  const speakNext = async () => {
    if (idx >= sentences.length) { onEnd?.(); return; }
    const sentence = sentences[idx].trim();
    if (!sentence) { idx++; speakNext(); return; }
    
    const voices = await loadVoices();
    const voice = selectBestVoice(voices);
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 0.95;
    utterance.pitch = 1.08;
    utterance.volume = 1.0;
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => { idx++; setTimeout(speakNext, 150); };
    utterance.onerror = () => { idx++; speakNext(); };
    window.speechSynthesis.speak(utterance);
  };
  
  speakNext();
  
  // Chrome keepalive
  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 10000);
}

// ===== Main Component =====
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
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);
  const spokenAlerts = useRef<Set<string>>(new Set());
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCommandRef = useRef<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    if ('speechSynthesis' in window) loadVoices();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, aiResponse]);

  // Welcome
  useEffect(() => {
    if (hasGreeted) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      setVisible(true);
      const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
      const greeting = criticalCount > 0
        ? `Welcome back, General. Cortana online. I'm tracking ${criticalCount} critical situations. Say "Hey Cortana" or type a command anytime.`
        : `Good to see you, General. Cortana online. All systems green. I'm always listening — just say "Hey Cortana" to activate me.`;
      setAiResponse(greeting);
      setConversation([{ role: 'assistant', content: greeting, timestamp: Date.now() }]);
      setEmotion(criticalCount > 0 ? 'concerned' : 'happy');
      if (!muted) { setSpeaking(true); speak(greeting, () => setSpeaking(false)); }
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasGreeted, alerts, muted]);

  // Alert voice notifications
  useEffect(() => {
    if (muted || !hasGreeted) return;
    alerts.filter(a => a.severity === 'critical' && !a.acknowledged && !spokenAlerts.current.has(a.id)).forEach(alert => {
      spokenAlerts.current.add(alert.id);
      setTimeout(() => {
        setEmotion('alert');
        setSpeaking(true);
        speak(`General, incoming alert. ${alert.title}.`, () => { setSpeaking(false); setEmotion('neutral'); });
      }, 500);
    });
  }, [alerts, muted, hasGreeted]);

  const processCommand = useCallback(async (command: string) => {
    setProcessing(true);
    setEmotion('thinking');
    setAiResponse('');

    const userMsg: ConversationMessage = { role: 'user', content: command, timestamp: Date.now() };
    const updatedConvo = [...conversation, userMsg];
    setConversation(updatedConvo);

    const context = getContext?.() || '';
    const alertContext = alerts.filter(a => !a.acknowledged).slice(0, 8)
      .map(a => `[${a.severity.toUpperCase()}] ${a.title}: ${a.description}`).join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('cortana-command', {
        body: {
          command,
          context: `Active alerts:\n${alertContext}\n\nDashboard state: ${context}\n\nTimestamp: ${new Date().toISOString()}`,
          conversationHistory: updatedConvo.slice(-12).map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      const { text, emotion: aiEmotion, actions } = data as { text: string; emotion: Emotion; actions: CortanaAction[] };
      const assistantMsg: ConversationMessage = { role: 'assistant', content: text, timestamp: Date.now() };
      setAiResponse(text);
      setEmotion(aiEmotion || 'neutral');
      setConversation(prev => [...prev, assistantMsg]);

      if (!muted) { setSpeaking(true); speak(text, () => setSpeaking(false)); }

      if (actions?.length) {
        for (const action of actions) {
          onAction?.(action);
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } catch (e) {
      console.error('Cortana error:', e);
      const fallback = "Experiencing a brief connection issue, General. Standing by.";
      setAiResponse(fallback);
      setEmotion('concerned');
      setConversation(prev => [...prev, { role: 'assistant', content: fallback, timestamp: Date.now() }]);
      if (!muted) { setSpeaking(true); speak(fallback, () => setSpeaking(false)); }
    } finally {
      setProcessing(false);
    }
  }, [alerts, muted, onAction, getContext, conversation]);

  const resetSilenceTimer = useCallback((commandSoFar: string) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    pendingCommandRef.current = commandSoFar;
    silenceTimerRef.current = setTimeout(() => {
      if (pendingCommandRef.current.length > 3 && activated) {
        processCommand(pendingCommandRef.current);
        setActivated(false);
        setTranscript('');
        pendingCommandRef.current = '';
      }
    }, SILENCE_TIMEOUT);
  }, [activated, processCommand]);

  const startListening = useCallback(() => {
    if (listeningRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { console.warn('Speech recognition not available'); return; }
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
        let commandPart = full;
        const wakeIdx = full.indexOf(WAKE_WORD);
        if (wakeIdx >= 0) commandPart = full.substring(wakeIdx + WAKE_WORD.length).trim();

        if (!activated && full.includes(WAKE_WORD)) {
          setActivated(true);
          setVisible(true);
          setEmotion('happy');
          if (!muted) { setSpeaking(true); speak("I'm here, General.", () => setSpeaking(false)); }
          setAiResponse("Listening... speak your command.");
          if (commandPart.length > 3) resetSilenceTimer(commandPart);
        } else if (activated && commandPart.length > 3) {
          resetSilenceTimer(commandPart);
        }
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech error:', e.error);
      }
    };
    recognition.onend = () => {
      if (listeningRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      listeningRef.current = true;
    } catch {}
  }, [activated, muted, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    setListening(false);
    listeningRef.current = false;
    setActivated(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // Auto-start listening
  useEffect(() => {
    if (visible && !listening) startListening();
  }, [visible]);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || processing) return;
    processCommand(textInput.trim());
    setTextInput('');
  }, [textInput, processing, processCommand]);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <>
      {/* Walking hologram overlay - always visible */}
      <CortanaOverlay
        emotion={emotion}
        speaking={speaking}
        listening={listening && activated}
        visible={hasGreeted}
      />

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
        <div className="relative w-6 h-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-primary/60" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-5 h-4 rounded-t-lg border-x border-t border-primary/40" />
          <motion.div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
        {criticalCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[8px] font-mono flex items-center justify-center text-destructive-foreground animate-pulse">
            {criticalCount}
          </span>
        )}
        {listening && (
          <motion.div className="absolute inset-0 rounded-full border-2 border-neon-cyan/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }} />
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
              <motion.div className="w-2 h-2 rounded-full bg-neon-green"
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="font-mono text-xs font-semibold text-foreground tracking-wide">CORTANA</span>
              <span className="text-[7px] text-muted-foreground font-mono px-1 py-0.5 rounded bg-muted/30 border border-border/50">v8.0</span>
              {listening && (
                <span className="text-[7px] text-neon-cyan font-mono px-1 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20 animate-pulse">
                  🎤 LIVE
                </span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setShowHistory(!showHistory)}
                  className={`p-1 rounded transition-colors ${showHistory ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50 text-muted-foreground'}`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setMuted(!muted)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  {muted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-neon-cyan" />}
                </button>
                <button onClick={listening ? stopListening : startListening}
                  className={`p-1 rounded transition-colors ${listening ? 'bg-neon-red/20 text-neon-red' : 'hover:bg-muted/50 text-muted-foreground'}`}>
                  {listening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setVisible(false)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-60 overflow-y-auto">
              {showHistory ? (
                <div className="p-2 space-y-2">
                  {conversation.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center py-4 font-mono">No conversation yet</p>
                  )}
                  {conversation.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary/15 text-foreground border border-primary/20'
                          : 'bg-muted/30 text-foreground border border-border/50'
                      }`}>
                        <div className="text-[7px] font-mono uppercase text-muted-foreground mb-0.5">
                          {msg.role === 'user' ? 'YOU' : 'CORTANA'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              ) : (
                <div className="p-3">
                  {processing && (
                    <div className="flex items-center justify-center gap-2 my-2">
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      <span className="text-[9px] text-primary font-mono animate-pulse">ANALYZING...</span>
                    </div>
                  )}
                  {aiResponse && !processing && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-foreground leading-relaxed">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[8px] text-primary font-mono uppercase tracking-wider">CORTANA</span>
                        {speaking && <span className="text-[7px] text-neon-cyan font-mono animate-pulse">♪ SPEAKING</span>}
                      </div>
                      <div className="pl-4 border-l-2 border-primary/20">{aiResponse}</div>
                    </motion.div>
                  )}
                </div>
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
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {activated ? 'SPEAK NOW • 4s silence = execute' : 'Say "Hey Cortana" to activate'}
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
                placeholder="Ask Cortana anything..."
                className="flex-1 bg-muted/20 border border-border/50 rounded px-2 py-1.5 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                disabled={processing}
              />
              <button type="submit" disabled={processing || !textInput.trim()}
                className="p-1.5 rounded bg-primary/20 hover:bg-primary/30 transition-colors disabled:opacity-20">
                {processing ? <Loader2 className="w-3 h-3 text-primary animate-spin" /> : <Send className="w-3 h-3 text-primary" />}
              </button>
            </form>

            {/* Quick commands */}
            <div className="px-3 py-2 border-t border-border">
              <div className="text-[7px] text-muted-foreground font-mono uppercase mb-1.5 tracking-wider">Quick Commands</div>
              <div className="flex flex-wrap gap-1">
                {[
                  'Brief me on threats',
                  'Global situation report',
                  'Zoom to Middle East',
                  'Show all aircraft',
                  'Show naval assets',
                  'Track submarines',
                  'Nuclear arsenal status',
                  'What wars are active?',
                  'Financial markets update',
                  'Open CCTV feeds',
                ].map(cmd => (
                  <button key={cmd} onClick={() => processCommand(cmd)} disabled={processing}
                    className="px-1.5 py-0.5 text-[7px] font-mono bg-muted/20 border border-border/40 rounded hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all disabled:opacity-20">
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
