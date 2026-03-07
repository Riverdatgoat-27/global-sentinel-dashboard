import { useState, useCallback } from 'react';
import ThreatStatusBar from '@/components/dashboard/ThreatStatusBar';
import EventFeed from '@/components/dashboard/EventFeed';
import CyberAttackMonitor from '@/components/dashboard/CyberAttackMonitor';
import FinancialPanel from '@/components/dashboard/FinancialPanel';
import TrackingPanel from '@/components/dashboard/TrackingPanel';
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel';
import LayerControls from '@/components/dashboard/LayerControls';
import IntelGlobe from '@/components/globe/IntelGlobe';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { useAircraftData } from '@/hooks/useAircraftData';
import { useSimulatedData } from '@/hooks/useSimulatedData';
import type { LayerVisibility } from '@/types/intelligence';

const Index = () => {
  const { earthquakes } = useEarthquakeData();
  const { aircraft } = useAircraftData();
  const { satellites, ships, cyberThreats, militaryEvents } = useSimulatedData();

  const [layers, setLayers] = useState<LayerVisibility>({
    earthquakes: true,
    cyberAttacks: true,
    military: true,
    aircraft: true,
    satellites: true,
    ships: true,
    infrastructure: false,
  });

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const counts = {
    earthquakes: earthquakes.length,
    cyberAttacks: cyberThreats.length,
    military: militaryEvents.length,
    aircraft: aircraft.length,
    satellites: satellites.length,
    ships: ships.length,
  };

  // Combine all globe events for the feed
  const allGlobeEvents = [...earthquakes, ...militaryEvents];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div className="scanline-overlay" />

      <ThreatStatusBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Event Feed */}
        <div className="w-64 shrink-0 border-r border-border">
          <EventFeed events={allGlobeEvents} cyberThreats={cyberThreats} />
        </div>

        {/* Center: Globe + Layer Controls */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <LayerControls layers={layers} onToggle={toggleLayer} counts={counts} />
            <IntelGlobe
              earthquakes={earthquakes}
              cyberThreats={cyberThreats}
              militaryEvents={militaryEvents}
              aircraft={aircraft}
              satellites={satellites}
              ships={ships}
              layers={layers}
            />
            {/* Globe stats overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-2 z-10">
              <div className="panel px-2 py-1 text-[9px] flex items-center gap-2">
                <span className="text-muted-foreground">FEEDS:</span>
                <span className="text-neon-green">{Object.values(counts).reduce((a, b) => a + b, 0)} CONTACTS</span>
              </div>
              <div className="panel px-2 py-1 text-[9px] flex items-center gap-2">
                <span className="text-muted-foreground">USGS:</span>
                <span className="text-neon-amber">{earthquakes.length} SEISMIC</span>
              </div>
              <div className="panel px-2 py-1 text-[9px] flex items-center gap-2">
                <span className="text-muted-foreground">OPENSKY:</span>
                <span className="text-neon-cyan">{aircraft.length} AIRCRAFT</span>
              </div>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="h-48 shrink-0 flex border-t border-border">
            <div className="flex-1 border-r border-border">
              <FinancialPanel />
            </div>
            <div className="flex-1">
              <AIAnalysisPanel events={allGlobeEvents} cyberThreats={cyberThreats} />
            </div>
          </div>
        </div>

        {/* Right Panel: Cyber + Tracking */}
        <div className="w-72 shrink-0 border-l border-border flex flex-col">
          <div className="flex-1 border-b border-border overflow-hidden">
            <CyberAttackMonitor threats={cyberThreats} />
          </div>
          <div className="flex-1 overflow-hidden">
            <TrackingPanel aircraft={aircraft} satellites={satellites} ships={ships} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
