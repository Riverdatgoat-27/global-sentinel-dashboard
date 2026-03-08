import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, Loader2, MessageSquare } from 'lucide-react';
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
const SILENCE_TIMEOUT = 5000;

// ===== Robust Speech with voice preloading =====
let voicesLoaded = false;
let cachedVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      const v = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(v);
    };
    // Fallback timeout
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;
  
  // Priority: high-quality natural voices
  const priorities = [
    'Microsoft Jenny Online', 'Microsoft Aria Online', 'Microsoft Zira Desktop',
    'Microsoft Zira', 'Google UK English Female', 'Google US English',
    'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria',
    'Allison', 'Ava', 'Susan', 'Zira',
  ];
  
  for (const name of priorities) {
    const found = voices.find(v => v.name.includes(name));
    if (found) { cachedVoice = found; return found; }
  }
  
  // Fallback: any English female-sounding voice
  const englishFemale = voices.find(v => v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')));
  if (englishFemale) { cachedVoice = englishFemale; return englishFemale; }
  
  const anyEnglish = voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male'));
  if (anyEnglish) { cachedVoice = anyEnglish; return anyEnglish; }
  
  const fallback = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  cachedVoice = fallback;
  return fallback;
}

async function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Ensure voices are loaded
  const voices = await loadVoices();
  if (!voices.length) { 
    console.warn('No speech voices available');
    onEnd?.(); 
    return; 
  }
  
  const voice = selectBestVoice(voices);
  
  // Clean text - remove markdown and JSON artifacts
  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();
  
  if (!cleanText) { onEnd?.(); return; }
  
  // Split into sentences for natural pauses
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  let idx = 0;
  
  const speakNext = () => {
    if (idx >= sentences.length) { onEnd?.(); return; }
    
    const sentence = sentences[idx].trim();
    if (!sentence) { idx++; speakNext(); return; }
    
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 0.93;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => {
      idx++;
      // Natural pause between sentences
      setTimeout(speakNext, 180 + Math.random() * 220);
    };
    
    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      idx++;
      speakNext();
    };
    
    // Chrome bug workaround: speechSynthesis can pause after ~15s
    // Resume periodically
    window.speechSynthesis.speak(utterance);
  };
  
  // Chrome workaround: keep synthesis alive
  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      clearInterval(keepAlive);
      return;
    }
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 10000);
  
  speakNext();
  
  // Cleanup keepAlive when done
  const checkDone = setInterval(() => {
    if (!window.speechSynthesis.speaking && idx >= sentences.length) {
      clearInterval(keepAlive);
      clearInterval(checkDone);
    }
  }, 500);
}

// ===== Human-Like Holographic Figure =====
function HumanHologram({ emotion, speaking, listening }: { emotion: Emotion; speaking: boolean; listening: boolean }) {
  const getColor = () => {
    switch (emotion) {
      case 'alert': return 'var(--neon-red)';
      case 'thinking': return 'var(--neon-amber)';
      case 'happy': return 'var(--neon-green)';
      case 'concerned': return 'var(--neon-amber)';
      case 'serious': return 'var(--primary)';
      default: return 'var(--primary)';
    }
  };
  const c = getColor();
  const hsl = (opacity: number) => `hsl(${c} / ${opacity})`;

  return (
    <div className="relative w-28 h-36 mx-auto mb-2 select-none">
      {/* Holographic platform */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full"
        style={{ background: `radial-gradient(ellipse, ${hsl(0.3)} 0%, transparent 80%)` }}
        animate={{ scaleX: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Scan lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-px"
            style={{ top: `${i * 5.5}%`, background: hsl(0.5) }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </div>

      {/* Body glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${hsl(0.08)} 0%, transparent 60%)`,
          boxShadow: `0 0 50px ${hsl(0.15)}, 0 0 100px ${hsl(0.05)}`,
        }}
        animate={{
          opacity: speaking ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
          scale: speaking ? [1, 1.02, 1] : 1,
        }}
        transition={{ duration: speaking ? 0.5 : 3, repeat: Infinity }}
      />

      {/* HEAD */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-16">
        <div className="absolute inset-0 rounded-t-full rounded-b-[40%] border overflow-hidden"
          style={{ borderColor: hsl(0.3), background: `linear-gradient(180deg, ${hsl(0.08)} 0%, ${hsl(0.03)} 100%)` }}>
          <div className="absolute top-0 left-2 right-2 h-4 rounded-t-full" style={{ background: hsl(0.06) }} />
          <motion.div
            className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ backgroundColor: hsl(0.6) }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Eyes */}
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-3">
            {[0, 1].map(eye => (
              <div key={eye} className="relative w-3 h-2.5">
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  animate={{
                    scaleY: emotion === 'happy' ? 0.6 : emotion === 'thinking' ? 0.4 : emotion === 'alert' ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: hsl(0.9), boxShadow: `0 0 6px ${hsl(0.8)}` }}
                    animate={{
                      x: emotion === 'thinking' ? [0, 1.5, 0, -1.5, 0] : 0,
                      scale: speaking ? [1, 0.85, 1] : 1,
                    }}
                    transition={{ duration: emotion === 'thinking' ? 4 : 0.4, repeat: Infinity }}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-background/80" />
                </motion.div>
                <motion.div
                  className="absolute -inset-1 rounded-full"
                  style={{ boxShadow: `0 0 8px ${hsl(0.4)}` }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: eye * 0.3 }}
                />
              </div>
            ))}
          </div>

          {/* Eyebrows */}
          <div className="absolute top-4.5 left-0 right-0 flex justify-center gap-5">
            <motion.div className="w-3 h-px rounded-full" style={{ backgroundColor: hsl(0.5) }}
              animate={{ rotate: emotion === 'concerned' ? -8 : emotion === 'alert' ? -5 : emotion === 'happy' ? 3 : 0, y: emotion === 'alert' ? -1 : 0 }}
              transition={{ duration: 0.3 }} />
            <motion.div className="w-3 h-px rounded-full" style={{ backgroundColor: hsl(0.5) }}
              animate={{ rotate: emotion === 'concerned' ? 8 : emotion === 'alert' ? 5 : emotion === 'happy' ? -3 : 0, y: emotion === 'alert' ? -1 : 0 }}
              transition={{ duration: 0.3 }} />
          </div>

          {/* Nose */}
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-px h-1.5" style={{ backgroundColor: hsl(0.15) }} />

          {/* Mouth */}
          <div className="absolute top-11 left-1/2 -translate-x-1/2">
            {speaking ? (
              <div className="flex items-center gap-[1px]">
                {[...Array(7)].map((_, i) => (
                  <motion.div key={i} className="rounded-full"
                    style={{ width: '1.5px', backgroundColor: hsl(0.7) }}
                    animate={{ height: [1.5, 3 + Math.sin(i) * 2.5, 1.5] }}
                    transition={{ duration: 0.15 + i * 0.02, repeat: Infinity, delay: i * 0.03 }} />
                ))}
              </div>
            ) : (
              <motion.div className="rounded-full"
                style={{ backgroundColor: hsl(0.5), width: emotion === 'happy' ? '10px' : '7px', height: '1.5px' }}
                animate={{ borderRadius: emotion === 'happy' ? '0 0 6px 6px' : '3px', scaleX: emotion === 'concerned' ? 0.7 : 1 }}
                transition={{ duration: 0.5 }} />
            )}
          </div>
        </div>
      </div>

      {/* NECK */}
      <div className="absolute top-[66px] left-1/2 -translate-x-1/2 w-4 h-3"
        style={{ background: `linear-gradient(180deg, ${hsl(0.05)}, transparent)` }} />

      {/* SHOULDERS & TORSO */}
      <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-24 h-14">
        <motion.div className="absolute top-0 inset-x-0 h-4 rounded-t-2xl border-t border-x"
          style={{ borderColor: hsl(0.2), background: `linear-gradient(180deg, ${hsl(0.06)} 0%, ${hsl(0.02)} 100%)` }}
          animate={{ y: speaking ? [0, -0.5, 0] : 0 }}
          transition={{ duration: 3, repeat: Infinity }} />

        <motion.div className="absolute top-5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: hsl(0.4), boxShadow: `0 0 12px ${hsl(0.5)}, 0 0 25px ${hsl(0.2)}` }}
          animate={{ scale: speaking ? [1, 1.3, 1] : [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: speaking ? 0.8 : 2, repeat: Infinity }} />

        <div className="absolute top-4 left-2 right-2 bottom-0 rounded-b-lg border-x border-b"
          style={{ borderColor: hsl(0.15), background: `linear-gradient(180deg, ${hsl(0.04)} 0%, transparent 100%)` }}>
          <motion.div className="absolute top-2 left-1 w-0.5 h-4 rounded-full"
            style={{ backgroundColor: hsl(0.3) }} animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.div className="absolute top-2 right-1 w-0.5 h-4 rounded-full"
            style={{ backgroundColor: hsl(0.3) }} animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }} />
        </div>

        {/* Arms */}
        <motion.div className="absolute top-1 -left-1 w-2 h-8 rounded-lg border"
          style={{ borderColor: hsl(0.12), background: hsl(0.03) }}
          animate={{ rotate: speaking ? [0, -2, 0] : 0 }}
          transition={{ duration: 2, repeat: Infinity }} />
        <motion.div className="absolute top-1 -right-1 w-2 h-8 rounded-lg border"
          style={{ borderColor: hsl(0.12), background: hsl(0.03) }}
          animate={{ rotate: speaking ? [0, 2, 0] : 0 }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      </div>

      {/* Listening indicators */}
      {listening && (
        <>
          <motion.div className="absolute top-5 left-2 w-1 h-3 rounded-full"
            style={{ backgroundColor: hsl(0.5) }}
            animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }} />
          <motion.div className="absolute top-5 right-2 w-1 h-3 rounded-full"
            style={{ backgroundColor: hsl(0.5) }}
            animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} />
        </>
      )}

      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="absolute w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: hsl(0.5), top: '40%', left: '50%' }}
          animate={{
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 55, 0],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 55, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.5 }} />
      ))}

      {/* Status */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[6px] font-mono uppercase tracking-[0.2em]" style={{ color: hsl(0.7) }}>
          {emotion === 'neutral' ? '● ONLINE' : `● ${emotion.toUpperCase()}`}
        </span>
      </div>
    </div>
  );
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
  const [autoListen, setAutoListen] = useState(true);
  const recognitionRef = useRef<any>(null);
  const spokenAlerts = useRef<Set<string>>(new Set());
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCommandRef = useRef<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const listeningRef = useRef(false);

  // Pre-load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      loadVoices().then(voices => {
        console.log('Loaded', voices.length, 'voices. Selected:', selectBestVoice(voices)?.name);
      });
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, aiResponse]);

  // Welcome greeting - must be triggered by user interaction for Chrome autoplay
  useEffect(() => {
    if (hasGreeted) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      setVisible(true);
      const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
      const greeting = criticalCount > 0
        ? `Welcome back, General. Cortana here. I'm tracking ${criticalCount} critical situations that need your attention. Ready for a full briefing whenever you are.`
        : `Good to see you, General. Cortana online and fully operational. All systems green. I'm here for anything you need.`;
      setAiResponse(greeting);
      setConversation([{ role: 'assistant', content: greeting, timestamp: Date.now() }]);
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
        speak(`General, incoming alert. ${alert.title}.`, () => { setSpeaking(false); setEmotion('neutral'); });
      }, 500);
    });
  }, [alerts, muted, hasGreeted]);

  // Process command via AI backend
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

      if (!muted) {
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
      }

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

  // Silence timer — 5s then execute
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

        if (!activated && full.includes(WAKE_WORD)) {
          setActivated(true);
          setVisible(true);
          setEmotion('happy');
          if (!muted) {
            setSpeaking(true);
            speak("I'm here, General.", () => setSpeaking(false));
          }
          setAiResponse("Listening... I'll process your command after you finish speaking.");
          if (commandPart.length > 3) {
            resetSilenceTimer(commandPart);
          }
        } else if (activated && commandPart.length > 3) {
          resetSilenceTimer(commandPart);
        }
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => { if (listening) try { recognition.start(); } catch {} };

    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); } catch {}
  }, [activated, muted, listening, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    setListening(false);
    setActivated(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

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
              <span className="text-[7px] text-muted-foreground font-mono px-1 py-0.5 rounded bg-muted/30 border border-border/50">v7.1</span>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setShowHistory(!showHistory)}
                  className={`p-1 rounded transition-colors ${showHistory ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  title="Conversation history">
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

            {/* Content area */}
            <div className="max-h-72 overflow-y-auto">
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
                  <HumanHologram emotion={emotion} speaking={speaking} listening={listening && activated} />

                  {processing && (
                    <div className="flex items-center justify-center gap-2 my-2">
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      <span className="text-[9px] text-primary font-mono animate-pulse">ANALYZING...</span>
                    </div>
                  )}

                  {aiResponse && !processing && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-foreground leading-relaxed mt-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[8px] text-primary font-mono uppercase tracking-wider">CORTANA</span>
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
                    {activated ? 'SPEAK NOW • 5s silence = execute' : 'Say "Hey Cortana"'}
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

            {/* Quick commands - expanded */}
            <div className="px-3 py-2 border-t border-border">
              <div className="text-[7px] text-muted-foreground font-mono uppercase mb-1.5 tracking-wider">Quick Commands</div>
              <div className="flex flex-wrap gap-1">
                {[
                  'Brief me on threats',
                  'Global situation report',
                  'Zoom to Middle East',
                  'Show all aircraft',
                  'Track military jets',
                  'Show naval assets',
                  'Analyze war patterns',
                  'Open CCTV feeds',
                  'Financial markets update',
                  'What wars are active?',
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
