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

const toSphere = (lat: number, lng: number, r = 2.005) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
};

function createTextSprite(text: string, size: 'large' | 'medium' | 'small'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const fontSize = size === 'large' ? 22 : size === 'medium' ? 15 : 10;
  canvas.width = 256;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `600 ${fontSize}px \"Inter\", sans-serif`;
  ctx.fillStyle = size === 'large'
    ? 'rgba(100, 180, 255, 0.45)'
    : size === 'medium'
      ? 'rgba(80, 155, 220, 0.3)'
      : 'rgba(70, 140, 200, 0.2)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(mat);
  const scale = size === 'large' ? 0.55 : size === 'medium' ? 0.35 : 0.24;
  sprite.scale.set(scale * 2, scale * 0.5, 1);
  return sprite;
}

export default function EarthMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const gridLines = useMemo(() => {
    const lines: { points: THREE.Vector3[] }[] = [];
    for (let lat = -80; lat <= 80; lat += 15) {
      const pts: THREE.Vector3[] = [];
      const phi = (90 - lat) * (Math.PI / 180);
      for (let lng = 0; lng <= 360; lng += 2) {
        const theta = lng * (Math.PI / 180);
        pts.push(new THREE.Vector3(
          -2 * Math.sin(phi) * Math.cos(theta), 2 * Math.cos(phi), 2 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      lines.push({ points: pts });
    }
    for (let lng = 0; lng < 360; lng += 15) {
      const pts: THREE.Vector3[] = [];
      const theta = lng * (Math.PI / 180);
      for (let lat = -90; lat <= 90; lat += 2) {
        const phi = (90 - lat) * (Math.PI / 180);
        pts.push(new THREE.Vector3(
          -2 * Math.sin(phi) * Math.cos(theta), 2 * Math.cos(phi), 2 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      lines.push({ points: pts });
    }
    return lines;
  }, []);

  const continentPoints = useMemo(() => {
    const c: THREE.Vector3[][] = [];
    // North America
    c.push([
      toSphere(49, -125), toSphere(48, -124), toSphere(46, -124), toSphere(43, -124),
      toSphere(40, -122), toSphere(37, -122), toSphere(35, -120), toSphere(33, -117),
      toSphere(31, -116), toSphere(29, -114), toSphere(27, -112), toSphere(24, -110),
      toSphere(23, -106), toSphere(20, -105), toSphere(18, -103), toSphere(16, -96),
      toSphere(15, -92), toSphere(16, -90), toSphere(18, -88), toSphere(19, -87),
      toSphere(21, -87), toSphere(23, -82), toSphere(25, -80), toSphere(27, -80),
      toSphere(29, -81), toSphere(30, -84), toSphere(30, -88), toSphere(29, -90),
      toSphere(30, -90), toSphere(30, -94), toSphere(28, -97), toSphere(26, -97),
    ]);
    c.push([
      toSphere(25, -80), toSphere(27, -80), toSphere(30, -81), toSphere(32, -81),
      toSphere(34, -78), toSphere(35, -76), toSphere(37, -76), toSphere(38, -75),
      toSphere(39, -74), toSphere(40, -74), toSphere(41, -72), toSphere(42, -71),
      toSphere(43, -70), toSphere(45, -67), toSphere(47, -68), toSphere(48, -65),
      toSphere(47, -61), toSphere(46, -60), toSphere(45, -62), toSphere(44, -64),
      toSphere(44, -66), toSphere(43, -66),
    ]);
    c.push([
      toSphere(49, -125), toSphere(52, -128), toSphere(55, -130), toSphere(58, -136),
      toSphere(60, -141), toSphere(61, -141), toSphere(64, -142), toSphere(67, -163),
      toSphere(71, -157), toSphere(72, -155), toSphere(71, -151), toSphere(70, -145),
    ]);
    c.push([
      toSphere(48, -55), toSphere(50, -56), toSphere(52, -56), toSphere(55, -60),
      toSphere(58, -62), toSphere(60, -65), toSphere(63, -68), toSphere(65, -62),
      toSphere(70, -55), toSphere(73, -57), toSphere(75, -80), toSphere(73, -95),
      toSphere(70, -100), toSphere(67, -110), toSphere(63, -120), toSphere(60, -125),
      toSphere(55, -125), toSphere(52, -128), toSphere(50, -127), toSphere(49, -125),
    ]);
    // South America
    c.push([
      toSphere(12, -72), toSphere(11, -75), toSphere(8, -77), toSphere(5, -77),
      toSphere(2, -78), toSphere(0, -80), toSphere(-3, -80), toSphere(-5, -81),
      toSphere(-6, -81), toSphere(-14, -76), toSphere(-18, -71), toSphere(-23, -70),
      toSphere(-27, -71), toSphere(-33, -72), toSphere(-39, -73), toSphere(-43, -74),
      toSphere(-46, -75), toSphere(-50, -74), toSphere(-52, -70), toSphere(-55, -67),
      toSphere(-55, -65), toSphere(-52, -68), toSphere(-48, -66), toSphere(-42, -64),
      toSphere(-38, -58), toSphere(-35, -57), toSphere(-33, -53), toSphere(-28, -49),
      toSphere(-23, -44), toSphere(-18, -39), toSphere(-12, -37), toSphere(-8, -35),
      toSphere(-5, -35), toSphere(-2, -42), toSphere(0, -50), toSphere(3, -52),
      toSphere(5, -60), toSphere(8, -60), toSphere(10, -62), toSphere(11, -65),
      toSphere(12, -70), toSphere(12, -72),
    ]);
    // Europe
    c.push([
      toSphere(36, -9), toSphere(37, -9), toSphere(40, -9), toSphere(42, -9),
      toSphere(43, -8), toSphere(44, -1), toSphere(46, -1), toSphere(48, -5),
      toSphere(48, -4), toSphere(49, -1), toSphere(50, 1), toSphere(51, 2),
      toSphere(51, 4), toSphere(53, 5), toSphere(54, 8), toSphere(55, 8),
      toSphere(55, 10), toSphere(56, 10), toSphere(57, 12), toSphere(59, 11),
      toSphere(61, 5), toSphere(63, 5), toSphere(65, 12), toSphere(68, 15),
      toSphere(70, 20), toSphere(71, 26), toSphere(70, 28), toSphere(68, 28),
      toSphere(66, 26), toSphere(64, 28), toSphere(61, 28), toSphere(59, 24),
      toSphere(57, 22), toSphere(55, 21), toSphere(54, 18), toSphere(54, 14),
      toSphere(51, 14), toSphere(49, 14), toSphere(47, 16), toSphere(46, 14),
      toSphere(44, 14), toSphere(43, 16), toSphere(41, 17), toSphere(40, 20),
      toSphere(38, 24), toSphere(35, 24), toSphere(37, 22), toSphere(38, 16),
      toSphere(39, 10), toSphere(41, 10), toSphere(44, 9), toSphere(44, 7),
      toSphere(42, 3), toSphere(39, 0), toSphere(37, -2), toSphere(36, -5),
      toSphere(36, -9),
    ]);
    // Africa
    c.push([
      toSphere(37, -1), toSphere(35, -5), toSphere(34, -6), toSphere(32, -9),
      toSphere(28, -13), toSphere(25, -16), toSphere(21, -17), toSphere(16, -16),
      toSphere(12, -17), toSphere(10, -15), toSphere(6, -10), toSphere(5, -7),
      toSphere(5, -4), toSphere(5, 0), toSphere(4, 7), toSphere(4, 10),
      toSphere(2, 10), toSphere(0, 9), toSphere(-3, 12), toSphere(-6, 12),
      toSphere(-10, 14), toSphere(-12, 14), toSphere(-15, 12), toSphere(-18, 15),
      toSphere(-22, 15), toSphere(-25, 15), toSphere(-27, 17), toSphere(-30, 17),
      toSphere(-33, 18), toSphere(-34, 18), toSphere(-34, 22), toSphere(-33, 26),
      toSphere(-32, 28), toSphere(-30, 31), toSphere(-27, 33), toSphere(-24, 35),
      toSphere(-20, 35), toSphere(-15, 40), toSphere(-12, 44), toSphere(-10, 40),
      toSphere(-5, 42), toSphere(0, 42), toSphere(5, 42), toSphere(10, 45),
      toSphere(12, 44), toSphere(14, 42), toSphere(15, 42), toSphere(20, 40),
      toSphere(25, 37), toSphere(28, 34), toSphere(30, 32), toSphere(32, 32),
      toSphere(33, 28), toSphere(35, 20), toSphere(37, 10), toSphere(37, -1),
    ]);
    // Asia
    c.push([
      toSphere(42, 28), toSphere(44, 34), toSphere(42, 42), toSphere(40, 44),
      toSphere(38, 48), toSphere(40, 52), toSphere(42, 54), toSphere(45, 55),
      toSphere(50, 55), toSphere(55, 60), toSphere(55, 65), toSphere(58, 70),
      toSphere(60, 70), toSphere(65, 80), toSphere(68, 85), toSphere(70, 100),
      toSphere(72, 110), toSphere(73, 120), toSphere(72, 130), toSphere(70, 136),
      toSphere(68, 140), toSphere(65, 140), toSphere(60, 143), toSphere(55, 140),
      toSphere(53, 141), toSphere(50, 140), toSphere(47, 138), toSphere(45, 136),
      toSphere(43, 132), toSphere(40, 127), toSphere(38, 125), toSphere(35, 126),
      toSphere(35, 129),
    ]);
    c.push([
      toSphere(35, 129), toSphere(32, 132), toSphere(30, 122), toSphere(28, 121),
      toSphere(25, 120), toSphere(22, 114), toSphere(20, 110), toSphere(18, 108),
      toSphere(15, 108), toSphere(12, 105), toSphere(8, 100), toSphere(5, 103),
      toSphere(2, 104), toSphere(0, 105), toSphere(-6, 106), toSphere(-8, 110),
    ]);
    c.push([
      toSphere(42, 28), toSphere(40, 30), toSphere(38, 28), toSphere(37, 30),
      toSphere(36, 36), toSphere(35, 36), toSphere(33, 35), toSphere(32, 35),
      toSphere(30, 35), toSphere(28, 34), toSphere(25, 37), toSphere(15, 43),
      toSphere(12, 45), toSphere(10, 51), toSphere(15, 52), toSphere(22, 60),
      toSphere(25, 62), toSphere(25, 67), toSphere(23, 68), toSphere(20, 73),
      toSphere(15, 74), toSphere(10, 77), toSphere(8, 77), toSphere(6, 80),
      toSphere(8, 82), toSphere(12, 80), toSphere(15, 80), toSphere(18, 84),
      toSphere(20, 87), toSphere(22, 89), toSphere(23, 89), toSphere(26, 89),
      toSphere(28, 90), toSphere(28, 96), toSphere(20, 93), toSphere(17, 96),
      toSphere(15, 98), toSphere(12, 99), toSphere(10, 99),
    ]);
    // Australia
    c.push([
      toSphere(-12, 131), toSphere(-12, 136), toSphere(-14, 136), toSphere(-16, 137),
      toSphere(-17, 139), toSphere(-16, 141), toSphere(-18, 146), toSphere(-21, 149),
      toSphere(-24, 152), toSphere(-27, 153), toSphere(-29, 153), toSphere(-32, 152),
      toSphere(-34, 151), toSphere(-37, 150), toSphere(-38, 145), toSphere(-39, 146),
      toSphere(-38, 141), toSphere(-35, 137), toSphere(-34, 136), toSphere(-32, 133),
      toSphere(-32, 128), toSphere(-34, 122), toSphere(-34, 116), toSphere(-32, 115),
      toSphere(-29, 114), toSphere(-25, 113), toSphere(-22, 114), toSphere(-20, 118),
      toSphere(-18, 122), toSphere(-16, 124), toSphere(-15, 129), toSphere(-14, 130),
      toSphere(-12, 131),
    ]);
    // Japan
    c.push([
      toSphere(31, 131), toSphere(33, 130), toSphere(34, 131), toSphere(34, 133),
      toSphere(35, 135), toSphere(36, 136), toSphere(37, 137), toSphere(38, 139),
      toSphere(39, 140), toSphere(41, 140), toSphere(42, 141), toSphere(43, 145),
      toSphere(44, 145), toSphere(45, 142), toSphere(43, 141), toSphere(42, 140),
      toSphere(40, 140), toSphere(38, 138), toSphere(36, 136), toSphere(34, 132),
      toSphere(32, 131), toSphere(31, 131),
    ]);
    // UK
    c.push([
      toSphere(50, -5), toSphere(51, -3), toSphere(52, -5), toSphere(52, -3),
      toSphere(53, -3), toSphere(54, -3), toSphere(55, -2), toSphere(57, -2),
      toSphere(58, -3), toSphere(58, -5), toSphere(57, -6), toSphere(56, -5),
      toSphere(55, -5), toSphere(54, -5), toSphere(53, -5), toSphere(52, -4),
      toSphere(51, -5), toSphere(50, -5),
    ]);
    // NZ
    c.push([
      toSphere(-35, 174), toSphere(-37, 176), toSphere(-38, 178),
      toSphere(-41, 175), toSphere(-42, 172), toSphere(-44, 170),
      toSphere(-46, 167), toSphere(-46, 168), toSphere(-44, 172),
      toSphere(-41, 174), toSphere(-38, 176), toSphere(-35, 174),
    ]);
    // Madagascar
    c.push([
      toSphere(-12, 49), toSphere(-16, 50), toSphere(-20, 44), toSphere(-23, 44),
      toSphere(-25, 46), toSphere(-24, 47), toSphere(-20, 48), toSphere(-16, 50),
      toSphere(-12, 49),
    ]);
    return c;
  }, []);

  const borderLines = useMemo(() => {
    const borders: THREE.Vector3[][] = [];
    borders.push([toSphere(49, -125), toSphere(49, -120), toSphere(49, -110), toSphere(49, -100), toSphere(49, -90), toSphere(48, -88), toSphere(46, -84), toSphere(44, -82), toSphere(43, -79), toSphere(44, -76), toSphere(45, -74), toSphere(47, -68)]);
    borders.push([toSphere(33, -117), toSphere(32, -114), toSphere(32, -111), toSphere(31, -108), toSphere(30, -105), toSphere(29, -103), toSphere(28, -100), toSphere(26, -97)]);
    borders.push([toSphere(50, 80), toSphere(50, 90), toSphere(48, 100), toSphere(46, 110), toSphere(44, 120), toSphere(43, 130), toSphere(45, 132)]);
    borders.push([toSphere(28, 76), toSphere(30, 80), toSphere(28, 84), toSphere(27, 88), toSphere(28, 92), toSphere(28, 96)]);
    return borders;
  }, []);

  const labelSprites = useMemo(() => {
    return countryLabels.map(label => {
      const sprite = createTextSprite(label.name, label.size);
      const pos = latLngToVec3(label.lat, label.lng, 2.025);
      sprite.position.copy(pos);
      return sprite;
    });
  }, []);

  const gridLineObjects = useMemo(() =>
    gridLines.map(l => {
      const geom = new THREE.BufferGeometry().setFromPoints(l.points);
      const mat = new THREE.LineBasicMaterial({ color: '#0d2847', transparent: true, opacity: 0.2 });
      return new THREE.Line(geom, mat);
    }),
    [gridLines]
  );

  const continentLineObjects = useMemo(() =>
    continentPoints.map(pts => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: '#4a90d9', transparent: true, opacity: 0.6 });
      return new THREE.Line(geom, mat);
    }),
    [continentPoints]
  );

  const borderLineObjects = useMemo(() =>
    borderLines.map(pts => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: '#2a5599', transparent: true, opacity: 0.3 });
      return new THREE.Line(geom, mat);
    }),
    [borderLines]
  );

  return (
    <group ref={groupRef}>
      {/* Ocean - darker, richer blue-black */}
      <mesh>
        <sphereGeometry args={[1.99, 80, 80]} />
        <meshBasicMaterial color="#040a18" transparent opacity={0.98} />
      </mesh>
      {/* Subtle land glow */}
      <mesh>
        <sphereGeometry args={[1.995, 80, 80]} />
        <meshBasicMaterial color="#081a35" transparent opacity={0.4} />
      </mesh>

      {gridLineObjects.map((obj, i) => <primitive key={`g-${i}`} object={obj} />)}
      {continentLineObjects.map((obj, i) => <primitive key={`c-${i}`} object={obj} />)}
      {borderLineObjects.map((obj, i) => <primitive key={`b-${i}`} object={obj} />)}
      {labelSprites.map((sprite, i) => <primitive key={`l-${i}`} object={sprite} />)}

      {/* Atmosphere - more visible glow */}
      <mesh>
        <sphereGeometry args={[2.06, 64, 64]} />
        <meshBasicMaterial color="#1a6dd4" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.12, 64, 64]} />
        <meshBasicMaterial color="#1565c0" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.25, 64, 64]} />
        <meshBasicMaterial color="#0d47a1" transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
