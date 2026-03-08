import { Suspense, useCallback, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import EarthMesh from './EarthMesh';
import GlobeMarkers from './GlobeMarkers';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData, LayerVisibility, MissileEvent, InfrastructurePoint, MarineAnimal } from '@/types/intelligence';
import type { SelectedAsset } from '@/components/dashboard/AssetDetailPanel';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  missiles: MissileEvent[];
  infrastructure: InfrastructurePoint[];
  marineAnimals: MarineAnimal[];
  layers: LayerVisibility;
  onSelectEvent?: (event: GlobeEvent | null) => void;
  onSelectAsset?: (asset: SelectedAsset) => void;
}

function ClickHandler({ aircraft, ships, satellites, cyberThreats, onSelectAsset }: {
  aircraft: AircraftState[];
  ships: ShipData[];
  satellites: SatelliteData[];
  cyberThreats: CyberThreat[];
  onSelectAsset?: (asset: SelectedAsset) => void;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const handleClick = useCallback((event: MouseEvent) => {
    if (!onSelectAsset) return;
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(mouse, camera);

    const origin = raycaster.current.ray.origin;
    const dir = raycaster.current.ray.direction;
    const r = 2.01;
    const a = dir.dot(dir);
    const b = 2 * origin.dot(dir);
    const c = origin.dot(origin) - r * r;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return;
    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t < 0) return;
    const hitPoint = origin.clone().add(dir.clone().multiplyScalar(t));
    const lat = 90 - Math.acos(hitPoint.y / r) * (180 / Math.PI);
    const lng = Math.atan2(hitPoint.z, -hitPoint.x) * (180 / Math.PI) - 180;
    const normLng = ((lng + 540) % 360) - 180;

    let bestDist = 5;
    let bestAsset: SelectedAsset = null;

    aircraft.forEach(ac => {
      if (!ac.latitude || !ac.longitude) return;
      const d = Math.sqrt(Math.pow(ac.latitude - lat, 2) + Math.pow(ac.longitude - normLng, 2));
      if (d < bestDist) { bestDist = d; bestAsset = { type: 'aircraft', data: ac }; }
    });
    ships.forEach(ship => {
      const d = Math.sqrt(Math.pow(ship.lat - lat, 2) + Math.pow(ship.lng - normLng, 2));
      if (d < bestDist) { bestDist = d; bestAsset = { type: 'ship', data: ship }; }
    });
    satellites.forEach(sat => {
      const d = Math.sqrt(Math.pow(sat.lat - lat, 2) + Math.pow(sat.lng - normLng, 2));
      if (d < bestDist) { bestDist = d; bestAsset = { type: 'satellite', data: sat }; }
    });
    cyberThreats.forEach(ct => {
      const dSource = Math.sqrt(Math.pow(ct.sourceLat - lat, 2) + Math.pow(ct.sourceLng - normLng, 2));
      const dTarget = Math.sqrt(Math.pow(ct.targetLat - lat, 2) + Math.pow(ct.targetLng - normLng, 2));
      const d = Math.min(dSource, dTarget);
      if (d < bestDist) { bestDist = d; bestAsset = { type: 'cyber', data: ct }; }
    });

    onSelectAsset(bestAsset);
  }, [aircraft, ships, satellites, cyberThreats, camera, gl, onSelectAsset]);

  gl.domElement.onclick = handleClick;
  return null;
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
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#4a90d9" />
        <pointLight position={[-10, -5, -10]} intensity={0.15} color="#1a365d" />
        <directionalLight position={[5, 3, 5]} intensity={0.1} color="#64b5f6" />

        <Suspense fallback={null}>
          <Stars radius={80} depth={60} count={3000} factor={2.5} saturation={0.1} fade speed={0.15} />
          <EarthMesh />
          <GlobeMarkers {...props} />
          <ClickHandler
            aircraft={props.aircraft}
            ships={props.ships}
            satellites={props.satellites}
            cyberThreats={props.cyberThreats}
            onSelectAsset={props.onSelectAsset}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.08}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
