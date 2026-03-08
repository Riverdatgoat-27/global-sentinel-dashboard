import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData, MissileEvent, InfrastructurePoint, MarineAnimal } from '@/types/intelligence';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  missiles?: MissileEvent[];
  infrastructure?: InfrastructurePoint[];
  marineAnimals?: MarineAnimal[];
  layers: {
    earthquakes: boolean;
    cyberAttacks: boolean;
    military: boolean;
    aircraft: boolean;
    satellites: boolean;
    ships: boolean;
    infrastructure: boolean;
    missiles: boolean;
    marineAnimals: boolean;
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

// Create emoji-like text sprite for markers
function createEmojiSprite(emoji: string, scale: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(scale);
  return sprite;
}

function EventMarkers({ events, color, pulseSpeed = 3 }: { events: { lat: number; lng: number }[]; color?: string; pulseSpeed?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.InstancedMesh>(null);
  const pulseRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || events.length === 0) return;
    pulseRef.current += delta;
    const scale = 1 + Math.sin(pulseRef.current * pulseSpeed) * 0.3;
    events.forEach((event, i) => {
      const pos = latLngToVector3(event.lat, event.lng);
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(scale * 0.02);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (ringRef.current) {
      const ringScale = 1 + ((pulseRef.current * 0.5) % 1) * 2;
      events.forEach((event, i) => {
        const pos = latLngToVector3(event.lat, event.lng);
        dummy.position.copy(pos);
        dummy.lookAt(0, 0, 0);
        dummy.scale.setScalar(ringScale * 0.015);
        dummy.updateMatrix();
        ringRef.current!.setMatrixAt(i, dummy.matrix);
      });
      ringRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (events.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, events.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color || '#ef4444'} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={ringRef} args={[undefined, undefined, events.length]}>
        <ringGeometry args={[0.8, 1, 16]} />
        <meshBasicMaterial color={color || '#ef4444'} transparent opacity={0.25} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

function CyberAttackLines({ threats }: { threats: CyberThreat[] }) {
  const groupRef = useRef<THREE.Group>(null);

  const lineObjects = useMemo(() => {
    return threats.map(threat => {
      const start = latLngToVector3(threat.sourceLat, threat.sourceLng, 2.02);
      const end = latLngToVector3(threat.targetLat, threat.targetLng, 2.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(2.5);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const color = threat.severity === 'critical' ? '#ff1744' : threat.severity === 'high' ? '#ff6d00' : '#2979ff';
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
      return new THREE.Line(geom, mat);
    });
  }, [threats]);

  return (
    <group ref={groupRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

function MissileArcs({ missiles }: { missiles: MissileEvent[] }) {
  const progressRef = useRef(0);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.4) % 1;
    if (meshRef.current) {
      missiles.forEach((m, i) => {
        const start = latLngToVector3(m.launchLat, m.launchLng, 2.02);
        const end = latLngToVector3(m.targetLat, m.targetLng, 2.02);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(3.0);
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const point = curve.getPoint(progressRef.current);
        dummy.position.copy(point);
        dummy.scale.setScalar(0.015);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const arcLines = useMemo(() => {
    return missiles.map(m => {
      const start = latLngToVector3(m.launchLat, m.launchLng, 2.02);
      const end = latLngToVector3(m.targetLat, m.targetLng, 2.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(3.0);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(60);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: '#ff1744', transparent: true, opacity: 0.7 });
      return new THREE.Line(geom, mat);
    });
  }, [missiles]);

  if (missiles.length === 0) return null;

  return (
    <group>
      {arcLines.map((obj, i) => (
        <primitive key={`arc-${i}`} object={obj} />
      ))}
      <instancedMesh ref={meshRef} args={[undefined, undefined, missiles.length]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ff1744" />
      </instancedMesh>
      <EventMarkers events={missiles.map(m => ({ lat: m.launchLat, lng: m.launchLng }))} color="#ff6d00" pulseSpeed={5} />
      <EventMarkers events={missiles.map(m => ({ lat: m.targetLat, lng: m.targetLng }))} color="#ff1744" pulseSpeed={6} />
    </group>
  );
}

// Aircraft with emoji sprites ✈️
function AircraftMarkers({ aircraft }: { aircraft: AircraftState[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    aircraft.forEach((ac) => {
      if (!ac.latitude || !ac.longitude) return;
      const isMilitary = ac.category === 'military' || ac.callsign?.startsWith('RCH') || ac.callsign?.startsWith('RRR');
      const isGov = ac.category === 'government' || ac.callsign?.startsWith('SAM') || ac.callsign?.startsWith('EXEC');

      const targetPos = latLngToVector3(ac.latitude, ac.longitude, 2.01 + (ac.altitude || 10000) / 1500000);
      const prevPos = prevPositions.current.get(ac.icao24);
      let pos: THREE.Vector3;
      if (prevPos) {
        pos = prevPos.clone().lerp(targetPos, Math.min(delta * 2, 1));
      } else {
        pos = targetPos;
      }
      prevPositions.current.set(ac.icao24, pos.clone());

      const emoji = isMilitary ? '🛩️' : isGov ? '🏛️' : '✈️';
      const scale = isMilitary ? 0.06 : isGov ? 0.055 : 0.045;
      const sprite = createEmojiSprite(emoji, scale);
      sprite.position.copy(pos);
      sprite.userData = { type: 'aircraft', data: ac };
      groupRef.current!.add(sprite);
    });
  });

  return <group ref={groupRef} />;
}

// Satellites with emoji 🛰️
function SatelliteMarkers({ satellites }: { satellites: SatelliteData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    satellites.forEach((sat) => {
      const alt = 2.01 + sat.altitude / 20000;
      const pos = latLngToVector3(sat.lat, sat.lng, Math.min(alt, 4));
      const emoji = sat.category === 'military' ? '🔴' : sat.name.includes('ISS') ? '🛸' : '🛰️';
      const scale = sat.category === 'military' ? 0.04 : 0.035;
      const sprite = createEmojiSprite(emoji, scale);
      sprite.position.copy(pos);
      groupRef.current!.add(sprite);
    });
  });

  const orbitLines = useMemo(() => {
    return satellites.filter(s => s.category === 'military' || s.name.includes('ISS')).slice(0, 3).map(sat => {
      const points: THREE.Vector3[] = [];
      const alt = 2.01 + sat.altitude / 20000;
      const r = Math.min(alt, 4);
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle) * 0.3, r * Math.sin(angle)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: sat.category === 'military' ? '#ff1744' : '#7c4dff', transparent: true, opacity: 0.12 });
      return new THREE.Line(geom, mat);
    });
  }, [satellites]);

  if (satellites.length === 0) return null;

  return (
    <group>
      <group ref={groupRef} />
      <group ref={orbitRef}>
        {orbitLines.map((obj, i) => <primitive key={`orbit-${i}`} object={obj} />)}
      </group>
    </group>
  );
}

// Ships with emoji 🚢⚓
function ShipMarkers({ ships }: { ships: ShipData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    ships.forEach((ship) => {
      const targetPos = latLngToVector3(ship.lat, ship.lng, 2.005);
      const prevPos = prevPositions.current.get(ship.id);
      let pos: THREE.Vector3;
      if (prevPos) {
        pos = prevPos.clone().lerp(targetPos, Math.min(delta * 2, 1));
      } else {
        pos = targetPos;
      }
      prevPositions.current.set(ship.id, pos.clone());

      let emoji = '🚢';
      let scale = 0.04;
      if (ship.type === 'naval') { emoji = '⚓'; scale = 0.05; }
      else if (ship.type === 'tanker') { emoji = '🛢️'; scale = 0.04; }
      else if (ship.type === 'fishing') { emoji = '🐟'; scale = 0.035; }
      else if (ship.type === 'passenger') { emoji = '🛳️'; scale = 0.045; }

      const sprite = createEmojiSprite(emoji, scale);
      sprite.position.copy(pos);
      sprite.userData = { type: 'ship', data: ship };
      groupRef.current!.add(sprite);
    });
  });

  return <group ref={groupRef} />;
}

// Marine animals with emoji 🐋🦈🐢🐬
function MarineAnimalMarkers({ animals }: { animals: MarineAnimal[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    animals.forEach((animal) => {
      const targetPos = latLngToVector3(animal.lat, animal.lng, 2.003);
      const prevPos = prevPositions.current.get(animal.id);
      let pos: THREE.Vector3;
      if (prevPos) {
        pos = prevPos.clone().lerp(targetPos, Math.min(delta * 2, 1));
      } else {
        pos = targetPos;
      }
      prevPositions.current.set(animal.id, pos.clone());

      const emojiMap: Record<string, string> = {
        whale: '🐋',
        shark: '🦈',
        turtle: '🐢',
        dolphin: '🐬',
        seal: '🦭',
      };

      const sprite = createEmojiSprite(emojiMap[animal.category] || '🐋', 0.045);
      sprite.position.copy(pos);
      sprite.userData = { type: 'marine', data: animal };
      groupRef.current!.add(sprite);
    });
  });

  return <group ref={groupRef} />;
}

function InfrastructureMarkers({ points }: { points: InfrastructurePoint[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    points.forEach((pt) => {
      const pos = latLngToVector3(pt.lat, pt.lng, 2.008);
      const emojiMap: Record<string, string> = {
        airport: '🛫',
        port: '⚓',
        military_base: '🎖️',
        nuclear_plant: '☢️',
        data_center: '💾',
      };
      const sprite = createEmojiSprite(emojiMap[pt.type] || '📍', 0.04);
      sprite.position.copy(pos);
      groupRef.current!.add(sprite);
    });
  });

  if (points.length === 0) return null;
  return <group ref={groupRef} />;
}

export default function GlobeMarkers(props: Props) {
  const earthquakePositions = useMemo(() => props.earthquakes.map(e => ({ lat: e.lat, lng: e.lng })), [props.earthquakes]);
  const militaryPositions = useMemo(() => props.militaryEvents.map(e => ({ lat: e.lat, lng: e.lng })), [props.militaryEvents]);

  return (
    <group>
      {props.layers.earthquakes && <EventMarkers events={earthquakePositions} color="#ff6d00" />}
      {props.layers.military && <EventMarkers events={militaryPositions} color="#ff1744" pulseSpeed={4} />}
      {props.layers.cyberAttacks && <CyberAttackLines threats={props.cyberThreats} />}
      {props.layers.aircraft && <AircraftMarkers aircraft={props.aircraft} />}
      {props.layers.satellites && <SatelliteMarkers satellites={props.satellites} />}
      {props.layers.ships && <ShipMarkers ships={props.ships} />}
      {props.layers.missiles && props.missiles && <MissileArcs missiles={props.missiles} />}
      {props.layers.infrastructure && props.infrastructure && <InfrastructureMarkers points={props.infrastructure} />}
      {props.layers.marineAnimals && props.marineAnimals && <MarineAnimalMarkers animals={props.marineAnimals} />}
    </group>
  );
}

export { latLngToVector3 };
