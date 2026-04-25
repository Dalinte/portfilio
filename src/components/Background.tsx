import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export function Background() {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#050510');
  }, [scene]);

  return (
    <Stars
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
    />
  );
}
