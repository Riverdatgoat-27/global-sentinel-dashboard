import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import EarthMesh from './EarthMesh';
import GlobeMarkers from './GlobeMarkers';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData, LayerVisibility, MissileEvent, InfrastructurePoint } from '@/types/intelligence';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  missiles: MissileEvent[];
  infrastructure: InfrastructurePoint[];
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
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#6094d4" />
        <pointLight position={[-10, -5, -10]} intensity={0.15} color="#1e40af" />

        <Suspense fallback={null}>
          <Stars radius={80} depth={60} count={2000} factor={2.5} saturation={0.1} fade speed={0.2} />
          <EarthMesh />
          <GlobeMarkers {...props} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.12}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
