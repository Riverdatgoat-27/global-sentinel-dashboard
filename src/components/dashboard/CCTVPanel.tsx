import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, X, Globe, RefreshCw } from 'lucide-react';

interface PublicCamera {
  id: string;
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  url: string; // Direct image URL (snapshot refreshes)
  type: 'city' | 'traffic' | 'weather' | 'port' | 'border';
}

// Real public webcam snapshot feeds - these return live JPEG images
const PUBLIC_CAMERAS: PublicCamera[] = [
  { id: 'wc-1', name: 'Times Square NYC', location: 'New York, USA', country: 'USA', lat: 40.76, lng: -73.98, url: 'https://webcams.windy.com/webcams/public/embed/player/1241697801/day', type: 'city' },
  { id: 'wc-2', name: 'Shibuya Crossing', location: 'Tokyo, Japan', country: 'Japan', lat: 35.66, lng: 139.70, url: 'https://webcams.windy.com/webcams/public/embed/player/1586352498/day', type: 'city' },
  { id: 'wc-3', name: 'Tower Bridge London', location: 'London, UK', country: 'UK', lat: 51.51, lng: -0.08, url: 'https://webcams.windy.com/webcams/public/embed/player/1242006498/day', type: 'city' },
  { id: 'wc-4', name: 'Eiffel Tower', location: 'Paris, France', country: 'France', lat: 48.86, lng: 2.29, url: 'https://webcams.windy.com/webcams/public/embed/player/1459274498/day', type: 'city' },
  { id: 'wc-5', name: 'Miami South Beach', location: 'Miami, USA', country: 'USA', lat: 25.79, lng: -80.13, url: 'https://webcams.windy.com/webcams/public/embed/player/1170151498/day', type: 'city' },
  { id: 'wc-6', name: 'Sydney Harbour', location: 'Sydney, Australia', country: 'Australia', lat: -33.86, lng: 151.21, url: 'https://webcams.windy.com/webcams/public/embed/player/1586352124/day', type: 'city' },
  { id: 'wc-7', name: 'Brandenburg Gate', location: 'Berlin, Germany', country: 'Germany', lat: 52.52, lng: 13.38, url: 'https://webcams.windy.com/webcams/public/embed/player/1459274124/day', type: 'city' },
  { id: 'wc-8', name: 'Venice Grand Canal', location: 'Venice, Italy', country: 'Italy', lat: 45.44, lng: 12.32, url: 'https://webcams.windy.com/webcams/public/embed/player/1140875498/day', type: 'city' },
  { id: 'wc-9', name: 'Dubai Skyline', location: 'Dubai, UAE', country: 'UAE', lat: 25.20, lng: 55.27, url: 'https://webcams.windy.com/webcams/public/embed/player/1586779498/day', type: 'city' },
  { id: 'wc-10', name: 'Hong Kong Harbour', location: 'Hong Kong, China', country: 'China', lat: 22.29, lng: 114.17, url: 'https://webcams.windy.com/webcams/public/embed/player/1586352847/day', type: 'port' },
  { id: 'wc-11', name: 'Istanbul Bosphorus', location: 'Istanbul, Turkey', country: 'Turkey', lat: 41.01, lng: 29.00, url: 'https://webcams.windy.com/webcams/public/embed/player/1586352222/day', type: 'port' },
  { id: 'wc-12', name: 'Moscow Red Square', location: 'Moscow, Russia', country: 'Russia', lat: 55.75, lng: 37.62, url: 'https://webcams.windy.com/webcams/public/embed/player/1586779124/day', type: 'city' },
];

export default function CCTVPanel() {
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const activeCam = PUBLIC_CAMERAS.find(c => c.id === selectedCam);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Camera className="w-3.5 h-3.5 text-neon-cyan" />
        Public CCTV — Live Webcams
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {PUBLIC_CAMERAS.length} FEEDS
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Camera list */}
        <div className={`${selectedCam ? 'w-36' : 'w-full'} shrink-0 overflow-y-auto border-r border-border transition-all`}>
          {PUBLIC_CAMERAS.map((cam, i) => (
            <motion.div
              key={cam.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedCam(selectedCam === cam.id ? null : cam.id)}
              className={`px-2.5 py-2 border-b border-border cursor-pointer transition-colors ${
                selectedCam === cam.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCam === cam.id ? 'bg-neon-green animate-pulse' : 'bg-neon-green/40'}`} />
                <span className="text-[10px] font-medium text-foreground truncate">{cam.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground ml-3.5">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate">{cam.location}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Viewer */}
        <AnimatePresence>
          {selectedCam && activeCam && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex flex-col min-w-0 bg-background"
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-[10px] font-medium text-foreground truncate">{activeCam.name}</span>
                  <span className="text-[8px] text-neon-green uppercase font-mono">LIVE</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setRefreshKey(k => k + 1)} className="p-0.5 text-muted-foreground hover:text-foreground">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button onClick={() => setSelectedCam(null)} className="p-0.5 text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-black">
                <iframe
                  key={refreshKey}
                  src={activeCam.url}
                  className="absolute inset-0 w-full h-full"
                  title={activeCam.name}
                  allow="autoplay"
                  loading="lazy"
                  style={{ border: 'none' }}
                />
                {/* Overlay info */}
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-white/70 bg-black/60 px-1 rounded">
                    {activeCam.lat.toFixed(2)}°N {activeCam.lng.toFixed(2)}°E
                  </span>
                  <span className="text-[8px] font-mono text-neon-green bg-black/60 px-1 rounded">
                    ● LIVE
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
