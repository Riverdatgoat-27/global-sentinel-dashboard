import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plane, Ship, Satellite, Navigation, Gauge, Compass, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { AircraftState, SatelliteData, ShipData } from '@/types/intelligence';

interface Props {
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  onSelectAircraft?: (ac: AircraftState) => void;
  onSelectShip?: (ship: ShipData) => void;
  onSelectSatellite?: (sat: SatelliteData) => void;
}

export default function TrackingPanel({ aircraft, satellites, ships, onSelectAircraft, onSelectShip, onSelectSatellite }: Props) {
  const [search, setSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState<'aircraft' | 'ships' | 'satellites' | null>('aircraft');
  const [showAll, setShowAll] = useState(false);

  const filtered = {
    aircraft: aircraft.filter(ac => {
      if (!search) return true;
      const s = search.toLowerCase();
      return ac.callsign?.toLowerCase().includes(s) || ac.originCountry.toLowerCase().includes(s) || ac.icao24.toLowerCase().includes(s) || ac.operator?.toLowerCase().includes(s) || ac.aircraftType?.toLowerCase().includes(s);
    }),
    ships: ships.filter(s => {
      if (!search) return true;
      const term = search.toLowerCase();
      return s.name.toLowerCase().includes(term) || s.country.toLowerCase().includes(term) || s.type.toLowerCase().includes(term);
    }),
    satellites: satellites.filter(s => {
      if (!search) return true;
      const term = search.toLowerCase();
      return s.name.toLowerCase().includes(term) || s.country.toLowerCase().includes(term) || s.category.toLowerCase().includes(term);
    }),
  };

  const displayAircraft = showAll || expandedSection === 'aircraft' ? filtered.aircraft : filtered.aircraft.slice(0, 6);
  const displayShips = showAll || expandedSection === 'ships' ? filtered.ships : filtered.ships.slice(0, 5);
  const displaySatellites = showAll || expandedSection === 'satellites' ? filtered.satellites : filtered.satellites.slice(0, 5);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Navigation className="w-3.5 h-3.5 text-neon-blue" />
        Asset Tracking
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {aircraft.length + ships.length + satellites.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 border-b border-border">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/50">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground outline-none font-mono"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Aircraft */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20 cursor-pointer flex items-center justify-between"
          onClick={() => setExpandedSection(expandedSection === 'aircraft' ? null : 'aircraft')}>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neon-cyan tracking-wider">
            <Plane className="w-3 h-3" />
            ALL AIRCRAFT ({filtered.aircraft.length})
          </div>
          {expandedSection === 'aircraft' ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
        {displayAircraft.map((ac, i) => (
          <motion.div
            key={ac.icao24}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onSelectAircraft?.(ac)}
            className="px-2.5 py-1.5 border-b border-border text-[10px] hover:bg-primary/5 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className={`font-mono font-semibold ${
                  ac.category === 'military' || ac.callsign?.startsWith('RCH') || ac.callsign?.startsWith('RRR') ? 'text-neon-red' :
                  ac.category === 'government' || ac.callsign?.startsWith('SAM') ? 'text-neon-amber' : 'text-foreground'
                }`}>
                  {ac.callsign || ac.icao24}
                </span>
                {ac.operator && <span className="text-[8px] text-muted-foreground">{ac.operator}</span>}
              </div>
              <span className="text-[9px] text-muted-foreground">{ac.originCountry}</span>
            </div>
            <div className="flex gap-2 text-[9px] text-muted-foreground mt-0.5 font-mono">
              <span className="flex items-center gap-0.5">
                <Gauge className="w-2.5 h-2.5" />
                {ac.altitude ? `FL${Math.round(ac.altitude / 30.48).toString().padStart(3, '0')}` : 'GND'}
              </span>
              <span>{ac.velocity ? `${Math.round(ac.velocity)}kts` : '---'}</span>
              <span className="flex items-center gap-0.5">
                <Compass className="w-2.5 h-2.5" />
                {ac.heading ? `${Math.round(ac.heading)}°` : '---'}
              </span>
              {ac.aircraftType && <span className="text-[8px] text-primary/60">{ac.aircraftType}</span>}
            </div>
            {ac.route && (
              <div className="text-[8px] text-primary/50 font-mono mt-0.5">
                {ac.route.from} → {ac.route.to}
              </div>
            )}
          </motion.div>
        ))}
        {expandedSection === 'aircraft' && filtered.aircraft.length > 20 && !showAll && (
          <button onClick={() => setShowAll(true)} className="w-full px-2.5 py-1 text-[8px] text-primary font-mono hover:bg-primary/5 border-b border-border">
            Show all {filtered.aircraft.length} aircraft ▾
          </button>
        )}

        {/* Ships */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20 cursor-pointer flex items-center justify-between"
          onClick={() => setExpandedSection(expandedSection === 'ships' ? null : 'ships')}>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neon-green tracking-wider">
            <Ship className="w-3 h-3" />
            VESSELS ({filtered.ships.length})
          </div>
          {expandedSection === 'ships' ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
        {displayShips.map((ship, i) => (
          <motion.div
            key={ship.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onSelectShip?.(ship)}
            className="px-2.5 py-1.5 border-b border-border text-[10px] hover:bg-primary/5 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{ship.flag}</span>
                <span className={`font-mono font-semibold ${ship.type === 'naval' ? 'text-neon-red' : 'text-foreground'}`}>
                  {ship.name}
                </span>
              </div>
              <span className={`text-[8px] px-1 rounded ${ship.type === 'naval' ? 'bg-neon-red/10 text-neon-red' : 'bg-muted/50 text-muted-foreground'}`}>
                {ship.type.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2 text-[9px] text-muted-foreground mt-0.5 font-mono">
              <span>{ship.speed}kts</span>
              <span className="flex items-center gap-0.5"><Compass className="w-2.5 h-2.5" />{ship.heading}°</span>
              <span className="text-[8px]">{ship.lat.toFixed(2)}°, {ship.lng.toFixed(2)}°</span>
            </div>
          </motion.div>
        ))}

        {/* Satellites */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20 cursor-pointer flex items-center justify-between"
          onClick={() => setExpandedSection(expandedSection === 'satellites' ? null : 'satellites')}>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neon-blue tracking-wider">
            <Satellite className="w-3 h-3" />
            SATELLITES ({filtered.satellites.length})
          </div>
          {expandedSection === 'satellites' ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
        {displaySatellites.map((sat, i) => (
          <motion.div
            key={sat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onSelectSatellite?.(sat)}
            className="px-2.5 py-1.5 border-b border-border text-[10px] hover:bg-primary/5 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className={`font-mono font-semibold ${sat.category === 'military' ? 'text-neon-red' : 'text-foreground'}`}>
                {sat.name}
              </span>
              <span className={`text-[8px] px-1 rounded ${sat.category === 'military' ? 'bg-neon-red/10 text-neon-red' : 'bg-muted/50 text-muted-foreground'}`}>
                {sat.category.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2 text-[9px] text-muted-foreground mt-0.5 font-mono">
              <span>ALT: {Math.round(sat.altitude)}km</span>
              <span>VEL: {sat.velocity.toFixed(1)}km/s</span>
              <span>{sat.country}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
