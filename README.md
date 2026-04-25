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
