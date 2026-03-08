import { useState, useCallback, useRef } from 'react';
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
import NexusAI, { type CortanaAction } from '@/components/dashboard/NexusAI';
import LiveInfoTicker from '@/components/dashboard/LiveInfoTicker';
import CCTVViewer from '@/components/dashboard/CCTVViewer';
import WarPanel from '@/components/dashboard/WarPanel';
import NewsFeedPanel from '@/components/dashboard/NewsFeedPanel';
import IntelGlobe, { type GlobeControlHandle } from '@/components/globe/IntelGlobe';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { useAircraftData } from '@/hooks/useAircraftData';
import { useSimulatedData } from '@/hooks/useSimulatedData';
import { useGDELTData } from '@/hooks/useGDELTData';
import { useRealTimeNews } from '@/hooks/useRealTimeNews';
import { infrastructurePoints, cctvCameras } from '@/data/mockData';
import type { LayerVisibility, CCTVCamera } from '@/types/intelligence';

const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  europe: { lat: 50, lng: 10 },
  asia: { lat: 35, lng: 105 },
  americas: { lat: 20, lng: -90 },
  africa: { lat: 5, lng: 25 },
  middle_east: { lat: 28, lng: 45 },
  pacific: { lat: -10, lng: 170 },
  russia: { lat: 55, lng: 37 },
  china: { lat: 35, lng: 105 },
  india: { lat: 20, lng: 79 },
  japan: { lat: 36, lng: 138 },
  australia: { lat: -25, lng: 134 },
  iran: { lat: 32, lng: 53 },
  ukraine: { lat: 48, lng: 31 },
  israel: { lat: 31, lng: 35 },
  north_korea: { lat: 40, lng: 127 },
  south_korea: { lat: 36, lng: 128 },
  taiwan: { lat: 24, lng: 121 },
};

const Index = () => {
  const { earthquakes } = useEarthquakeData();
  const { aircraft } = useAircraftData();
  const { satellites, ships, marineAnimals, cyberThreats, militaryEvents, missiles, alerts, acknowledgeAlert } = useSimulatedData();
  const { events: gdeltEvents } = useGDELTData();
  const { news, conflicts, loading: newsLoading, refetch: refetchNews } = useRealTimeNews();
  const globeRef = useRef<GlobeControlHandle>(null);

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
  const [leftTab, setLeftTab] = useState<'intel' | 'wars' | 'news'>('intel');
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera | null>(null);

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleAICommand = useCallback((command: string) => {
    if (command === 'cctv') setBottomTab('cctv');
    else if (command === 'financial') setBottomTab('financial');
    else if (command === 'radio') setBottomTab('radio');
  }, []);

  const handleCameraSelect = useCallback((camera: CCTVCamera) => {
    setSelectedCamera(camera);
    globeRef.current?.navigateTo(camera.lat, camera.lng, 7);
  }, []);

  // Handle Cortana AI actions
  const handleCortanaAction = useCallback((action: CortanaAction) => {
    switch (action.action) {
      case 'navigate_globe':
        if (action.lat !== undefined && action.lng !== undefined) {
          globeRef.current?.navigateTo(action.lat, action.lng, action.zoom);
        }
        break;
      case 'show_panel':
        if (action.panel === 'financial' || action.panel === 'cctv' || action.panel === 'video' || action.panel === 'radio') {
          setBottomTab(action.panel);
        }
        break;
      case 'select_asset': {
        const query = (action.query || '').toLowerCase();
        if (action.type === 'aircraft') {
          const found = aircraft.find(a => a.callsign?.toLowerCase().includes(query) || a.icao24.toLowerCase().includes(query));
          if (found) {
            setSelectedAsset({ type: 'aircraft', data: found });
            if (found.latitude && found.longitude) globeRef.current?.navigateTo(found.latitude, found.longitude, 6);
          }
        } else if (action.type === 'ship') {
          const found = ships.find(s => s.name.toLowerCase().includes(query));
          if (found) {
            setSelectedAsset({ type: 'ship', data: found });
            globeRef.current?.navigateTo(found.lat, found.lng, 6);
          }
        } else if (action.type === 'satellite') {
          const found = satellites.find(s => s.name.toLowerCase().includes(query));
          if (found) {
            setSelectedAsset({ type: 'satellite', data: found });
            globeRef.current?.navigateTo(found.lat, found.lng, 5);
          }
        }
        break;
      }
      case 'toggle_layer':
        if (action.layer && action.layer in layers) {
          setLayers(prev => ({ ...prev, [action.layer!]: action.visible ?? !prev[action.layer as keyof LayerVisibility] }));
        }
        break;
      case 'show_alerts':
        break;
      case 'zoom_in':
        globeRef.current?.zoomIn();
        break;
      case 'zoom_out':
        globeRef.current?.zoomOut();
        break;
      case 'rotate_to': {
        const region = (action.region || '').toLowerCase().replace(/\s+/g, '_');
        const coords = REGION_COORDS[region];
        if (coords) globeRef.current?.navigateTo(coords.lat, coords.lng, 5);
        break;
      }
    }
  }, [aircraft, ships, satellites, layers]);

  const getContext = useCallback(() => {
    return `Layers: ${Object.entries(layers).filter(([,v]) => v).map(([k]) => k).join(', ')}. Bottom panel: ${bottomTab}. Aircraft: ${aircraft.length}, Ships: ${ships.length}, Satellites: ${satellites.length}, Threats: ${cyberThreats.length}`;
  }, [layers, bottomTab, aircraft, ships, satellites, cyberThreats]);

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
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex border-b border-border bg-card/50">
              {(['intel', 'wars', 'news'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setLeftTab(t)}
                  className={`flex-1 px-2 py-1 text-[8px] font-mono tracking-wider uppercase transition-all ${
                    leftTab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'intel' ? '📡 INTEL' : t === 'wars' ? '⚔️ WARS' : '📰 NEWS'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {leftTab === 'intel' && <EventFeed events={allGlobeEvents} cyberThreats={cyberThreats} />}
              {leftTab === 'wars' && <WarPanel conflicts={conflicts} onNavigate={(lat, lng) => globeRef.current?.navigateTo(lat, lng, 5)} />}
              {leftTab === 'news' && <NewsFeedPanel news={news} loading={newsLoading} onRefresh={refetchNews} />}
            </div>
          </div>
          <div className="h-44 shrink-0 border-t border-border overflow-hidden">
            <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <LiveInfoTicker aircraft={aircraft} alerts={alerts} gdeltEvents={gdeltEvents} />
            <LayerControls layers={layers} onToggle={toggleLayer} counts={counts} />
            <IntelGlobe
              ref={globeRef}
              earthquakes={earthquakes}
              cyberThreats={cyberThreats}
              militaryEvents={[...militaryEvents, ...gdeltEvents.filter(e => e.type === 'military')]}
              aircraft={aircraft}
              satellites={satellites}
              ships={ships}
              missiles={missiles}
              infrastructure={infrastructurePoints}
              marineAnimals={marineAnimals}
              cctvCameras={cctvCameras}
              layers={layers}
              onSelectAsset={setSelectedAsset}
              onSelectCamera={handleCameraSelect}
            />
            <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />

            {/* CCTV Viewer overlay */}
            {selectedCamera && (
              <CCTVViewer camera={selectedCamera} onClose={() => setSelectedCamera(null)} />
            )}

            {/* Stats bar */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 z-10">
              {[
                { label: 'FEEDS', value: Object.values(counts).reduce((a, b) => a + b, 0), color: 'text-foreground' },
                { label: 'USGS', value: earthquakes.length, color: 'text-neon-amber' },
                { label: 'AIRCRAFT', value: aircraft.length, color: 'text-neon-cyan' },
                { label: 'GDELT', value: gdeltEvents.length, color: 'text-primary' },
                { label: 'THREATS', value: cyberThreats.length + missiles.length, color: 'text-neon-red' },
                { label: 'CCTV', value: cctvCameras.length, color: 'text-neon-green' },
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

      {/* Cortana AI Voice Assistant */}
      <NexusAI
        alerts={alerts}
        onCommand={handleAICommand}
        onAction={handleCortanaAction}
        getContext={getContext}
      />
    </div>
  );
};

export default Index;
