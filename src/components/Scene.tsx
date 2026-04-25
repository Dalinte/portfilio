import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Background } from './Background';
import { UFO } from './UFO';
import { Beam } from './Beam';
import { Character } from './Character';
import { OrbitalLinks } from './OrbitalLinks';
import type { IntroPhase } from '../types';

interface SceneProps {
  phase: IntroPhase;
}

// Плавно двигает камеру к финальной позиции во время интро.
// Возвращает управление OrbitControls в фазе interactive.
function CameraController({ phase }: { phase: IntroPhase }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 2, 8));

  useFrame(() => {
    if (phase === 'interactive') return;
    camera.position.lerp(targetPos.current, 0.008);
    camera.lookAt(0, 1, 0);
  });

  return null;
}

function SceneContent({ phase }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Background />
      <UFO phase={phase} />
      <Beam phase={phase} />
      <Character phase={phase} />
      <OrbitalLinks phase={phase} />

      <CameraController phase={phase} />

      <OrbitControls
        enabled={phase === 'interactive'}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={1.8}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.3} intensity={1.2} mipmapBlur />
      </EffectComposer>

      <Preload all />
    </>
  );
}

export function Scene({ phase }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 6, 12], fov: 60 }}
      gl={{ localClippingEnabled: true }}
      shadows
    >
      <Suspense fallback={null}>
        <SceneContent phase={phase} />
      </Suspense>
    </Canvas>
  );
}
