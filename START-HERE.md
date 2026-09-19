# ALTITUDE helicopter website

Latest source export, including the shortened navbar, supplied OH-58D helicopter,
photographic sky, and cloud layer with a smooth horizon blend.

## Run locally

Install Node.js 22.13 or newer and pnpm 11.25.0.
From this folder, run:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:5173. Scroll to explore the helicopter.

## Production build

```sh
pnpm build
```

## Main files

- app/scene.tsx: Three.js / React Three Fiber scene, lighting, clouds and camera tour.
- app/page.tsx: Interface and scrolling behavior.
- app/globals.css: Styling and responsive layout.
- public/models/kiowa/: Supplied helicopter model and textures.
- public/environment/: Sky panorama and credits.

Original asset license and attribution files are included. The helicopter model
is licensed CC BY-NC 4.0; see public/models/kiowa/license.txt for details.
Dependencies, build output and local caches are excluded from this ZIP.
