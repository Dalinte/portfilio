# 3D Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page 3D portfolio with a cinematic UFO intro sequence and interactive orbital contact links.

**Architecture:** Fullscreen R3F Canvas driven by a `useIntroSequence` phase state machine (`useReducer` + timers). Each 3D component receives `phase: IntroPhase` and uses `clock.elapsedTime` for sub-phase animation. Tailwind UI overlays the Canvas absolutely. TypeScript throughout.

**Tech Stack:** React 18, Vite 5, TypeScript 5, @react-three/fiber 8, @react-three/drei 9, @react-three/postprocessing 2, three.js, Tailwind CSS 3.

---

## File Map

| File | Responsibility |
|---|---|
| `vite.config.ts` | Vite + React plugin config |
| `tsconfig.json` / `tsconfig.node.json` | TypeScript config |
| `tailwind.config.js` / `postcss.config.js` | Tailwind pipeline |
| `index.html` | HTML entry point |
| `src/main.tsx` | React DOM mount |
| `src/App.tsx` | Root: wires phase hook → Scene + UI |
| `src/types/index.ts` | `IntroPhase` union type, `LinkData` interface |
| `src/data/links.ts` | Array of `LinkData` with orbit parameters |
| `src/hooks/useIntroSequence.ts` | Phase state machine (useReducer + setTimeout) |
| `src/styles/index.css` | Tailwind directives + html/body reset |
| `src/components/Background.tsx` | Stars + dark scene background |
| `src/components/UFO.tsx` | Primitive UFO + Bezier flight animation |
| `src/components/Beam.tsx` | Light cone + PointLight with opacity fade |
| `src/components/Character.tsx` | Box placeholder + clipping plane dissolve |
| `src/components/LinkIcon.tsx` | Billboard icon: hover scale, click open URL |
| `src/components/OrbitalLinks.tsx` | Maps `links` data → `LinkIcon` components |
| `src/components/Scene.tsx` | Canvas, camera lerp, OrbitControls, Bloom |
| `src/components/UI/Header.tsx` | Name + tagline overlay (top-right) |
| `src/components/UI/SkipButton.tsx` | Skip intro button (top-left) |
| `src/components/UI/Intro.tsx` | "Hi, I'm …" text (bottom-right, post-interactive) |
| `README.md` | Setup, model swap, link editing instructions |

---

## Task 1: Scaffold project

**Files:**
- Delete: `index.js`
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `tailwind.config.js`, `postcss.config.js`
- Modify: `package.json`

- [ ] **Step 1: Remove old placeholder and update package.json**

```bash
rm index.js
```

Write `package.json`:

```json
{
  "name": "portfolio",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^9.109.0",
    "@react-three/fiber": "^8.17.0",
    "@react-three/postprocessing": "^2.16.0",
    "postprocessing": "^6.36.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.167.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.167.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.9",
    "typescript": "^5.5.3",
    "vite": "^5.3.5"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: no errors, `node_modules` created.

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 8: Create `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS project"
```

---

## Task 2: Types and link data

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/links.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export type IntroPhase =
  | 'idle'
  | 'ufo_arriving'
  | 'beam_on'
  | 'spawning'
  | 'ufo_leaving'
  | 'interactive';

export interface LinkData {
  id: string;
  name: string;
  url: string;
  emoji: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  orbitY: number;
}
```

- [ ] **Step 2: Create `src/data/links.ts`**

```typescript
import type { LinkData } from '../types';

export const links: LinkData[] = [
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/username',
    emoji: '🐙',
    color: '#ffffff',
    orbitRadius: 3,
    orbitSpeed: 0.4,
    orbitOffset: 0,
    orbitY: 1.5,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/username',
    emoji: '💼',
    color: '#0A66C2',
    orbitRadius: 3.5,
    orbitSpeed: 0.35,
    orbitOffset: Math.PI / 2,
    orbitY: 0,
  },
  {
    id: 'email',
    name: 'Email',
    url: 'mailto:you@example.com',
    emoji: '✉️',
    color: '#EA4335',
    orbitRadius: 3,
    orbitSpeed: 0.45,
    orbitOffset: Math.PI,
    orbitY: -1,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    url: 'https://twitter.com/username',
    emoji: '🐦',
    color: '#1DA1F2',
    orbitRadius: 3.5,
    orbitSpeed: 0.38,
    orbitOffset: Math.PI * 1.5,
    orbitY: 0.8,
  },
];
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors (only type files exist, nothing to compile yet — may warn about missing src/main.tsx, that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/data/links.ts
git commit -m "feat: add IntroPhase types and links data"
```

---

## Task 3: useIntroSequence hook

**Files:**
- Create: `src/hooks/useIntroSequence.ts`

- [ ] **Step 1: Create `src/hooks/useIntroSequence.ts`**

```typescript
import { useReducer, useEffect, useRef } from 'react';
import type { IntroPhase } from '../types';

type Action = { type: 'SET_PHASE'; phase: IntroPhase };

function reducer(_: IntroPhase, action: Action): IntroPhase {
  return action.phase;
}

// Тайминги перехода между фазами в миллисекундах от старта
const TIMINGS: Array<[number, IntroPhase]> = [
  [1000, 'ufo_arriving'],
  [3000, 'beam_on'],
  [4000, 'spawning'],
  [5500, 'ufo_leaving'],
  [7000, 'interactive'],
];

export function useIntroSequence(): { phase: IntroPhase; skip: () => void } {
  const [phase, dispatch] = useReducer(reducer, 'idle' as IntroPhase);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current = TIMINGS.map(([ms, p]) =>
      setTimeout(() => dispatch({ type: 'SET_PHASE', phase: p }), ms)
    );
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const skip = () => {
    timersRef.current.forEach(clearTimeout);
    dispatch({ type: 'SET_PHASE', phase: 'interactive' });
  };

  return { phase, skip };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useIntroSequence.ts
git commit -m "feat: add intro sequence state machine hook"
```

---

## Task 4: Global styles and Background component

**Files:**
- Create: `src/styles/index.css`
- Create: `src/components/Background.tsx`

- [ ] **Step 1: Create `src/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

- [ ] **Step 2: Create `src/components/Background.tsx`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/index.css src/components/Background.tsx
git commit -m "feat: add global styles and star background"
```

---

## Task 5: UFO component

**Files:**
- Create: `src/components/UFO.tsx`

The UFO is built from Three.js primitives. Flight path uses a cubic Bezier curve.
Phase mapping: visible in `ufo_arriving`, `beam_on`, `spawning`, `ufo_leaving`.

- [ ] **Step 1: Create `src/components/UFO.tsx`**

```typescript
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

  useFrame(({ clock }) => {
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

    // Вращение тарелки вокруг своей оси
    groupRef.current.rotation.y += 0.01;

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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UFO.tsx
git commit -m "feat: add UFO component with Bezier flight animation"
```

---

## Task 6: Beam component

**Files:**
- Create: `src/components/Beam.tsx`

The beam is a downward-pointing cone at the UFO's hover position `[0, 4, 0]`.
Fades in during `beam_on`, stays through `spawning`, fades out in `ufo_leaving`.

- [ ] **Step 1: Create `src/components/Beam.tsx`**

```typescript
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
      opacity = Math.min((t - 3) / 0.5, 0.55);
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Beam.tsx
git commit -m "feat: add light beam component with fade animation"
```

---

## Task 7: Character component

**Files:**
- Create: `src/components/Character.tsx`

Dissolve effect: a `THREE.Plane` (clipping plane) starts at `y = -2` and moves up to `y = 3`
over 1.5 seconds during `spawning`. Requires `gl={{ localClippingEnabled: true }}` on Canvas
(added in Task 11).

- [ ] **Step 1: Create `src/components/Character.tsx`**

```typescript
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

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (phase === 'spawning') {
      // Dissolve: плоскость поднимается от y=-2 до y=3 за 1.5 секунды (4s → 5.5s)
      const progress = Math.min(Math.max((t - 4) / 1.5, 0), 1);
      clippingPlane.current.constant = THREE.MathUtils.lerp(-2, 3, progress);
    } else if (phase === 'ufo_leaving' || phase === 'interactive') {
      clippingPlane.current.constant = 3; // Полностью видим
    }

    // Медленное авто-вращение после интро
    if (phase === 'interactive') {
      groupRef.current.rotation.y += 0.003;
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Character.tsx
git commit -m "feat: add character component with clipping-plane dissolve effect"
```

---

## Task 8: LinkIcon component

**Files:**
- Create: `src/components/LinkIcon.tsx`

Each icon orbits using the formula from the spec. `<Billboard>` keeps it facing the camera.
Hover enlarges it; click opens the URL.

- [ ] **Step 1: Create `src/components/LinkIcon.tsx`**

```typescript
import { useRef, useState } from 'react';
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
  const currentScale = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Орбитальное движение вокруг персонажа
    const x = link.orbitRadius * Math.cos(t * link.orbitSpeed + link.orbitOffset);
    const z = link.orbitRadius * Math.sin(t * link.orbitSpeed + link.orbitOffset);
    const y = link.orbitY + Math.sin(t * 0.5 + link.orbitOffset) * 0.2;
    groupRef.current.position.set(x, y, z);

    // Плавное появление / увеличение при наведении
    const targetScale = visible ? (hovered ? 1.3 : 1.0) : 0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.1);
    groupRef.current.scale.setScalar(currentScale.current);
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
          onClick={() => window.open(link.url, '_blank')}
        >
          {link.emoji} {link.name}
        </Text>
      </Billboard>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LinkIcon.tsx
git commit -m "feat: add orbital link icon with billboard, hover and click"
```

---

## Task 9: OrbitalLinks component

**Files:**
- Create: `src/components/OrbitalLinks.tsx`

- [ ] **Step 1: Create `src/components/OrbitalLinks.tsx`**

```typescript
import { links } from '../data/links';
import { LinkIcon } from './LinkIcon';
import type { IntroPhase } from '../types';

interface OrbitalLinksProps {
  phase: IntroPhase;
}

export function OrbitalLinks({ phase }: OrbitalLinksProps) {
  const visible = phase === 'interactive';

  return (
    <group>
      {links.map((link) => (
        <LinkIcon key={link.id} link={link} visible={visible} />
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/OrbitalLinks.tsx
git commit -m "feat: add orbital links container component"
```

---

## Task 10: UI components

**Files:**
- Create: `src/components/UI/Header.tsx`
- Create: `src/components/UI/SkipButton.tsx`
- Create: `src/components/UI/Intro.tsx`

- [ ] **Step 1: Create `src/components/UI/Header.tsx`**

```typescript
export function Header() {
  return (
    <div className="absolute top-4 right-6 text-right select-none">
      <p className="text-white font-semibold text-lg tracking-widest">
        Your Name
      </p>
      <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">
        Frontend Developer
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/UI/SkipButton.tsx`**

```typescript
import type { IntroPhase } from '../../types';

interface SkipButtonProps {
  skip: () => void;
  phase: IntroPhase;
}

export function SkipButton({ skip, phase }: SkipButtonProps) {
  if (phase === 'interactive') return null;

  return (
    <button
      className="absolute top-4 left-6 text-white/40 text-xs tracking-widest uppercase hover:text-white transition-colors pointer-events-auto"
      onClick={skip}
    >
      Skip intro →
    </button>
  );
}
```

- [ ] **Step 3: Create `src/components/UI/Intro.tsx`**

```typescript
import type { IntroPhase } from '../../types';

interface IntroProps {
  phase: IntroPhase;
}

export function Intro({ phase }: IntroProps) {
  const visible = phase === 'interactive';

  return (
    <>
      <div
        className={`absolute bottom-12 right-8 text-right transition-opacity duration-1000 select-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white/40 text-xs tracking-widest uppercase mb-2">
          Hi, I&apos;m
        </p>
        <p className="text-white text-4xl font-bold tracking-tight">
          Your Name
        </p>
        <p className="text-white/50 text-sm mt-1">
          Frontend Developer &amp; 3D Enthusiast
        </p>
      </div>

      {visible && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-widest uppercase select-none">
          Drag to rotate
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/UI/
git commit -m "feat: add UI overlay components (Header, SkipButton, Intro)"
```

---

## Task 11: Scene component

**Files:**
- Create: `src/components/Scene.tsx`

This is the Canvas root. Key points:
- `gl={{ localClippingEnabled: true }}` — required for Character's clipping plane dissolve
- `CameraController` lerps the camera during intro; returns early in `interactive` so `OrbitControls` can take over
- `OrbitControls` is always mounted but `enabled` only in `interactive`

- [ ] **Step 1: Create `src/components/Scene.tsx`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene.tsx
git commit -m "feat: add Scene canvas with camera controller and postprocessing"
```

---

## Task 12: App and entry point

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: Create `src/App.tsx`**

```typescript
import { useIntroSequence } from './hooks/useIntroSequence';
import { Scene } from './components/Scene';
import { Header } from './components/UI/Header';
import { Intro } from './components/UI/Intro';
import { SkipButton } from './components/UI/SkipButton';

export default function App() {
  const { phase, skip } = useIntroSequence();

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden">
      {/* Fullscreen 3D canvas */}
      <Scene phase={phase} />

      {/* UI overlay — pointer-events-none so OrbitControls работает через неё */}
      <div className="absolute inset-0 pointer-events-none">
        <Header />
        <SkipButton skip={skip} phase={phase} />
        <Intro phase={phase} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: add App root component and entry point"
```

---

## Task 13: TypeScript verification

**Files:** none — verification only

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: exits with code 0, no errors.

Common fixes if errors appear:
- `Cannot find module '@react-three/postprocessing'` → `npm install @react-three/postprocessing postprocessing`
- `Property 'mipmapBlur' does not exist` → remove `mipmapBlur` prop from `<Bloom>`
- `Type 'X' is not assignable to type 'IntroPhase'` → check all component `phase` prop types match the union

- [ ] **Step 2: Commit fix if needed**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors"
```

---

## Task 14: Run dev server and verify in browser

**Files:** none — verification only

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected output includes: `Local: http://localhost:5173/`

- [ ] **Step 2: Open browser and verify the full sequence**

Open `http://localhost:5173` and check:

| Time | Expected |
|---|---|
| 0–1s | Dark starfield, no objects |
| 1–4s | UFO flies in from top-right along arc |
| 3s | Yellow beam cone appears below UFO |
| 4s | Box character materializes upward inside beam |
| 5.5s | Beam fades, UFO flies away top-left |
| 7s | 4 orbital icons appear and start orbiting |
| Hover icon | Icon scales up |
| Click icon | Opens URL in new tab |
| Drag canvas | Scene rotates (OrbitControls) |
| Skip button | Jumps immediately to interactive state |

- [ ] **Step 3: Fix any console errors**

Open DevTools → Console. Acceptable warnings: drei font loading notice.
Not acceptable: Red errors, WebGL warnings about clipping planes.

If you see `localClippingEnabled` warning, ensure `gl={{ localClippingEnabled: true }}` is on the `<Canvas>` in `Scene.tsx`.

---

## Task 15: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# 3D Portfolio

A cinematic single-page portfolio built with React, Vite, TypeScript, and React Three Fiber.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Replacing the character model

1. Place your `.glb` file in `public/models/character.glb`
2. Open `src/components/Character.tsx`
3. Uncomment the `useGLTF` import and `CharacterModel` function at the top
4. Replace the `<mesh>` placeholder inside the `return` block with `<CharacterModel />`
5. Adjust `position` and `scale` as needed for your model

## Editing your links

Open `src/data/links.ts` and update the `url`, `name`, `emoji`, and `color` fields.

To add a new link, copy an existing entry and adjust `orbitRadius`, `orbitSpeed`, and `orbitOffset` to space it apart from others.

## Building for production

```bash
npm run build
npm run preview
```

The `dist/` folder is ready to deploy to Netlify, Vercel, or GitHub Pages.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup and customization instructions"
```
