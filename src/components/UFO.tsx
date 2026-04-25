import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { IntroPhase } from '../types';

interface UFOProps {
  phase: IntroPhase;
}

const VISIBLE_PHASES = new Set<IntroPhase>([
  'ufo_arriving',
  'beam_on',
  'spawning',
  'ufo_leaving',
]);

// Кривая Безье: прилёт с [15,10,8] в [0,4,0] за 3 секунды (1s → 4s)
const ARRIVE_CURVE = new THREE.CubicBezierCurve3(
  new THREE.Vector3(15, 10, 8),
  new THREE.Vector3(8, 8, 4),
  new THREE.Vector3(3, 6, 1),
  new THREE.Vector3(0, 4, 0)
);

// Кривая Безье: отлёт с [0,4,0] в [-15,15,-10] за 1.5 секунды (5.5s → 7s)
const LEAVE_CURVE = new THREE.CubicBezierCurve3(
  new THREE.Vector3(0, 4, 0),
  new THREE.Vector3(-5, 8, -2),
  new THREE.Vector3(-10, 12, -6),
  new THREE.Vector3(-15, 15, -10)
);

const RING_COUNT = 8;

export function UFO({ phase }: UFOProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<(THREE.Mesh | null)[]>([]);

  // Позиции огней по кольцу
  const ringPositions = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, i) => {
        const angle = (i / RING_COUNT) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 2, -0.1, Math.sin(angle) * 2);
      }),
    []
  );

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Позиционирование тарелки по фазе
    if (phase === 'ufo_arriving' || phase === 'beam_on') {
      // Прилёт: 1s → 4s, прогресс 0 → 1
      const progress = Math.min(Math.max((t - 1) / 3, 0), 1);
      const pos = ARRIVE_CURVE.getPoint(progress);
      groupRef.current.position.copy(pos);
      // Лёгкое покачивание поверх кривой
      groupRef.current.position.y += Math.sin(t * 2) * 0.05;
    } else if (phase === 'spawning') {
      // Зависание над центром с покачиванием
      groupRef.current.position.set(0, 4 + Math.sin(t * 2) * 0.08, 0);
    } else if (phase === 'ufo_leaving') {
      // Отлёт: 5.5s → 7s, прогресс 0 → 1
      const progress = Math.min(Math.max((t - 5.5) / 1.5, 0), 1);
      const pos = LEAVE_CURVE.getPoint(progress);
      groupRef.current.position.copy(pos);
    }

    // Вращение тарелки вокруг своей оси (delta-based, не зависит от FPS)
    groupRef.current.rotation.y += delta * 0.6;

    // Пульсация огней
    lightsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 3 + i * 0.8);
    });
  });

  if (!VISIBLE_PHASES.has(phase)) return null;

  return (
    <group ref={groupRef}>
      {/* Основное тело тарелки */}
      <mesh>
        <cylinderGeometry args={[2.5, 2, 0.5, 32]} />
        <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Прозрачный купол */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#aaddff"
          transparent
          opacity={0.35}
          metalness={0.0}
          roughness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Кольцо пульсирующих огней */}
      {ringPositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => {
            lightsRef.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}
