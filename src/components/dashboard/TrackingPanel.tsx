import { motion } from 'framer-motion';
import { Plane, Ship, Satellite } from 'lucide-react';
import type { AircraftState, SatelliteData, ShipData } from '@/types/intelligence';

interface Props {
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
}

export default function TrackingPanel({ aircraft, satellites, ships }: Props) {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Satellite className="w-3.5 h-3.5 text-neon-blue" />
        Asset Tracking
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Aircraft section */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] font-display text-neon-cyan tracking-wider">
            <Plane className="w-3 h-3" />
            AIRCRAFT ({aircraft.length})
          </div>
        </div>
        {aircraft.slice(0, 5).map((ac, i) => (
          <motion.div
            key={ac.icao24}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-2.5 py-1.5 border-b border-border text-[10px]"
          >
            <div className="flex justify-between">
              <span className="text-foreground font-semibold">{ac.callsign || ac.icao24}</span>
              <span className="text-muted-foreground">{ac.originCountry}</span>
            </div>
            <div className="flex gap-3 text-[9px] text-muted-foreground mt-0.5">
              <span>ALT: {ac.altitude ? Math.round(ac.altitude) + 'm' : 'N/A'}</span>
              <span>SPD: {ac.velocity ? Math.round(ac.velocity) + 'kts' : 'N/A'}</span>
              <span>HDG: {ac.heading ? Math.round(ac.heading) + '°' : 'N/A'}</span>
            </div>
          </motion.div>
        ))}

        {/* Ships section */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] font-display text-neon-green tracking-wider">
            <Ship className="w-3 h-3" />
            VESSELS ({ships.length})
          </div>
        </div>
        {ships.slice(0, 4).map((ship, i) => (
          <motion.div
            key={ship.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-2.5 py-1.5 border-b border-border text-[10px]"
          >
            <div className="flex justify-between">
              <span className={`font-semibold ${ship.type === 'naval' ? 'text-neon-red' : 'text-foreground'}`}>
                {ship.flag} {ship.name}
              </span>
              <span className="text-[8px] text-muted-foreground uppercase">{ship.type}</span>
            </div>
            <div className="flex gap-3 text-[9px] text-muted-foreground mt-0.5">
              <span>SPD: {ship.speed}kts</span>
              <span>HDG: {ship.heading}°</span>
            </div>
          </motion.div>
        ))}

        {/* Satellites section */}
        <div className="px-2.5 py-1.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] font-display text-neon-blue tracking-wider">
            <Satellite className="w-3 h-3" />
            SATELLITES ({satellites.length})
          </div>
        </div>
        {satellites.slice(0, 4).map((sat, i) => (
          <motion.div
            key={sat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-2.5 py-1.5 border-b border-border text-[10px]"
          >
            <div className="flex justify-between">
              <span className={`font-semibold ${sat.category === 'military' ? 'text-neon-red' : 'text-foreground'}`}>
                {sat.name}
              </span>
              <span className="text-[8px] text-muted-foreground uppercase">{sat.category}</span>
            </div>
            <div className="flex gap-3 text-[9px] text-muted-foreground mt-0.5">
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
