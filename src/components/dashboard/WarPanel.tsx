import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, MapPin, Users, ChevronDown, ChevronUp, AlertTriangle, Shield, Clock, Globe } from 'lucide-react';
import type { ActiveConflict } from '@/hooks/useRealTimeNews';

const statusColor: Record<string, string> = {
  active: 'text-neon-red',
  escalating: 'text-neon-amber animate-pulse',
  ceasefire: 'text-neon-green',
  frozen: 'text-muted-foreground',
};
const statusBg: Record<string, string> = {
  active: 'bg-neon-red/10 border-neon-red/30',
  escalating: 'bg-neon-amber/10 border-neon-amber/30',
  ceasefire: 'bg-neon-green/10 border-neon-green/30',
  frozen: 'bg-muted/10 border-border',
};

const NATO_MEMBERS = [
  'USA','UK','France','Germany','Canada','Italy','Spain','Poland','Turkey','Netherlands',
  'Belgium','Norway','Denmark','Portugal','Czech Republic','Romania','Bulgaria','Hungary',
  'Slovakia','Slovenia','Croatia','Albania','Montenegro','North Macedonia','Latvia','Lithuania',
  'Estonia','Iceland','Luxembourg','Greece','Finland','Sweden',
];

const ALLIANCES = [
  { name: 'NATO', members: 32, type: 'Military Alliance', leader: 'USA', budget: '$1.2T combined', color: 'text-neon-cyan' },
  { name: 'CSTO', members: 6, type: 'Military Alliance', leader: 'Russia', budget: '$80B combined', color: 'text-neon-red' },
  { name: 'Five Eyes', members: 5, type: 'Intelligence Alliance', leader: 'USA/UK', budget: 'Classified', color: 'text-neon-green' },
  { name: 'QUAD', members: 4, type: 'Strategic Partnership', leader: 'USA/India', budget: 'N/A', color: 'text-neon-amber' },
  { name: 'AUKUS', members: 3, type: 'Security Pact', leader: 'USA/UK/AU', budget: 'Nuclear subs focused', color: 'text-primary' },
  { name: 'SCO', members: 9, type: 'Political/Security', leader: 'China/Russia', budget: 'N/A', color: 'text-neon-red' },
  { name: 'Arab League', members: 22, type: 'Political/Military', leader: 'Saudi Arabia/Egypt', budget: 'Varies', color: 'text-neon-amber' },
];

interface Props {
  conflicts: ActiveConflict[];
  onNavigate?: (lat: number, lng: number) => void;
}

export default function WarPanel({ conflicts, onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'conflicts' | 'nato' | 'timeline'>('conflicts');

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Swords className="w-3.5 h-3.5 text-neon-red" />
        Wars & Alliances
        <span className="ml-auto flex items-center gap-1">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-neon-red" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <span className="text-[9px] text-neon-red font-mono">{conflicts.length} ACTIVE</span>
        </span>
      </div>
      <div className="flex border-b border-border bg-card/50">
        {(['conflicts', 'nato', 'timeline'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-2 py-1 text-[8px] font-mono uppercase tracking-wider transition-all ${
              tab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'conflicts' ? '⚔️ WARS' : t === 'nato' ? '🛡️ NATO' : '📅 TIMELINE'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'conflicts' && conflicts.map((conflict, i) => (
          <motion.div key={conflict.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`border-b border-border ${expandedId === conflict.id ? 'bg-muted/20' : ''}`}>
            <div className="px-2.5 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === conflict.id ? null : conflict.id)}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${statusColor[conflict.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground truncate">{conflict.name}</span>
                    <span className={`text-[7px] font-mono uppercase px-1 py-0.5 rounded border ${statusBg[conflict.status]} ${statusColor[conflict.status]}`}>
                      {conflict.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{conflict.region}</span>
                    <span>Since {conflict.startYear}</span>
                  </div>
                </div>
                <button className="p-0.5 text-muted-foreground" onClick={(e) => { e.stopPropagation(); onNavigate?.(conflict.lat, conflict.lng); }}>
                  <MapPin className="w-3 h-3 hover:text-primary transition-colors" />
                </button>
                {expandedId === conflict.id ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
            <AnimatePresence>
              {expandedId === conflict.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-3 pb-2.5 space-y-1.5">
                    <p className="text-[9px] text-foreground/80 leading-relaxed">{conflict.description}</p>
                    <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                      <Users className="w-2.5 h-2.5" />
                      <span className="font-mono">Parties: {conflict.parties.join(' vs ')}</span>
                    </div>
                    {conflict.allies && (
                      <div className="text-[8px] text-neon-cyan font-mono">
                        <Shield className="w-2.5 h-2.5 inline mr-1" />
                        Allies: {conflict.allies.join(', ')}
                      </div>
                    )}
                    <div className="text-[8px] text-neon-red font-mono">Casualties: {conflict.casualties}</div>
                    {conflict.timeline && (
                      <div className="space-y-0.5 mt-1">
                        <span className="text-[7px] text-muted-foreground font-mono">TIMELINE:</span>
                        {conflict.timeline.map((evt, j) => (
                          <div key={j} className="flex items-start gap-1.5 text-[8px]">
                            <span className="text-neon-amber font-mono shrink-0">{evt.date}</span>
                            <span className="text-foreground/70">{evt.event}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-muted-foreground font-mono">RECENT EVENTS:</span>
                      {conflict.recentEvents.map((event, j) => (
                        <div key={j} className="flex items-start gap-1 text-[9px] text-foreground/70">
                          <span className="text-neon-amber">•</span><span>{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {tab === 'nato' && (
          <div className="space-y-0">
            {ALLIANCES.map((alliance, i) => (
              <motion.div key={alliance.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="px-2.5 py-2 border-b border-border hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className={`w-3.5 h-3.5 ${alliance.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-foreground">{alliance.name}</span>
                      <span className="text-[7px] font-mono text-muted-foreground px-1 rounded bg-muted/30">{alliance.members} members</span>
                    </div>
                    <div className="text-[8px] text-muted-foreground font-mono mt-0.5">
                      {alliance.type} • Led by {alliance.leader} • {alliance.budget}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="px-2.5 py-2 border-b border-border">
              <div className="text-[8px] font-mono text-neon-cyan mb-1">NATO MEMBERS ({NATO_MEMBERS.length}):</div>
              <div className="flex flex-wrap gap-0.5">
                {NATO_MEMBERS.map(m => (
                  <span key={m} className="text-[7px] font-mono px-1 py-0.5 bg-neon-cyan/5 border border-neon-cyan/20 rounded text-foreground/70">{m}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="p-2 space-y-0">
            {conflicts.flatMap(c =>
              (c.timeline || []).map(t => ({ ...t, conflict: c.name, status: c.status }))
            ).sort((a, b) => b.date.localeCompare(a.date)).map((evt, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex gap-2 py-1.5 border-b border-border/50">
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-amber shrink-0" />
                  {i < 20 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-mono text-neon-amber">{evt.date}</span>
                    <span className="text-[7px] font-mono text-muted-foreground truncate">{evt.conflict}</span>
                  </div>
                  <p className="text-[9px] text-foreground/80 mt-0.5">{evt.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
