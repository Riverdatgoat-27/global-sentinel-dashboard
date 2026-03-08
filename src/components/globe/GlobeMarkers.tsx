import { useRef, useMemo } from 'react';
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

// Pulsing event markers with ring effect
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

    // Rings
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
        <meshBasicMaterial color={color || '#ff0040'} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={ringRef} args={[undefined, undefined, events.length]}>
        <ringGeometry args={[0.8, 1, 16]} />
        <meshBasicMaterial color={color || '#ff0040'} transparent opacity={0.3} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

function CyberAttackLines({ threats }: { threats: CyberThreat[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.3) % 1;
  });

  const lineObjects = useMemo(() => {
    return threats.map(threat => {
      const start = latLngToVector3(threat.sourceLat, threat.sourceLng, 2.02);
      const end = latLngToVector3(threat.targetLat, threat.targetLng, 2.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(2.5);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const color = threat.severity === 'critical' ? '#ff0040' : threat.severity === 'high' ? '#ff8800' : '#00aaff';
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
        mid.normalize().multiplyScalar(3.0); // Higher arc for missiles
        
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
      const mat = new THREE.LineBasicMaterial({ color: '#ff0040', transparent: true, opacity: 0.8 });
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
        <meshBasicMaterial color="#ff0040" />
      </instancedMesh>
      {/* Launch markers */}
      <EventMarkers 
        events={missiles.map(m => ({ lat: m.launchLat, lng: m.launchLng }))} 
        color="#ff4400" 
        pulseSpeed={5}
      />
      {/* Target markers */}
      <EventMarkers 
        events={missiles.map(m => ({ lat: m.targetLat, lng: m.targetLng }))} 
        color="#ff0040" 
        pulseSpeed={6}
      />
    </group>
  );
}

function AircraftMarkers({ aircraft }: { aircraft: AircraftState[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const milRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { civilian, military } = useMemo(() => {
    const mil = aircraft.filter(a => 
      a.callsign?.startsWith('MIL') || 
      a.category === 'military' ||
      ['United States', 'Russia', 'China'].includes(a.originCountry) && (a.velocity || 0) > 280
    );
    const civ = aircraft.filter(a => !mil.includes(a));
    return { civilian: civ, military: mil };
  }, [aircraft]);

  useFrame(() => {
    if (meshRef.current && civilian.length > 0) {
      civilian.forEach((ac, i) => {
        if (!ac.latitude || !ac.longitude) return;
        const alt = 2.01 + (ac.altitude || 10000) / 1000000;
        const pos = latLngToVector3(ac.latitude, ac.longitude, alt);
        dummy.position.copy(pos);
        dummy.scale.setScalar(0.008);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (milRef.current && military.length > 0) {
      military.forEach((ac, i) => {
        if (!ac.latitude || !ac.longitude) return;
        const alt = 2.01 + (ac.altitude || 10000) / 1000000;
        const pos = latLngToVector3(ac.latitude, ac.longitude, alt);
        dummy.position.copy(pos);
        dummy.scale.setScalar(0.012);
        dummy.updateMatrix();
        milRef.current!.setMatrixAt(i, dummy.matrix);
      });
      milRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {civilian.length > 0 && (
        <instancedMesh ref={meshRef} args={[undefined, undefined, civilian.length]}>
          <boxGeometry args={[1, 0.3, 1.5]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.8} />
        </instancedMesh>
      )}
      {military.length > 0 && (
        <instancedMesh ref={milRef} args={[undefined, undefined, military.length]}>
          <boxGeometry args={[1.2, 0.4, 1.8]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.9} />
        </instancedMesh>
      )}
    </group>
  );
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

  // Orbit rings for a few key satellites
  const orbitLines = useMemo(() => {
    return satellites.filter(s => s.category === 'military' || s.name.includes('ISS')).slice(0, 3).map(sat => {
      const points: THREE.Vector3[] = [];
      const alt = 2.01 + sat.altitude / 20000;
      const r = Math.min(alt, 4);
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          r * Math.cos(angle),
          r * Math.sin(angle) * 0.3,
          r * Math.sin(angle)
        ));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ 
        color: sat.category === 'military' ? '#ff4444' : '#4444ff', 
        transparent: true, 
        opacity: 0.15 
      });
      return new THREE.Line(geom, mat);
    });
  }, [satellites]);

  if (satellites.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, satellites.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#8888ff" transparent opacity={0.7} />
      </instancedMesh>
      <group ref={orbitRef}>
        {orbitLines.map((obj, i) => (
          <primitive key={`orbit-${i}`} object={obj} />
        ))}
      </group>
    </group>
  );
}

function ShipMarkers({ ships }: { ships: ShipData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const navalRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { civilian: civShips, naval } = useMemo(() => {
    const nav = ships.filter(s => s.type === 'naval');
    const civ = ships.filter(s => s.type !== 'naval');
    return { civilian: civ, naval: nav };
  }, [ships]);

  useFrame(() => {
    if (meshRef.current && civShips.length > 0) {
      civShips.forEach((ship, i) => {
        const pos = latLngToVector3(ship.lat, ship.lng, 2.005);
        dummy.position.copy(pos);
        dummy.scale.setScalar(0.012);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (navalRef.current && naval.length > 0) {
      naval.forEach((ship, i) => {
        const pos = latLngToVector3(ship.lat, ship.lng, 2.005);
        dummy.position.copy(pos);
        dummy.scale.setScalar(0.02);
        dummy.updateMatrix();
        navalRef.current!.setMatrixAt(i, dummy.matrix);
      });
      navalRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {civShips.length > 0 && (
        <instancedMesh ref={meshRef} args={[undefined, undefined, civShips.length]}>
          <coneGeometry args={[1, 2, 4]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.7} />
        </instancedMesh>
      )}
      {naval.length > 0 && (
        <instancedMesh ref={navalRef} args={[undefined, undefined, naval.length]}>
          <coneGeometry args={[1, 2, 4]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.9} />
        </instancedMesh>
      )}
    </group>
  );
}

function InfrastructureMarkers({ points }: { points: InfrastructurePoint[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colorMap: Record<string, string> = {
    airport: '#00ccff',
    port: '#00ff88',
    military_base: '#ff4400',
    nuclear_plant: '#ffff00',
    data_center: '#aa88ff',
  };

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
      <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
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
      {props.layers.military && <EventMarkers events={militaryPositions} color="#ff0040" pulseSpeed={4} />}
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
