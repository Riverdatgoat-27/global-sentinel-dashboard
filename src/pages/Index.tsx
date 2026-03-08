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
import RadioScanner from '@/components/dashboard/RadioScanner';
import TimelineSlider from '@/components/dashboard/TimelineSlider';
import AssetDetailPanel, { type SelectedAsset } from '@/components/dashboard/AssetDetailPanel';
import NexusAI from '@/components/dashboard/NexusAI';
import IntelGlobe from '@/components/globe/IntelGlobe';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { useAircraftData } from '@/hooks/useAircraftData';
import { useSimulatedData } from '@/hooks/useSimulatedData';
import { useGDELTData } from '@/hooks/useGDELTData';
import { infrastructurePoints } from '@/data/mockData';
import type { LayerVisibility } from '@/types/intelligence';

const Index = () => {
  const { earthquakes } = useEarthquakeData();
  const { aircraft } = useAircraftData();
  const { satellites, ships, marineAnimals, cyberThreats, militaryEvents, missiles, alerts, acknowledgeAlert } = useSimulatedData();
  const { events: gdeltEvents } = useGDELTData();

  const [layers, setLayers] = useState<LayerVisibility>({
    earthquakes: true,
    cyberAttacks: true,
    military: true,
    aircraft: true,
    satellites: true,
    ships: true,
    infrastructure: false,
    missiles: true,
    marineAnimals: true,
  });

  const [bottomTab, setBottomTab] = useState<'financial' | 'cctv' | 'video' | 'radio'>('financial');
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleAICommand = useCallback((command: string) => {
    if (command === 'cctv') setBottomTab('cctv');
    else if (command === 'financial') setBottomTab('financial');
    else if (command === 'radio') setBottomTab('radio');
  }, []);

  const counts = {
    earthquakes: earthquakes.length,
    cyberAttacks: cyberThreats.length,
    military: militaryEvents.length + gdeltEvents.filter(e => e.type === 'military').length,
    aircraft: aircraft.length,
    satellites: satellites.length,
    ships: ships.length,
    missiles: missiles.length,
    infrastructure: infrastructurePoints.length,
    marineAnimals: marineAnimals.length,
  };

  const allGlobeEvents = [...earthquakes, ...militaryEvents, ...gdeltEvents];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <ThreatStatusBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-60 shrink-0 border-r border-border flex flex-col">
          <div className="flex-1 overflow-hidden">
            <EventFeed events={allGlobeEvents} cyberThreats={cyberThreats} />
          </div>
          <div className="h-44 shrink-0 border-t border-border overflow-hidden">
            <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <LayerControls layers={layers} onToggle={toggleLayer} counts={counts} />
            <IntelGlobe
              earthquakes={earthquakes}
              cyberThreats={cyberThreats}
              militaryEvents={[...militaryEvents, ...gdeltEvents.filter(e => e.type === 'military')]}
              aircraft={aircraft}
              satellites={satellites}
              ships={ships}
              missiles={missiles}
              infrastructure={infrastructurePoints}
              marineAnimals={marineAnimals}
              layers={layers}
              onSelectAsset={setSelectedAsset}
            />
            <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />

            {/* Stats bar */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 z-10">
              {[
                { label: 'FEEDS', value: Object.values(counts).reduce((a, b) => a + b, 0), color: 'text-foreground' },
                { label: 'USGS', value: earthquakes.length, color: 'text-neon-amber' },
                { label: 'AIRCRAFT', value: aircraft.length, color: 'text-neon-cyan' },
                { label: 'GDELT', value: gdeltEvents.length, color: 'text-primary' },
                { label: 'THREATS', value: cyberThreats.length + missiles.length, color: 'text-neon-red' },
                { label: 'WILDLIFE', value: marineAnimals.length, color: 'text-neon-green' },
              ].map(stat => (
                <div key={stat.label} className="bg-card/80 backdrop-blur-sm border border-border/50 px-2 py-1 rounded text-[8px] flex items-center gap-1.5">
                  <span className="text-muted-foreground font-mono">{stat.label}</span>
                  <span className={`${stat.color} font-mono font-semibold`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <TimelineSlider />

          {/* Bottom panels */}
          <div className="h-44 shrink-0 flex flex-col border-t border-border">
            <div className="flex border-b border-border bg-card/50">
              {(['financial', 'cctv', 'video', 'radio'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-3 py-1.5 text-[9px] font-mono tracking-wider uppercase transition-all ${
                    bottomTab === tab
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  {tab === 'financial' ? 'MARKETS' : tab === 'cctv' ? '📹 CCTV' : tab === 'video' ? 'INTEL' : '📡 SCANNER'}
                </button>
              ))}
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1">
                {bottomTab === 'financial' && <FinancialPanel />}
                {bottomTab === 'cctv' && <CCTVPanel />}
                {bottomTab === 'video' && <VideoIntelPanel gdeltEvents={gdeltEvents} />}
                {bottomTab === 'radio' && <RadioScanner />}
              </div>
              <div className="flex-1 border-l border-border">
                <AIAnalysisPanel events={allGlobeEvents} cyberThreats={cyberThreats} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-68 shrink-0 border-l border-border flex flex-col" style={{ width: '272px' }}>
          <div className="flex-1 border-b border-border overflow-hidden">
            <CyberAttackMonitor threats={cyberThreats} />
          </div>
          <div className="flex-1 overflow-hidden">
            <TrackingPanel
              aircraft={aircraft}
              satellites={satellites}
              ships={ships}
              onSelectAircraft={(ac) => setSelectedAsset({ type: 'aircraft', data: ac })}
              onSelectShip={(s) => setSelectedAsset({ type: 'ship', data: s })}
              onSelectSatellite={(sat) => setSelectedAsset({ type: 'satellite', data: sat })}
            />
          </div>
        </div>
      </div>

      {/* AI Voice Assistant */}
      <NexusAI alerts={alerts} onCommand={handleAICommand} />
    </div>
  );
};

export default Index;
