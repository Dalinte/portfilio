import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { IntroPhase } from '../types';

// TODO: replace with useGLTF('/models/character.glb')
// import { useGLTF } from '@react-three/drei';
// function CharacterModel() {
//   const { scene } = useGLTF('/models/character.glb');
//   return <primitive object={scene} />;
// }

interface CharacterProps {
  phase: IntroPhase;
}

const VISIBLE_PHASES = new Set<IntroPhase>([
  'spawning',
  'ufo_leaving',
  'interactive',
]);

export function Character({ phase }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Плоскость обрезки: нормаль (0,1,0) — отсекает всё ниже Y = -constant
  const clippingPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -2));

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (phase === 'spawning') {
      // Dissolve: плоскость поднимается от y=-2 до y=3 за 1.5 секунды (4s → 5.5s)
      const progress = Math.min(Math.max((t - 4) / 1.5, 0), 1);
      clippingPlane.current.constant = THREE.MathUtils.lerp(-2, 3, progress);
    } else if (phase === 'ufo_leaving' || phase === 'interactive') {
      clippingPlane.current.constant = 3; // Полностью видим
    }

    // Медленное авто-вращение после интро (delta-based, не зависит от FPS)
    if (phase === 'interactive') {
      groupRef.current.rotation.y += delta * 0.18;
    }
  });

  if (!VISIBLE_PHASES.has(phase)) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Заглушка персонажа — заменить на GLTF (см. TODO выше) */}
      <mesh castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.3}
          roughness={0.5}
          emissive="#112244"
          emissiveIntensity={0.5}
          clippingPlanes={[clippingPlane.current]}
        />
      </mesh>
      {/* Голова */}
      <mesh castShadow position={[0, 1.3, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color="#5599ff"
          metalness={0.3}
          roughness={0.5}
          emissive="#112244"
          emissiveIntensity={0.5}
          clippingPlanes={[clippingPlane.current]}
        />
      </mesh>
    </group>
  );
}
