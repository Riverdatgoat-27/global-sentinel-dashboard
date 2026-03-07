import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend Three.js line for R3F
extend({ Line_: THREE.Line });

// Wireframe globe that looks cyberpunk/tactical
export default function EarthMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  const gridLines = useMemo(() => {
    const lines: { points: THREE.Vector3[] }[] = [];

    for (let lat = -80; lat <= 80; lat += 20) {
      const pts: THREE.Vector3[] = [];
      const phi = (90 - lat) * (Math.PI / 180);
      for (let lng = 0; lng <= 360; lng += 2) {
        const theta = lng * (Math.PI / 180);
        pts.push(new THREE.Vector3(
          -2 * Math.sin(phi) * Math.cos(theta),
          2 * Math.cos(phi),
          2 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      lines.push({ points: pts });
    }

    for (let lng = 0; lng < 360; lng += 20) {
      const pts: THREE.Vector3[] = [];
      const theta = lng * (Math.PI / 180);
      for (let lat = -90; lat <= 90; lat += 2) {
        const phi = (90 - lat) * (Math.PI / 180);
        pts.push(new THREE.Vector3(
          -2 * Math.sin(phi) * Math.cos(theta),
          2 * Math.cos(phi),
          2 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      lines.push({ points: pts });
    }

    return lines;
  }, []);

  const toSphere = (lat: number, lng: number, r = 2.005) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  };

  const continentPoints = useMemo(() => {
    const continents: THREE.Vector3[][] = [];

    // North America
    continents.push([
      toSphere(50, -130), toSphere(55, -130), toSphere(60, -140), toSphere(65, -165),
      toSphere(70, -160), toSphere(72, -155), toSphere(70, -140), toSphere(68, -135),
      toSphere(60, -125), toSphere(55, -120), toSphere(48, -123), toSphere(45, -124),
      toSphere(40, -120), toSphere(35, -118), toSphere(30, -115), toSphere(25, -110),
      toSphere(20, -105), toSphere(18, -95), toSphere(15, -90), toSphere(18, -88),
      toSphere(20, -87), toSphere(25, -80), toSphere(30, -82), toSphere(30, -85),
      toSphere(35, -75), toSphere(40, -74), toSphere(42, -70), toSphere(45, -67),
      toSphere(47, -60), toSphere(50, -55), toSphere(55, -60), toSphere(60, -65),
      toSphere(65, -62), toSphere(70, -55), toSphere(72, -60), toSphere(75, -80),
      toSphere(72, -95), toSphere(70, -100), toSphere(65, -115), toSphere(60, -120),
      toSphere(55, -125), toSphere(50, -130),
    ]);

    // South America
    continents.push([
      toSphere(10, -75), toSphere(5, -77), toSphere(0, -80), toSphere(-5, -80),
      toSphere(-10, -77), toSphere(-15, -75), toSphere(-20, -70), toSphere(-30, -72),
      toSphere(-40, -73), toSphere(-50, -75), toSphere(-55, -68), toSphere(-55, -65),
      toSphere(-45, -65), toSphere(-35, -57), toSphere(-25, -47), toSphere(-15, -39),
      toSphere(-5, -35), toSphere(0, -50), toSphere(5, -60), toSphere(10, -67), toSphere(10, -75),
    ]);

    // Europe
    continents.push([
      toSphere(36, -10), toSphere(43, -9), toSphere(48, -5), toSphere(51, 2),
      toSphere(55, 8), toSphere(60, 5), toSphere(65, 12), toSphere(70, 20),
      toSphere(70, 28), toSphere(60, 28), toSphere(50, 14), toSphere(45, 14),
      toSphere(40, 20), toSphere(35, 25), toSphere(38, 20), toSphere(40, 15),
      toSphere(42, 3), toSphere(38, 0), toSphere(36, -5), toSphere(36, -10),
    ]);

    // Africa
    continents.push([
      toSphere(35, -5), toSphere(37, 10), toSphere(30, 32), toSphere(15, 42),
      toSphere(5, 42), toSphere(-10, 40), toSphere(-25, 33), toSphere(-35, 20),
      toSphere(-30, 15), toSphere(-10, 14), toSphere(5, 2), toSphere(5, -5),
      toSphere(10, -15), toSphere(20, -17), toSphere(30, -10), toSphere(35, -5),
    ]);

    // Asia
    continents.push([
      toSphere(42, 28), toSphere(45, 40), toSphere(55, 55), toSphere(60, 60),
      toSphere(70, 80), toSphere(72, 100), toSphere(70, 130), toSphere(65, 140),
      toSphere(55, 140), toSphere(45, 132), toSphere(35, 128), toSphere(25, 120),
      toSphere(22, 108), toSphere(10, 105), toSphere(0, 105), toSphere(-8, 115),
      toSphere(-5, 120), toSphere(5, 120), toSphere(20, 110), toSphere(28, 90),
      toSphere(25, 80), toSphere(30, 70), toSphere(40, 55), toSphere(42, 28),
    ]);

    // Australia
    continents.push([
      toSphere(-15, 130), toSphere(-12, 135), toSphere(-18, 146), toSphere(-28, 153),
      toSphere(-38, 145), toSphere(-35, 137), toSphere(-30, 115), toSphere(-22, 114),
      toSphere(-14, 127), toSphere(-15, 130),
    ]);

    return continents;
  }, []);

  // Build line objects
  const gridLineObjects = useMemo(() =>
    gridLines.map(l => {
      const geom = new THREE.BufferGeometry().setFromPoints(l.points);
      const mat = new THREE.LineBasicMaterial({ color: '#0a3d0a', transparent: true, opacity: 0.15 });
      return new THREE.Line(geom, mat);
    }),
    [gridLines]
  );

  const continentLineObjects = useMemo(() =>
    continentPoints.map(pts => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: '#00ff41', transparent: true, opacity: 0.6 });
      return new THREE.Line(geom, mat);
    }),
    [continentPoints]
  );

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.99, 64, 64]} />
        <meshBasicMaterial color="#050a12" transparent opacity={0.95} />
      </mesh>

      {gridLineObjects.map((obj, i) => (
        <primitive key={`grid-${i}`} object={obj} />
      ))}

      {continentLineObjects.map((obj, i) => (
        <primitive key={`cont-${i}`} object={obj} />
      ))}

      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
        <meshBasicMaterial color="#00ff41" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.25, 64, 64]} />
        <meshBasicMaterial color="#003311" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
