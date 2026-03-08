import { Suspense, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import EarthMesh from './EarthMesh';
import GlobeMarkers from './GlobeMarkers';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData, LayerVisibility, MissileEvent, InfrastructurePoint, MarineAnimal, CCTVCamera, SubmarineData } from '@/types/intelligence';
import type { SelectedAsset } from '@/components/dashboard/AssetDetailPanel';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  submarines?: SubmarineData[];
  missiles: MissileEvent[];
  infrastructure: InfrastructurePoint[];
  marineAnimals: MarineAnimal[];
  cctvCameras?: CCTVCamera[];
  layers: LayerVisibility;
  onSelectEvent?: (event: GlobeEvent | null) => void;
  onSelectAsset?: (asset: SelectedAsset) => void;
  onSelectCamera?: (camera: CCTVCamera) => void;
}

export interface GlobeControlHandle {
  navigateTo: (lat: number, lng: number, zoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

function latLngToCamera(lat: number, lng: number, distance: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -distance * Math.sin(phi) * Math.cos(theta),
    distance * Math.cos(phi),
    distance * Math.sin(phi) * Math.sin(theta),
  ];
}

function GlobeController({ controlRef }: { controlRef: React.MutableRefObject<any> }) {
  const { camera } = useThree();

  useImperativeHandle(controlRef, () => ({
    navigateTo: (lat: number, lng: number, zoom?: number) => {
      const dist = zoom ? Math.max(3, Math.min(12, 12 - zoom)) : camera.position.length();
      const [x, y, z] = latLngToCamera(lat, lng, dist);
      const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const t = Math.min(1, (Date.now() - startTime) / duration);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        camera.position.set(
          start.x + (x - start.x) * ease,
          start.y + (y - start.y) * ease,
          start.z + (z - start.z) * ease,
        );
        camera.lookAt(0, 0, 0);
        if (t < 1) requestAnimationFrame(animate);
      };
      animate();
    },
    zoomIn: () => {
      const dir = camera.position.clone().normalize();
      const newDist = Math.max(3, camera.position.length() - 1.5);
      camera.position.copy(dir.multiplyScalar(newDist));
    },
    zoomOut: () => {
      const dir = camera.position.clone().normalize();
      const newDist = Math.min(12, camera.position.length() + 1.5);
      camera.position.copy(dir.multiplyScalar(newDist));
    },
  }));

  return null;
}

function ClickHandler({ aircraft, ships, satellites, cyberThreats, cctvCameras, onSelectAsset, onSelectCamera }: {
  aircraft: AircraftState[];
  ships: ShipData[];
  satellites: SatelliteData[];
  cyberThreats: CyberThreat[];
  cctvCameras?: CCTVCamera[];
  onSelectAsset?: (asset: SelectedAsset) => void;
  onSelectCamera?: (camera: CCTVCamera) => void;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const handleClick = useCallback((event: MouseEvent) => {
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

    // Check CCTV cameras first (smaller threshold = higher priority)
    if (cctvCameras && onSelectCamera) {
      let bestCamDist = 3;
      let bestCam: CCTVCamera | null = null;
      cctvCameras.forEach(cam => {
        const d = Math.sqrt(Math.pow(cam.lat - lat, 2) + Math.pow(cam.lng - normLng, 2));
        if (d < bestCamDist) { bestCamDist = d; bestCam = cam; }
      });
      if (bestCam) { onSelectCamera(bestCam); return; }
    }

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

    onSelectAsset?.(bestAsset);
  }, [aircraft, ships, satellites, cyberThreats, cctvCameras, camera, gl, onSelectAsset, onSelectCamera]);

  gl.domElement.onclick = handleClick;
  return null;
}

const IntelGlobe = forwardRef<GlobeControlHandle, Props>((props, ref) => {
  const controlRef = useRef<GlobeControlHandle>(null);

  useImperativeHandle(ref, () => ({
    navigateTo: (lat, lng, zoom) => controlRef.current?.navigateTo(lat, lng, zoom),
    zoomIn: () => controlRef.current?.zoomIn(),
    zoomOut: () => controlRef.current?.zoomOut(),
  }));

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
            cctvCameras={props.cctvCameras}
            onSelectAsset={props.onSelectAsset}
            onSelectCamera={props.onSelectCamera}
          />
          <GlobeController controlRef={controlRef} />
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
});

IntelGlobe.displayName = 'IntelGlobe';
export default IntelGlobe;
