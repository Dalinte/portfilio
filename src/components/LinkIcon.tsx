import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { LinkData } from '../types';

interface LinkIconProps {
  link: LinkData;
  visible: boolean;
}

export function LinkIcon({ link, visible }: LinkIconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    return () => {
      if (hovered) document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const currentScale = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Орбитальное движение вокруг персонажа
    const x = link.orbitRadius * Math.cos(t * link.orbitSpeed + link.orbitOffset);
    const z = link.orbitRadius * Math.sin(t * link.orbitSpeed + link.orbitOffset);
    const y = link.orbitY + Math.sin(t * 0.5 + link.orbitOffset) * 0.2;
    groupRef.current.position.set(x, y, z);

    // Плавное появление / увеличение при наведении (delta-based lerp, не зависит от FPS)
    const targetScale = visible ? (hovered ? 1.3 : 1.0) : 0;
    const lerpFactor = 1 - Math.pow(0.01, delta);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, lerpFactor);
    groupRef.current.scale.setScalar(currentScale.current);

    // Отключаем raycasting когда иконка почти невидима
    groupRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.raycast = currentScale.current < 0.05
          ? () => {}
          : THREE.Mesh.prototype.raycast.bind(obj);
      }
    });
  });

  return (
    <group ref={groupRef}>
      <Billboard>
        <Text
          fontSize={0.45}
          color={link.color}
          anchorX="center"
          anchorY="middle"
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
        >
          {link.emoji} {link.name}
        </Text>
      </Billboard>
    </group>
  );
}
