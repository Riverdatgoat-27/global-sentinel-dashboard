import ThreatStatusBar from '@/components/dashboard/ThreatStatusBar';
import WorldMap from '@/components/dashboard/WorldMap';
import EventFeed from '@/components/dashboard/EventFeed';
import CyberAttackMonitor from '@/components/dashboard/CyberAttackMonitor';
import NewsFeed from '@/components/dashboard/NewsFeed';
import FinancialPanel from '@/components/dashboard/FinancialPanel';
import RadarWidget from '@/components/dashboard/RadarWidget';
import SystemStats from '@/components/dashboard/SystemStats';

const Index = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Top status bar */}
      <ThreatStatusBar />

      {/* Main content */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-px bg-border p-px overflow-hidden">
        {/* Left: Event Feed - 3 cols, 6 rows */}
        <div className="col-span-3 row-span-6">
          <EventFeed />
        </div>

        {/* Center: World Map - 6 cols, 4 rows */}
        <div className="col-span-6 row-span-4">
          <WorldMap />
        </div>

        {/* Right: Cyber Attack Monitor - 3 cols, 6 rows */}
        <div className="col-span-3 row-span-3">
          <CyberAttackMonitor />
        </div>

        {/* Right bottom: Radar + Stats */}
        <div className="col-span-3 row-span-3 grid grid-rows-2 gap-px bg-border">
          <RadarWidget />
          <SystemStats />
        </div>

        {/* Bottom left: News Feed - 3 cols, 2 rows */}
        <div className="col-span-3 row-span-2">
          <NewsFeed />
        </div>

        {/* Bottom right: Financial Panel - 3 cols, 2 rows */}
        <div className="col-span-3 row-span-2">
          <FinancialPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
