import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { countryLabels } from '@/data/mockData';

extend({ Line_: THREE.Line });

function latLngToVec3(lat: number, lng: number, r = 2.005): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Create text sprite for labels
function createTextSprite(text: string, size: 'large' | 'medium' | 'small'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const fontSize = size === 'large' ? 28 : size === 'medium' ? 20 : 14;
  const padding = 4;
  
  canvas.width = 256;
  canvas.height = 64;
  
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${fontSize}px "Inter", "IBM Plex Mono", sans-serif`;
  ctx.fillStyle = size === 'large' 
    ? 'rgba(140, 160, 190, 0.6)' 
    : size === 'medium' 
      ? 'rgba(120, 140, 165, 0.45)' 
      : 'rgba(100, 120, 145, 0.3)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '2px';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });
  
  const sprite = new THREE.Sprite(mat);
  const scale = size === 'large' ? 0.6 : size === 'medium' ? 0.4 : 0.28;
  sprite.scale.set(scale * 2, scale * 0.5, 1);
  
  return sprite;
}

export default function EarthMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.025;
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

  // Country label sprites
  const labelSprites = useMemo(() => {
    return countryLabels.map(label => {
      const sprite = createTextSprite(label.name, label.size);
      const pos = latLngToVec3(label.lat, label.lng, 2.03);
      sprite.position.copy(pos);
      return sprite;
    });
  }, []);

  const gridLineObjects = useMemo(() =>
    gridLines.map(l => {
      const geom = new THREE.BufferGeometry().setFromPoints(l.points);
      const mat = new THREE.LineBasicMaterial({ color: '#1a2540', transparent: true, opacity: 0.2 });
      return new THREE.Line(geom, mat);
    }),
    [gridLines]
  );

  const continentLineObjects = useMemo(() =>
    continentPoints.map(pts => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: '#4a7ab5', transparent: true, opacity: 0.5 });
      return new THREE.Line(geom, mat);
    }),
    [continentPoints]
  );

  return (
    <group ref={groupRef}>
      {/* Globe sphere */}
      <mesh>
        <sphereGeometry args={[1.99, 64, 64]} />
        <meshBasicMaterial color="#080e18" transparent opacity={0.97} />
      </mesh>

      {/* Grid lines */}
      {gridLineObjects.map((obj, i) => (
        <primitive key={`grid-${i}`} object={obj} />
      ))}

      {/* Continent outlines */}
      {continentLineObjects.map((obj, i) => (
        <primitive key={`cont-${i}`} object={obj} />
      ))}

      {/* Country labels */}
      {labelSprites.map((sprite, i) => (
        <primitive key={`label-${i}`} object={sprite} />
      ))}

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.12, 64, 64]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.025} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.22, 64, 64]} />
        <meshBasicMaterial color="#1e40af" transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
