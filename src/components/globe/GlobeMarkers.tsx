import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData } from '@/types/intelligence';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  layers: {
    earthquakes: boolean;
    cyberAttacks: boolean;
    military: boolean;
    aircraft: boolean;
    satellites: boolean;
    ships: boolean;
  };
  onSelectEvent?: (event: GlobeEvent | null) => void;
}

function latLngToVector3(lat: number, lng: number, radius = 2.01): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function EventMarkers({ events, color }: { events: { lat: number; lng: number }[]; color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pulseRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || events.length === 0) return;
    pulseRef.current += delta;
    const scale = 1 + Math.sin(pulseRef.current * 3) * 0.3;

    events.forEach((event, i) => {
      const pos = latLngToVector3(event.lat, event.lng);
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(scale * 0.02);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (events.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, events.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color || '#ff0040'} transparent opacity={0.9} />
    </instancedMesh>
  );
}

function CyberAttackLines({ threats }: { threats: CyberThreat[] }) {
  const lineObjects = useMemo(() => {
    return threats.map(threat => {
      const start = latLngToVector3(threat.sourceLat, threat.sourceLng, 2.02);
      const end = latLngToVector3(threat.targetLat, threat.targetLng, 2.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(2.5);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const color = threat.severity === 'critical' ? '#ff0040' : '#ff8800';
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
      return new THREE.Line(geom, mat);
    });
  }, [threats]);

  return (
    <group>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

function AircraftMarkers({ aircraft }: { aircraft: AircraftState[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || aircraft.length === 0) return;
    aircraft.forEach((ac, i) => {
      if (!ac.latitude || !ac.longitude) return;
      const alt = 2.01 + (ac.altitude || 10000) / 1000000;
      const pos = latLngToVector3(ac.latitude, ac.longitude, alt);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.008);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (aircraft.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, aircraft.length]}>
      <boxGeometry args={[1, 0.3, 1.5]} />
      <meshBasicMaterial color="#00aaff" transparent opacity={0.8} />
    </instancedMesh>
  );
}

function SatelliteMarkers({ satellites }: { satellites: SatelliteData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || satellites.length === 0) return;
    satellites.forEach((sat, i) => {
      const alt = 2.01 + sat.altitude / 20000;
      const pos = latLngToVector3(sat.lat, sat.lng, Math.min(alt, 4));
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (satellites.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, satellites.length]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#8888ff" transparent opacity={0.7} />
    </instancedMesh>
  );
}

function ShipMarkers({ ships }: { ships: ShipData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || ships.length === 0) return;
    ships.forEach((ship, i) => {
      const pos = latLngToVector3(ship.lat, ship.lng, 2.005);
      dummy.position.copy(pos);
      dummy.scale.setScalar(ship.type === 'naval' ? 0.018 : 0.012);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (ships.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ships.length]}>
      <coneGeometry args={[1, 2, 4]} />
      <meshBasicMaterial color="#00ff88" transparent opacity={0.7} />
    </instancedMesh>
  );
}

export default function GlobeMarkers(props: Props) {
  const earthquakePositions = useMemo(() =>
    props.earthquakes.map(e => ({ lat: e.lat, lng: e.lng })),
    [props.earthquakes]
  );

  const militaryPositions = useMemo(() =>
    props.militaryEvents.map(e => ({ lat: e.lat, lng: e.lng })),
    [props.militaryEvents]
  );

  return (
    <group>
      {props.layers.earthquakes && <EventMarkers events={earthquakePositions} color="#ff6600" />}
      {props.layers.military && <EventMarkers events={militaryPositions} color="#ff0040" />}
      {props.layers.cyberAttacks && <CyberAttackLines threats={props.cyberThreats} />}
      {props.layers.aircraft && <AircraftMarkers aircraft={props.aircraft} />}
      {props.layers.satellites && <SatelliteMarkers satellites={props.satellites} />}
      {props.layers.ships && <ShipMarkers ships={props.ships} />}
    </group>
  );
}

export { latLngToVector3 };
