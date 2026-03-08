import { motion } from 'framer-motion';
import { Plane, Ship, Satellite, Navigation, Gauge, Compass } from 'lucide-react';
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
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Navigation className="w-3.5 h-3.5 text-neon-blue" />
        Asset Tracking
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {aircraft.length + ships.length + satellites.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Aircraft */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neon-cyan tracking-wider">
            <Plane className="w-3 h-3" />
            AIRCRAFT ({aircraft.length})
          </div>
        </div>
        {aircraft.slice(0, 6).map((ac, i) => (
          <motion.div
            key={ac.icao24}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelectAircraft?.(ac)}
            className="px-2.5 py-1.5 border-b border-border text-[10px] hover:bg-primary/5 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className={`font-mono font-semibold ${ac.callsign?.startsWith('MIL') ? 'text-neon-red' : 'text-foreground'}`}>
                  {ac.callsign || ac.icao24}
                </span>
                <span className="text-[8px] text-muted-foreground px-1 py-0 rounded bg-muted/50">
                  {ac.icao24.toUpperCase()}
                </span>
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
            </div>
          </motion.div>
        ))}

        {/* Ships */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neon-green tracking-wider">
            <Ship className="w-3 h-3" />
            VESSELS ({ships.length})
          </div>
        </div>
        {ships.slice(0, 5).map((ship, i) => (
          <motion.div
            key={ship.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
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
              <span className={`text-[8px] px-1 rounded ${
                ship.type === 'naval' ? 'bg-neon-red/10 text-neon-red' : 'bg-muted/50 text-muted-foreground'
              }`}>
                {ship.type.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2 text-[9px] text-muted-foreground mt-0.5 font-mono">
              <span>{ship.speed}kts</span>
              <span className="flex items-center gap-0.5">
                <Compass className="w-2.5 h-2.5" />
                {ship.heading}°
              </span>
              <span className="text-[8px]">{ship.lat.toFixed(2)}°, {ship.lng.toFixed(2)}°</span>
            </div>
          </motion.div>
        ))}

        {/* Satellites */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neon-blue tracking-wider">
            <Satellite className="w-3 h-3" />
            SATELLITES ({satellites.length})
          </div>
        </div>
        {satellites.slice(0, 5).map((sat, i) => (
          <motion.div
            key={sat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelectSatellite?.(sat)}
            className="px-2.5 py-1.5 border-b border-border text-[10px] hover:bg-primary/5 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className={`font-mono font-semibold ${sat.category === 'military' ? 'text-neon-red' : 'text-foreground'}`}>
                {sat.name}
              </span>
              <span className={`text-[8px] px-1 rounded ${
                sat.category === 'military' ? 'bg-neon-red/10 text-neon-red' : 'bg-muted/50 text-muted-foreground'
              }`}>
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
