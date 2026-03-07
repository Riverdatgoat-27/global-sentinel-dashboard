import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import EarthMesh from './EarthMesh';
import GlobeMarkers from './GlobeMarkers';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData, LayerVisibility } from '@/types/intelligence';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  layers: LayerVisibility;
  onSelectEvent?: (event: GlobeEvent | null) => void;
}

export default function IntelGlobe(props: Props) {
  return (
    <div className="w-full h-full bg-background">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#00ff41" />

        <Suspense fallback={null}>
          <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
          <EarthMesh />
          <GlobeMarkers {...props} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
