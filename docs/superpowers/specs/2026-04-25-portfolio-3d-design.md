# Portfolio 3D — Design Spec
**Date:** 2026-04-25  
**Status:** Approved

---

## Overview

Single-page portfolio site built with React 18 + Vite + TypeScript. The entire page is a fullscreen 3D canvas (React Three Fiber) with a cinematic intro sequence. After the intro, the scene becomes interactive with orbital link icons around a central character.

---

## Stack

| Dependency | Purpose |
|---|---|
| React 18 + Vite + TypeScript | Core framework |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers: Stars, Billboard, Text, OrbitControls, Preload |
| `three` + `@types/three` | 3D engine + types |
| `@react-three/postprocessing` | Bloom effect |
| Tailwind CSS v3 | UI overlay styling |

---

## File Structure

```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── Scene.tsx              # Canvas orchestrator, camera lerp
│   ├── UFO.tsx                # Primitive UFO + flight animation
│   ├── Character.tsx          # Placeholder character + dissolve effect
│   ├── Beam.tsx               # Light beam cone + PointLight
│   ├── OrbitalLinks.tsx       # Container for orbital icons
│   ├── LinkIcon.tsx           # Single icon: Billboard + Text + hover/click
│   ├── Background.tsx         # Stars + scene background color
│   └── UI/
│       ├── Header.tsx         # Name + tagline (top right)
│       ├── Intro.tsx          # "Hi, I'm ..." appears post-interactive
│       └── SkipButton.tsx     # Skip intro button (top left)
├── hooks/
│   └── useIntroSequence.ts    # Phase state machine (useReducer + timers)
├── data/
│   └── links.ts               # Link definitions with orbit parameters
├── types/
│   └── index.ts               # Shared TypeScript types
└── styles/
    └── index.css
```

---

## Intro Animation Sequence

Phases are **sequential milestones** in the state machine (one active at a time). Components use `clock.elapsedTime` for precise sub-phase animation; the phase only controls show/hide and enable/disable.

| Transition at | → Phase | Dominant action |
|---|---|---|
| 0s | `idle` | Empty scene, stars, ambient light |
| 1s | `ufo_arriving` | UFO begins Bezier flight from `[15, 10, 8]` toward `[0, 4, 0]` |
| 3s | `beam_on` | Beam fades in; UFO still on Bezier path (arrives at hover pos ~4s via elapsedTime) |
| 4s | `spawning` | Character clipping plane animates upward over 1.5s |
| 5.5s | `ufo_leaving` | Beam fades out, UFO follows reverse Bezier to `[−15, 15, −10]` |
| 7s | `interactive` | Orbital icons appear, OrbitControls enabled, character autoRotates |

UFO is visible in phases: `ufo_arriving`, `beam_on`, `spawning`, `ufo_leaving`.  
Beam is visible in phases: `beam_on`, `spawning`, `ufo_leaving` (fading out in last).

---

## Phase State Machine

### Type

```typescript
type IntroPhase =
  | 'idle'
  | 'ufo_arriving'
  | 'beam_on'
  | 'spawning'
  | 'ufo_leaving'
  | 'interactive';
```

### `useIntroSequence` hook

Returns `{ phase: IntroPhase; skip: () => void }`.

Implementation: `useReducer` with `SET_PHASE` action + `useEffect` chain of `setTimeout` calls. `skip()` dispatches `interactive` immediately and cancels all pending timers via stored timeout IDs in a ref.

---

## Types (`src/types/index.ts`)

```typescript
type IntroPhase =
  | 'idle' | 'ufo_arriving' | 'beam_on'
  | 'spawning' | 'ufo_leaving' | 'interactive';

interface LinkData {
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

---

## 3D Components

### UFO.tsx
- **Body:** `CylinderGeometry(2, 2.5, 0.5)` with metallic material
- **Dome:** `SphereGeometry(1.2)` top-half, transparent glass material (`opacity: 0.4`)
- **Lights:** 8 small emissive spheres arranged in a ring, pulsating via `sin(time * 3)`
- **Flight path:** `THREE.CubicBezierCurve3` from `[15, 10, 8]` → control points → `[0, 4, 0]`. Progress driven by `elapsedTime` normalized to phase duration.
- **Y-wobble:** `position.y += sin(time * 2) * 0.05` while hovering
- **Active phases:** `ufo_arriving`, `beam_on`, `spawning`, `ufo_leaving`

### Beam.tsx
- **Geometry:** `ConeGeometry(1.5, 5, 32, 1, true)` — open-ended, pointing down
- **Material:** `MeshBasicMaterial` with `transparent: true`, emissive yellow, `opacity` animated 0→0.6 (fade in) and 0.6→0 (fade out)
- **Light:** `PointLight` at `[0, 1.5, 0]` (below UFO), intensity animated with beam opacity
- **Bloom:** emissive color triggers Bloom glow automatically
- **Active phases:** `beam_on`, `spawning`, `ufo_leaving` (fading out in last)

### Character.tsx
- **Placeholder:** `BoxGeometry(1, 2, 1)` — clearly marked `// TODO: replace with useGLTF('/models/character.glb')`
- **Dissolve effect:** `THREE.Plane` clipping plane starts at `y = -2`, moves to `y = +2` over 1.5s during `spawning` phase via `useFrame` lerp
- **Post-interactive:** slow Y-axis rotation (`rotation.y += 0.003`) via `useFrame`

### OrbitalLinks.tsx + LinkIcon.tsx
- **Position formula:**
  ```
  x = orbitRadius * cos(time * orbitSpeed + orbitOffset)
  z = orbitRadius * sin(time * orbitSpeed + orbitOffset)
  y = orbitY + sin(time * 0.5) * 0.2
  ```
- **Each icon:** `<Billboard>` wrapping `<Text>` (emoji + name)
- **Appearance:** scale 0→1 + opacity 0→1 over 0.5s when phase becomes `interactive`
- **Hover:** scale → 1.3, show tooltip text
- **Click:** `window.open(url, '_blank')`
- **Raycasting:** handled via R3F's `onPointerOver` / `onPointerOut` / `onClick`

### Background.tsx
- `<Stars radius={100} depth={50} count={5000} factor={4} />` from drei
- `scene.background = new THREE.Color('#050510')` — deep dark blue

---

## Camera

- **Initial position:** `[0, 6, 12]`
- **Target position:** `[0, 2, 8]` (reached by `interactive`)
- **Animation:** `lerp` in `useFrame` at `Scene.tsx` level, factor `0.01` per frame
- **OrbitControls:** enabled only in `interactive` phase
  - `enableZoom={false}`, `enablePan={false}`
  - `minPolarAngle={0.3}`, `maxPolarAngle={1.8}`

---

## Postprocessing

```tsx
<EffectComposer>
  <Bloom luminanceThreshold={0.3} intensity={1.2} mipmapBlur />
</EffectComposer>
```

Wraps the entire Canvas. Targets emissive materials: UFO ring lights, beam cone, orbital icon glows.

---

## UI Overlay

All positioned absolutely over the Canvas via `pointer-events-none` wrapper (except interactive elements).

| Element | Position | Visible in phases |
|---|---|---|
| `SkipButton` | Top-left | All except `interactive` |
| `Header` (name + tagline) | Top-right | Always |
| `Intro` ("Hi, I'm ...") | Bottom-right | `interactive` only, fade-in |
| "Drag to rotate" hint | Bottom-center | `interactive` only |

---

## Data: `src/data/links.ts` (placeholders)

```typescript
export const links: LinkData[] = [
  { id: 'github',   name: 'GitHub',   url: 'https://github.com/username',        emoji: '🐙', color: '#fff',    orbitRadius: 3,   orbitSpeed: 0.4,  orbitOffset: 0,           orbitY: 1.5 },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/in/username',   emoji: '💼', color: '#0A66C2', orbitRadius: 3.5, orbitSpeed: 0.35, orbitOffset: Math.PI/2,   orbitY: 0   },
  { id: 'email',    name: 'Email',    url: 'mailto:you@example.com',             emoji: '✉️', color: '#EA4335', orbitRadius: 3,   orbitSpeed: 0.45, orbitOffset: Math.PI,     orbitY: -1  },
  { id: 'twitter',  name: 'Twitter',  url: 'https://twitter.com/username',       emoji: '🐦', color: '#1DA1F2', orbitRadius: 3.5, orbitSpeed: 0.38, orbitOffset: Math.PI*1.5, orbitY: 0.8 },
];
```

---

## Performance

- `<Suspense fallback={<LoadingScreen />}>` wraps the Canvas
- `<Preload all />` from drei
- Shadows only from key directional light, `<SoftShadows />`
- No unused postprocessing passes

---

## README

Will document: how to run, how to replace the character model, how to add/edit links.
