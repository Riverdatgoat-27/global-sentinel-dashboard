import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, Loader2, MessageSquare, Brain } from 'lucide-react';
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

const WAKE_WORDS = ['hey cortana', 'cortana', 'hey cortanna'];
const SILENCE_TIMEOUT = 3500;
const MEMORY_KEY = 'cortana_memory';

// ===== Persistent Memory =====
function loadMemory(): ConversationMessage[] {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveMemory(messages: ConversationMessage[]) {
  try {
    // Keep last 50 messages for long-term memory
    localStorage.setItem(MEMORY_KEY, JSON.stringify(messages.slice(-50)));
  } catch {}
}

// ===== Speech Synthesis =====
let cachedVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });
}

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;
  const priorities = [
    'Microsoft Jenny Online', 'Microsoft Aria Online', 'Google UK English Female',
    'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria', 'Allison', 'Ava',
    'Microsoft Zira', 'Google US English',
  ];
  for (const name of priorities) {
    const found = voices.find(v => v.name.includes(name));
    if (found) { cachedVoice = found; return found; }
  }
  const enFemale = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
  if (enFemale) { cachedVoice = enFemale; return enFemale; }
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
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    if (voice) utterance.voice = voice;

    utterance.onend = () => { idx++; setTimeout(speakNext, 120); };
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
  const [conversation, setConversation] = useState<ConversationMessage[]>(loadMemory);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const spokenAlerts = useRef<Set<string>>(new Set());
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCommandRef = useRef<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const listeningRef = useRef(false);
  const activatedRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep activatedRef in sync
  useEffect(() => { activatedRef.current = activated; }, [activated]);

  useEffect(() => {
    if ('speechSynthesis' in window) loadVoices();
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setVoiceSupported(false);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, aiResponse]);

  // Save conversation to memory
  useEffect(() => {
    if (conversation.length > 0) saveMemory(conversation);
  }, [conversation]);

  // Welcome
  useEffect(() => {
    if (hasGreeted) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      setVisible(true);
      const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
      const prevMsgs = loadMemory();
      const returningUser = prevMsgs.length > 2;
      const greeting = returningUser
        ? (criticalCount > 0
          ? `Welcome back, General. I remember our last conversation. I'm tracking ${criticalCount} critical situations requiring your attention.`
          : `Good to see you again, General. Cortana online with full memory intact. All systems nominal. Say "Hey Cortana" or type a command.`)
        : (criticalCount > 0
          ? `Welcome, General. Cortana online. I'm tracking ${criticalCount} critical situations. Say "Hey Cortana" or type a command anytime.`
          : `Welcome, General. Cortana online. All systems green. I'm always listening — just say "Hey Cortana" to activate me.`);
      setAiResponse(greeting);
      setConversation(prev => [...prev, { role: 'assistant', content: greeting, timestamp: Date.now() }]);
      setEmotion(criticalCount > 0 ? 'concerned' : 'happy');
      if (!muted) { setSpeaking(true); speak(greeting, () => setSpeaking(false)); }
    }, 2000);
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
          conversationHistory: updatedConvo.slice(-20).map(m => ({ role: m.role, content: m.content })),
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
      if (pendingCommandRef.current.length > 2 && activatedRef.current) {
        processCommand(pendingCommandRef.current);
        setActivated(false);
        activatedRef.current = false;
        setTranscript('');
        pendingCommandRef.current = '';
      }
    }, SILENCE_TIMEOUT);
  }, [processCommand]);

  const startListening = useCallback(() => {
    if (listeningRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t; else interim += t;
      }
      const full = (final + interim).toLowerCase().trim();
      setTranscript(full);

      // Check for wake word
      const wakeDetected = WAKE_WORDS.some(w => full.includes(w));

      if (wakeDetected || activatedRef.current) {
        let commandPart = full;
        // Strip wake word from command
        for (const w of WAKE_WORDS) {
          const idx = full.indexOf(w);
          if (idx >= 0) {
            commandPart = full.substring(idx + w.length).trim();
            break;
          }
        }

        if (!activatedRef.current && wakeDetected) {
          setActivated(true);
          activatedRef.current = true;
          setVisible(true);
          setEmotion('happy');
          if (!muted) { setSpeaking(true); speak("I'm here, General.", () => setSpeaking(false)); }
          setAiResponse("Listening... speak your command.");
          if (commandPart.length > 2) resetSilenceTimer(commandPart);
        } else if (activatedRef.current && commandPart.length > 2) {
          resetSilenceTimer(commandPart);
        }
      }
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech error:', e.error);
      if (e.error === 'not-allowed') {
        setVoiceSupported(false);
        setListening(false);
        listeningRef.current = false;
        return;
      }
    };

    recognition.onend = () => {
      // Auto-restart if we should still be listening
      if (listeningRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (listeningRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch {}
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      listeningRef.current = true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setVoiceSupported(false);
    }
  }, [muted, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    setListening(false);
    listeningRef.current = false;
    setActivated(false);
    activatedRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // Auto-start listening when panel opens
  useEffect(() => {
    if (visible && !listening && voiceSupported) startListening();
  }, [visible]);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || processing) return;
    processCommand(textInput.trim());
    setTextInput('');
  }, [textInput, processing, processCommand]);

  const clearMemory = useCallback(() => {
    localStorage.removeItem(MEMORY_KEY);
    setConversation([]);
    setAiResponse('Memory cleared, General. Starting fresh.');
    if (!muted) speak('Memory cleared, General. Starting fresh.');
  }, [muted]);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <>
      {/* Walking hologram overlay */}
      <CortanaOverlay
        emotion={emotion}
        speaking={speaking}
        listening={listening && activated}
        visible={hasGreeted}
      />

      {/* Floating button */}
      <motion.button
        onClick={() => setVisible(!visible)}
        className="fixed bottom-4 right-4 z-[100] w-12 h-12 rounded-full border flex items-center justify-center backdrop-blur-sm transition-colors"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(var(--card) / 0.8) 100%)`,
          borderColor: `hsl(var(--primary) / 0.4)`,
          boxShadow: `0 0 20px hsl(var(--primary) / 0.3), 0 4px 12px hsl(0 0% 0% / 0.3)`,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-5 h-5 text-primary" />
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
            className="fixed bottom-18 right-4 z-[100] w-80 bg-card/95 border rounded-lg overflow-hidden backdrop-blur-md"
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
              <span className="text-[7px] text-muted-foreground font-mono px-1 py-0.5 rounded bg-muted/30 border border-border/50">AI</span>
              {listening && (
                <span className="text-[7px] text-neon-cyan font-mono px-1 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20 animate-pulse">
                  🎤 {activated ? 'ACTIVE' : 'LISTENING'}
                </span>
              )}
              {!voiceSupported && (
                <span className="text-[7px] text-neon-amber font-mono px-1 py-0.5 rounded bg-neon-amber/10 border border-neon-amber/20">
                  TEXT ONLY
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
                {voiceSupported && (
                  <button onClick={listening ? stopListening : startListening}
                    className={`p-1 rounded transition-colors ${listening ? 'bg-neon-red/20 text-neon-red' : 'hover:bg-muted/50 text-muted-foreground'}`}>
                    {listening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button onClick={() => setVisible(false)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-64 overflow-y-auto">
              {showHistory ? (
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] text-muted-foreground font-mono">{conversation.length} MESSAGES</span>
                    <button onClick={clearMemory} className="text-[8px] text-destructive font-mono hover:underline">CLEAR MEMORY</button>
                  </div>
                  {conversation.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center py-4 font-mono">No conversation yet</p>
                  )}
                  {conversation.slice(-20).map((msg, i) => (
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
                      <span className="text-[9px] text-primary font-mono animate-pulse">DEEP ANALYSIS...</span>
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
                    {activated ? '🔴 SPEAK NOW • auto-executes on silence' : 'Say "Hey Cortana" to activate'}
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
                  'Situation report',
                  'Brief me on threats',
                  'Zoom to Middle East',
                  'Show all aircraft',
                  'Track submarines',
                  'Nuclear status',
                  'Active wars?',
                  'Open CCTV feeds',
                  'Financial markets',
                  'Analyze cyber threats',
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
