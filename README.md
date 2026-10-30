# PhysioMap — *See Your Body. Fix Your Body.*

PhysioMap turns your body into an **interactive 3D guide**. Tap a body part on a 3D muscular
avatar and act on it in three ways — **Build** (hypertrophy, targeted workouts, biomechanics),
**Pain** (symptom mapping, relief sessions, ergonomics) and **Info** (interactive anatomy
education, injury prevention). One avatar powers three modes.

Built by **Team Psycho-Coderz** for the **Zinnovatio Hackathon**.

> **Safety:** PhysioMap offers educational guidance, **not medical diagnosis or treatment**.
> Guidance is general and may not apply to your condition — never ignore severe, worsening or
> urgent symptoms. In an emergency, contact local emergency services immediately.

---

## Features

- **3D procedural anatomical avatar** — a data-driven "muscle man" (≈70 shared-geometry meshes)
  with 19 clickable regions, hover tooltips, region outlines, camera fly-to presets, auto-rotate,
  isolate / label-all / silhouette layers, and a WebGL-free fallback.
- **Build mode (blue)** — 5 exercises per region with goal-based set schemes
  (hypertrophy 3–4 × 8–12, strength 4–5 × 3–6, endurance 2–3 × 15–20), exercise detail dialogs,
  muscle-science tab with hypertrophy guides + synergist/antagonist chips, and a persisted
  "My Workout" plan with duration estimate and muscle preview.
- **Pain mode (coral)** — zod-validated symptom assessment via `POST /api/pain/assess`
  (pure rule engine: emergency red flags ⇒ *urgent*; severity ≥ 8 / neuro symptoms ⇒ *see-clinician*;
  chronic or 6–7 ⇒ *monitor*), guided relief player with countdown ring, desk-worker ergonomics
  checklist with posture score, evidence-aligned remedies (no medications, ever) and a persisted
  pain log whose severity drives an amber → red heat glow on the avatar.
- **Info mode (peach)** — anatomy education (origin → insertion, innervation, fun facts),
  injury prevention, and a 10-question seeded quiz ("Find it" — tap the region on the body;
  "Name it" — a region glows, pick from 4 options) with score, streak and persisted best score.
- **Explorer UX** — shareable URLs (`/explore?mode=pain&region=knees`), keyboard shortcuts
  (`1/2/3` switch modes keeping the region, `Esc` deselects), mobile bottom sheet with
  peek/half/full snaps, first-visit disclaimer gate, dark medical-tech design system.

## Setup & run

```bash
bun install          # install dependencies
bun run dev          # dev server on http://localhost:3000
bun run lint         # eslint
bunx tsc --noEmit    # type-check
```

No logins, no payments, no external API keys, no external assets — the whole experience is
procedural (3D + SVG + CSS).

## Architecture

```
UI components ──► hooks ──► services (typed fetch) ──► API route handlers ──► providers ──► data files
      │                         │                          │
      └──► stores (Zustand) ────┘                     zod-validated in/out
```

- **Components never import data files.** They read stores/hooks; data flows through
  `services/regionService` + `services/painService` → `/api/*` → `lib/providers` (swappable
  `ExerciseDataProvider`) → `data/regions/*`.
- **The avatar is dumb.** `AvatarCanvas` receives
  `{selectedRegionId, hoveredRegionId, regionStyles, labelsVisible, onSelect, onHover}` and nothing
  else; `hooks/useRegionVisualState(mode)` computes `RegionVisualState` from mode + selection +
  exercise highlights + workout preview + pain-log heat + quiz state, so the 3D layer never knows
  about app modes.
- **Pure logic lives in `src/lib/`** — the pain rule engine (`lib/pain/assess.ts`,
  `redFlags.ts`, `heat.ts`), set schemes and workout estimates (`lib/build/*`), the seeded quiz
  engine (`lib/quiz/quizEngine.ts`) — all unit-testable, side-effect free.
- **Constants live in `src/config/`** — regions, camera presets, colors, storage keys, form
  catalogs; unions are derived from `as const` arrays (`REGION_IDS → RegionId`).

## Folder map

```
src/
  app/                layout.tsx, globals.css, page.tsx (landing),
                      explore/page.tsx, health/page.tsx (stub), not-found.tsx, icon.svg
    api/regions/      GET list + GET [id] (404 on unknown, zod-validated)
    api/pain/assess/  POST — zod body → pure rule engine → typed result
  components/
    layout/           SiteHeader, SiteFooter, DisclaimerBanner/Gate, ModeSwitcher, ProfileDialog, Providers
    avatar/           AvatarCanvas, ProceduralAvatar, GltfAvatar (optional GLTF path),
                      MuscleMesh, CameraRig, RegionTooltip/Labels, ViewControls, WebGLFallback,
                      geometry.ts, useAvatarMaterials.ts, CanvasErrorBoundary
    explore/           ExploreWorkspace, RegionList, ContextPanel, PanelEmptyState, MobileSheet
    build/ pain/ info/ mode panels (one responsibility per file)
  config/             site, theme, regions, camera, labels, assessment, painSchemas,
                      ergonomics, storageKeys, profileOptions, avatar/* (muscleDefinitions, meshMap)
  data/regions/       headNeck, upperBody, core, lowerBody — one RegionContent per region (19 total)
  hooks/              useRegionContent (prefetches all regions on idle), useUrlSync,
                      useRegionVisualState, useKeyboardShortcuts, useHydrated, usePrefersReducedMotion
  lib/                build/ pain/ quiz/ (pure logic), providers/, storage/
  services/           regionService, painService (the only fetchers)
  store/              useExplorerStore (UI state) + persisted workout / pain log / profile / quiz-best
  types/              region, anatomy, exercise, pain, profile, quiz, avatar
```

## Adding a new region or exercise

1. **Region:** add the id to `REGION_IDS` in `config/regions.ts` and a `REGIONS` entry;
   add a camera preset in `config/camera.ts`; add meshes in `config/avatar/muscleDefinitions.ts`.
2. **Content:** append a fully populated `RegionContent` to the right group file in
   `data/regions/` (see `headNeck.ts` for the exact quality bar).
3. **Exercise:** just add it to the region's `build.exercises` — ids are
   `${regionId}-${kebab-name}` and must be globally unique.
4. No UI changes needed — every panel is fully data-driven.

**Optional GLTF avatar:** set `NEXT_PUBLIC_AVATAR_MODEL_URL` to a glTF URL and extend
`config/avatar/meshMap.ts` (mesh name → region). The procedural avatar stays the default.

## Data & state conventions

- Persisted client data uses **versioned keys** (`physiomap:v1:<name>`) through one storage
  helper (`lib/storage/`), which safely handles SSR, missing `window` and quota errors.
  Anything that reads persisted state renders a stable placeholder until hydration
  (`useHydrated` / `useSyncExternalStore`) — the console stays mismatch-free.
- The workspace URL (`?mode=&region=`) is the single source of truth for deep links;
  `useUrlSync` restores it on load and follows browser back/forward.

## Accessibility & performance

Keyboard-operable region list and mode switcher (with `1/2/3` + `Esc`), visible focus rings,
AA contrast, ARIA roles on every control, `prefers-reduced-motion` disables auto-rotate, avatar
pulses and framer-motion transitions. The 3D scene caps `dpr` to `[1, 2]`, shares geometries and
per-region materials, pushes visual states imperatively (no mesh re-renders on hover) and
disposes geometries/materials on unmount. WebGL-less browsers get the searchable Region List.

## Roadmap (part 2)

Health & Nutrition Suite (BMI/BMR/TDEE + macro targets, veg/eggetarian/non-veg meal plans with
exclusions), full landing page, PDF export of workouts & recovery guides. Out of scope by
design: logins, payments, AI pose detection, AR, wearable sync.
