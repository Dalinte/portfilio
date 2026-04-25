import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { IntroPhase } from '../types';

interface BeamProps {
  phase: IntroPhase;
}

const BEAM_PHASES = new Set<IntroPhase>(['beam_on', 'spawning', 'ufo_leaving']);

export function Beam({ phase }: BeamProps) {
  const coneRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!coneRef.current || !lightRef.current) return;
    const t = clock.getElapsedTime();

    let opacity = 0;

    if (phase === 'beam_on' || phase === 'spawning') {
      // Появление: 3s → 3.5s
      opacity = Math.min(Math.max((t - 3) / 0.5, 0), 0.55);
    } else if (phase === 'ufo_leaving') {
      // Угасание: 5.5s → 6.5s
      opacity = Math.max(0.55 - (t - 5.5) / 1.0, 0);
    }

    (coneRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    lightRef.current.intensity = opacity * 4;
  });

  if (!BEAM_PHASES.has(phase)) return null;

  // Луч расположен под тарелкой (тарелка зависает на y=4)
  return (
    <group position={[0, 4, 0]}>
      {/* Конус направлен вниз: rotation.x = PI разворачивает вершину вниз */}
      <mesh ref={coneRef} position={[0, -2.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.8, 5, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffffaa"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color="#ffffaa"
        intensity={0}
        distance={8}
        decay={2}
      />
    </group>
  );
}
