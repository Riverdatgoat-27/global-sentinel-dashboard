import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeEvent, CyberThreat, AircraftState, SatelliteData, ShipData, MissileEvent, InfrastructurePoint } from '@/types/intelligence';

interface Props {
  earthquakes: GlobeEvent[];
  cyberThreats: CyberThreat[];
  militaryEvents: GlobeEvent[];
  aircraft: AircraftState[];
  satellites: SatelliteData[];
  ships: ShipData[];
  missiles?: MissileEvent[];
  infrastructure?: InfrastructurePoint[];
  layers: {
    earthquakes: boolean;
    cyberAttacks: boolean;
    military: boolean;
    aircraft: boolean;
    satellites: boolean;
    ships: boolean;
    infrastructure: boolean;
    missiles: boolean;
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

// Create an airplane shape
function createAircraftShape(): THREE.Shape {
  const s = new THREE.Shape();
  // Fuselage
  s.moveTo(0, 1.2);
  s.lineTo(0.15, 0.4);
  // Right wing
  s.lineTo(1, 0.2);
  s.lineTo(1, 0);
  s.lineTo(0.15, -0.1);
  // Right tail
  s.lineTo(0.15, -0.8);
  s.lineTo(0.5, -1.2);
  s.lineTo(0.5, -1.3);
  s.lineTo(0, -0.9);
  // Left tail
  s.lineTo(-0.5, -1.3);
  s.lineTo(-0.5, -1.2);
  s.lineTo(-0.15, -0.8);
  // Left wing
  s.lineTo(-0.15, -0.1);
  s.lineTo(-1, 0);
  s.lineTo(-1, 0.2);
  s.lineTo(-0.15, 0.4);
  s.lineTo(0, 1.2);
  return s;
}

// Create a ship shape (top-down hull)
function createShipShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 1.5);    // Bow
  s.lineTo(0.4, 0.6);
  s.lineTo(0.45, -0.5);
  s.lineTo(0.3, -1.2);
  s.lineTo(0, -1.5);   // Stern
  s.lineTo(-0.3, -1.2);
  s.lineTo(-0.45, -0.5);
  s.lineTo(-0.4, 0.6);
  s.lineTo(0, 1.5);
  return s;
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
      const color = threat.severity === 'critical' ? '#dc2626' : threat.severity === 'high' ? '#ea580c' : '#2563eb';
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
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
      const mat = new THREE.LineBasicMaterial({ color: '#dc2626', transparent: true, opacity: 0.7 });
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
        <meshBasicMaterial color="#dc2626" />
      </instancedMesh>
      <EventMarkers events={missiles.map(m => ({ lat: m.launchLat, lng: m.launchLng }))} color="#ea580c" pulseSpeed={5} />
      <EventMarkers events={missiles.map(m => ({ lat: m.targetLat, lng: m.targetLng }))} color="#dc2626" pulseSpeed={6} />
    </group>
  );
}

// Aircraft with proper airplane silhouettes that move along heading
function AircraftMarkers({ aircraft }: { aircraft: AircraftState[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  const aircraftGeom = useMemo(() => {
    const shape = createAircraftShape();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const civMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#38bdf8', transparent: true, opacity: 0.85, side: THREE.DoubleSide 
  }), []);
  const milMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ef4444', transparent: true, opacity: 0.9, side: THREE.DoubleSide 
  }), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Remove old meshes
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }
    meshesRef.current = [];

    aircraft.forEach((ac) => {
      if (!ac.latitude || !ac.longitude) return;

      const isMilitary = ac.callsign?.startsWith('MIL') || ac.category === 'military' ||
        (['United States', 'Russia', 'China'].includes(ac.originCountry) && (ac.velocity || 0) > 280);

      // Smooth position interpolation
      const targetPos = latLngToVector3(ac.latitude, ac.longitude, 2.01 + (ac.altitude || 10000) / 1500000);
      const prevPos = prevPositions.current.get(ac.icao24);
      let pos: THREE.Vector3;
      if (prevPos) {
        pos = prevPos.clone().lerp(targetPos, Math.min(delta * 2, 1));
      } else {
        pos = targetPos;
      }
      prevPositions.current.set(ac.icao24, pos.clone());

      const mesh = new THREE.Mesh(aircraftGeom, isMilitary ? milMat : civMat);
      mesh.position.copy(pos);

      // Orient to face away from globe center
      mesh.lookAt(0, 0, 0);
      mesh.rotateX(Math.PI); // flip to face outward

      // Rotate by heading on the surface plane
      if (ac.heading) {
        mesh.rotateZ((-ac.heading * Math.PI) / 180);
      }

      mesh.scale.setScalar(isMilitary ? 0.012 : 0.008);
      mesh.userData = { type: 'aircraft', data: ac };

      groupRef.current!.add(mesh);
      meshesRef.current.push(mesh);
    });
  });

  return <group ref={groupRef} />;
}

function SatelliteMarkers({ satellites }: { satellites: SatelliteData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || satellites.length === 0) return;
    satellites.forEach((sat, i) => {
      const alt = 2.01 + sat.altitude / 20000;
      const pos = latLngToVector3(sat.lat, sat.lng, Math.min(alt, 4));
      dummy.position.copy(pos);
      dummy.scale.setScalar(sat.category === 'military' ? 0.014 : 0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
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
      const mat = new THREE.LineBasicMaterial({ color: sat.category === 'military' ? '#ef4444' : '#6366f1', transparent: true, opacity: 0.12 });
      return new THREE.Line(geom, mat);
    });
  }, [satellites]);

  if (satellites.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, satellites.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.7} />
      </instancedMesh>
      <group ref={orbitRef}>
        {orbitLines.map((obj, i) => <primitive key={`orbit-${i}`} object={obj} />)}
      </group>
    </group>
  );
}

// Ships with hull shapes that move along heading in real-time
function ShipMarkers({ ships }: { ships: ShipData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  const shipGeom = useMemo(() => {
    const shape = createShipShape();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const civMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#34d399', transparent: true, opacity: 0.8, side: THREE.DoubleSide 
  }), []);
  const navalMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#f87171', transparent: true, opacity: 0.9, side: THREE.DoubleSide 
  }), []);
  const tankerMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#fbbf24', transparent: true, opacity: 0.8, side: THREE.DoubleSide 
  }), []);

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

      let mat = civMat;
      if (ship.type === 'naval') mat = navalMat;
      else if (ship.type === 'tanker') mat = tankerMat;

      const mesh = new THREE.Mesh(shipGeom, mat);
      mesh.position.copy(pos);
      mesh.lookAt(0, 0, 0);
      mesh.rotateX(Math.PI);
      mesh.rotateZ((-ship.heading * Math.PI) / 180);
      mesh.scale.setScalar(ship.type === 'naval' ? 0.014 : 0.009);
      mesh.userData = { type: 'ship', data: ship };

      groupRef.current!.add(mesh);
    });
  });

  return <group ref={groupRef} />;
}

function InfrastructureMarkers({ points }: { points: InfrastructurePoint[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || points.length === 0) return;
    points.forEach((pt, i) => {
      const pos = latLngToVector3(pt.lat, pt.lng, 2.008);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (points.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
    </instancedMesh>
  );
}

export default function GlobeMarkers(props: Props) {
  const earthquakePositions = useMemo(() => props.earthquakes.map(e => ({ lat: e.lat, lng: e.lng })), [props.earthquakes]);
  const militaryPositions = useMemo(() => props.militaryEvents.map(e => ({ lat: e.lat, lng: e.lng })), [props.militaryEvents]);

  return (
    <group>
      {props.layers.earthquakes && <EventMarkers events={earthquakePositions} color="#ea580c" />}
      {props.layers.military && <EventMarkers events={militaryPositions} color="#dc2626" pulseSpeed={4} />}
      {props.layers.cyberAttacks && <CyberAttackLines threats={props.cyberThreats} />}
      {props.layers.aircraft && <AircraftMarkers aircraft={props.aircraft} />}
      {props.layers.satellites && <SatelliteMarkers satellites={props.satellites} />}
      {props.layers.ships && <ShipMarkers ships={props.ships} />}
      {props.layers.missiles && props.missiles && <MissileArcs missiles={props.missiles} />}
      {props.layers.infrastructure && props.infrastructure && <InfrastructureMarkers points={props.infrastructure} />}
    </group>
  );
}

export { latLngToVector3 };
