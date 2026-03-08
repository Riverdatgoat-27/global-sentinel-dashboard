import { useState, useCallback } from 'react';
import ThreatStatusBar from '@/components/dashboard/ThreatStatusBar';
import EventFeed from '@/components/dashboard/EventFeed';
import CyberAttackMonitor from '@/components/dashboard/CyberAttackMonitor';
import FinancialPanel from '@/components/dashboard/FinancialPanel';
import TrackingPanel from '@/components/dashboard/TrackingPanel';
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel';
import LayerControls from '@/components/dashboard/LayerControls';
import AlertPanel from '@/components/dashboard/AlertPanel';
import CCTVPanel from '@/components/dashboard/CCTVPanel';
import VideoIntelPanel from '@/components/dashboard/VideoIntelPanel';
import TimelineSlider from '@/components/dashboard/TimelineSlider';
import IntelGlobe from '@/components/globe/IntelGlobe';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { useAircraftData } from '@/hooks/useAircraftData';
import { useSimulatedData } from '@/hooks/useSimulatedData';
import { infrastructurePoints } from '@/data/mockData';
import type { LayerVisibility } from '@/types/intelligence';

const Index = () => {
  const { earthquakes } = useEarthquakeData();
  const { aircraft } = useAircraftData();
  const { satellites, ships, cyberThreats, militaryEvents, missiles, alerts, acknowledgeAlert } = useSimulatedData();

  const [layers, setLayers] = useState<LayerVisibility>({
    earthquakes: true,
    cyberAttacks: true,
    military: true,
    aircraft: true,
    satellites: true,
    ships: true,
    infrastructure: false,
    missiles: true,
  });

  const [bottomTab, setBottomTab] = useState<'financial' | 'cctv' | 'video'>('financial');

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
    missiles: missiles.length,
    infrastructure: infrastructurePoints.length,
  };

  const allGlobeEvents = [...earthquakes, ...militaryEvents];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div className="scanline-overlay" />

      <ThreatStatusBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Event Feed + Alerts */}
        <div className="w-64 shrink-0 border-r border-border flex flex-col">
          <div className="flex-1 overflow-hidden">
            <EventFeed events={allGlobeEvents} cyberThreats={cyberThreats} />
          </div>
          <div className="h-48 shrink-0 border-t border-border overflow-hidden">
            <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
          </div>
        </div>

        {/* Center: Globe + Layer Controls + Timeline + Bottom */}
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
              missiles={missiles}
              infrastructure={infrastructurePoints}
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
              <div className="panel px-2 py-1 text-[9px] flex items-center gap-2">
                <span className="text-muted-foreground">THREATS:</span>
                <span className="text-neon-red">{cyberThreats.length + missiles.length} ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <TimelineSlider />

          {/* Bottom panels with tabs */}
          <div className="h-44 shrink-0 flex flex-col border-t border-border">
            <div className="flex border-b border-border">
              {(['financial', 'cctv', 'video'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-3 py-1 text-[9px] font-display tracking-wider uppercase transition-colors ${
                    bottomTab === tab
                      ? 'text-neon-green border-b border-neon-green bg-muted/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'financial' ? 'MARKETS' : tab === 'cctv' ? 'CCTV' : 'VIDEO INTEL'}
                </button>
              ))}
              <div className="flex-1" />
              <div className="border-l border-border" style={{ width: '50%' }}>
                {/* AI panel takes right half */}
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1">
                {bottomTab === 'financial' && <FinancialPanel />}
                {bottomTab === 'cctv' && <CCTVPanel />}
                {bottomTab === 'video' && <VideoIntelPanel />}
              </div>
              <div className="flex-1 border-l border-border">
                <AIAnalysisPanel events={allGlobeEvents} cyberThreats={cyberThreats} />
              </div>
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
