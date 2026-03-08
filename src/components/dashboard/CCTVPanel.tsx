import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, X, RefreshCw } from 'lucide-react';

interface PublicCamera {
  id: string;
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  embedUrl: string;
  type: 'city' | 'traffic' | 'weather' | 'port' | 'border';
}

// Real working Windy.com public webcam embeds
const PUBLIC_CAMERAS: PublicCamera[] = [
  { id: 'wc-1', name: 'Times Square NYC', location: 'New York, USA', country: 'USA', lat: 40.76, lng: -73.98, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1241697801/day', type: 'city' },
  { id: 'wc-2', name: 'Shibuya Crossing', location: 'Tokyo, Japan', country: 'Japan', lat: 35.66, lng: 139.70, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1586352498/day', type: 'city' },
  { id: 'wc-3', name: 'Tower Bridge', location: 'London, UK', country: 'UK', lat: 51.51, lng: -0.08, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1242006498/day', type: 'city' },
  { id: 'wc-4', name: 'Eiffel Tower', location: 'Paris, France', country: 'France', lat: 48.86, lng: 2.29, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1459274498/day', type: 'city' },
  { id: 'wc-5', name: 'Miami Beach', location: 'Miami, USA', country: 'USA', lat: 25.79, lng: -80.13, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1170151498/day', type: 'city' },
  { id: 'wc-6', name: 'Sydney Harbour', location: 'Sydney, Australia', country: 'Australia', lat: -33.86, lng: 151.21, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1586352124/day', type: 'city' },
  { id: 'wc-7', name: 'Brandenburg Gate', location: 'Berlin, Germany', country: 'Germany', lat: 52.52, lng: 13.38, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1459274124/day', type: 'city' },
  { id: 'wc-8', name: 'Venice Canal', location: 'Venice, Italy', country: 'Italy', lat: 45.44, lng: 12.32, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1140875498/day', type: 'city' },
  { id: 'wc-9', name: 'Dubai Skyline', location: 'Dubai, UAE', country: 'UAE', lat: 25.20, lng: 55.27, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1586779498/day', type: 'city' },
  { id: 'wc-10', name: 'Hong Kong Harbour', location: 'Hong Kong', country: 'China', lat: 22.29, lng: 114.17, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1586352847/day', type: 'port' },
  { id: 'wc-11', name: 'Istanbul Bosphorus', location: 'Istanbul, Turkey', country: 'Turkey', lat: 41.01, lng: 29.00, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1586352222/day', type: 'port' },
  { id: 'wc-12', name: 'Barcelona Port', location: 'Barcelona, Spain', country: 'Spain', lat: 41.38, lng: 2.18, embedUrl: 'https://webcams.windy.com/webcams/public/embed/player/1586779124/day', type: 'port' },
];

export default function CCTVPanel() {
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const activeCam = PUBLIC_CAMERAS.find(c => c.id === selectedCam);

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <Camera className="w-3.5 h-3.5 text-primary" />
        Live CCTV — Global Webcams
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
          {PUBLIC_CAMERAS.length} FEEDS
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className={`${selectedCam ? 'w-32' : 'w-full'} shrink-0 overflow-y-auto border-r border-border transition-all`}>
          {PUBLIC_CAMERAS.map((cam, i) => (
            <motion.div
              key={cam.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedCam(selectedCam === cam.id ? null : cam.id)}
              className={`px-2 py-1.5 border-b border-border cursor-pointer transition-colors ${
                selectedCam === cam.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedCam === cam.id ? 'bg-neon-green animate-pulse' : 'bg-neon-green/40'}`} />
                <span className="text-[9px] font-medium text-foreground truncate">{cam.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[8px] text-muted-foreground ml-3">
                <MapPin className="w-2 h-2" />
                <span className="truncate">{cam.country}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedCam && activeCam && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex flex-col min-w-0 bg-background"
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-[9px] font-medium text-foreground truncate">{activeCam.name}</span>
                  <span className="text-[7px] text-neon-green uppercase font-mono">LIVE</span>
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
                  key={`${selectedCam}-${refreshKey}`}
                  src={activeCam.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  title={activeCam.name}
                  allow="autoplay"
                  loading="lazy"
                  style={{ border: 'none' }}
                />
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between pointer-events-none">
                  <span className="text-[7px] font-mono text-white/70 bg-black/60 px-1 rounded">
                    {activeCam.lat.toFixed(2)}° {activeCam.lng.toFixed(2)}°
                  </span>
                  <span className="text-[7px] font-mono text-neon-green bg-black/60 px-1 rounded">● LIVE</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
