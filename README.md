# PhysioMap V-1.0.1.107 — *See Your Body. Fix Your Body.*

PhysioMap turns your body into an **interactive 3D guide**. Tap a body part on a 3D muscular
avatar and act on it in three ways — **Build** (hypertrophy, targeted workouts, biomechanics),
**Pain** (symptom mapping, relief sessions, ergonomics) and **Info** (interactive anatomy
education, injury prevention). One avatar powers three modes — and a full **Health & Nutrition
Suite** (calculators, India-friendly meal plans, hydration tracking, PDF summary) extends it
beyond the body map.

Built by **Team Psycho-Coderz** for the **Zinnovatio Hackathon**.

The interface uses a glassmorphism design system with frosted panels, translucent
navigation, soft borders, backdrop blur, and mode-colored glow accents. In Info
mode, Structure layers exposes only independent Muscles, Bones, and Spread
structures controls. The procedural avatar remains the default offline
muscle fallback; a verified medical-atlas GLTF/GLB with skeletal meshes can be
supplied through
`NEXT_PUBLIC_AVATAR_MODEL_URL`.

> **Safety:** PhysioMap offers educational guidance, **not medical diagnosis or treatment**.
> Guidance is general and may not apply to your condition — never ignore severe, worsening or
> urgent symptoms. In an emergency, contact local emergency services immediately.

---

## Features

### The 3D explorer (`/explore`)

- **3D anatomical avatar** — a data-driven procedural muscle fallback (≈70 shared-geometry meshes)
  with 19 clickable regions, hover tooltips, region outlines, camera fly-to presets, auto-rotate,
  isolate / label-all / silhouette layers, and a WebGL-free fallback.
  When a supplied GLTF includes meshes named for bones, skull, ribs, vertebrae, spine, femur,
  tibia, or humerus, those meshes receive the dedicated high-roughness bone material and
  independent Bones opacity control. The renderer does not fabricate medical anatomy when no
  verified skeletal asset is configured.
- **Build mode (blue)** — 5 exercises per region with goal-based set schemes
  (hypertrophy 3–4 × 8–12, strength 4–5 × 3–6, endurance 2–3 × 15–20), exercise detail dialogs,
  muscle-science tab with hypertrophy guides + synergist/antagonist chips, and a persisted
  "My Workout" plan with duration estimate and muscle preview.
- **Pain mode (coral)** — zod-validated symptom assessment via `POST /api/pain/assess`
  (pure rule engine: emergency red flags ⇒ *urgent*; severity ≥ 8 / neuro symptoms ⇒ *see-clinician*;
  chronic or 6–7 ⇒ *monitor*) with **region-specific guidance** composed per answer (see the
  guidance engine below), guided relief player with countdown ring, desk-worker ergonomics
  checklist with posture score, evidence-aligned remedies (no medications, ever) and a persisted
  pain log whose severity drives an amber → red heat glow on the avatar.
  When a **medical history** is saved in the profile, the assessment also shows up to three
  informational "Because of your medical history" notes (processed client-side only).
- **Info mode (peach)** — anatomy education (origin → insertion, innervation, fun facts),
  injury prevention, and a 10-question seeded quiz ("Find it" — tap the region on the body;
  "Name it" — a region glows, pick from 4 options) with score, streak and persisted best score.
- **Explorer UX** — shareable URLs (`/explore?mode=pain&region=knees`), keyboard shortcuts
  (`1/2/3` switch modes keeping the region, `Esc` deselects), mobile bottom sheet with
  peek/half/full snaps, a first-visit disclaimer popup (mounted once in the root layout, shown
  on the first page opened, never again after "I understand — continue"), full-width sticky
  header (logo hard-left, nav + profile icon hard-right), dark medical-tech design system.
- **Local profile gate and suggestions** — Home and Explore require a completed local profile
  before opening the body workspace. Build suggestion mode narrows exercises using profile
  filters and safety cautions, while Pain mode explains that guidance is profile-aware and
  educational. No account or cross-device authentication is created.

### Health & Nutrition Suite (`/health`)

- **Profile sheet (header user icon)** — the ONE profile UI of the app: a right-side sheet
  (full width on mobile, ~440 px on desktop) with a read-only view ("Your numbers" strip with
  BMI + daily calories, clean label/value rows per section) and an edit mode (all fields below +
  name + medical history). Save keeps you in the sheet; Cancel discards edits. Every
  "Complete your profile" empty state opens it in edit mode instead of navigating.
- **Medical history (in the profile)** — 100+ user-selectable conditions in 11 collapsible
  groups with search, selected-chip rows, an exclusive "None of the above" and a validated
  free-text "Other" list (≤ 10 entries × 40 chars). **Privacy: it is saved only to
  `localStorage` on this device and is never uploaded or sent to any API** — condition notes
  are computed client-side. The profile store is versioned with a migration, so profiles saved
  before this feature keep working.
- **Calculators tab** — BMI with WHO ⇄ Asia-Pacific cut-offs, an SVG gauge and healthy weight
  range ("screening tool, not a diagnosis"); BMR (Mifflin-St Jeor); a TDEE table across all five
  activity levels with the chosen one highlighted; daily calorie target with a 25 %-capped
  deficit and 1500/1200 kcal safety floors (with a clear warning when the floor applies);
  macro targets (protein 1.6–2.0 g/kg by goal, fat 25 % of calories, carbs as remainder,
  fiber 14 g/1000 kcal) and a 35 ml/kg + activity-bonus water target. Every card carries a
  "How is this calculated?" popover with formula + source.
- **Meal Planner tab** — deterministic, seedable planner (`POST /api/nutrition/meal-plan`):
  calorie splits per slot for 3/4/5 meals, composition templates (complete breakfast; staple +
  protein + side lunches/dinners; snack slots), ~200 seeded candidates per slot with servings
  scaled in 0.5 steps (0.5–2.5), day-level scoring by weighted error (kcal ×3, protein ×2,
  carbs ×1, fat ×1). Swap a single meal, regenerate the day, or build a **7-day plan with no
  identical main item on consecutive days**. Macro donut + per-meal calorie charts (Recharts,
  lazy-loaded), a "Within ±5 % of target" chip, and an optional Open Food Facts "Search a food"
  dialog that adds items by grams.
- **Hydration tab** — animated progress ring (fallback goal 2,500 ml without a profile),
  quick-add buttons (150/250/500 ml) + custom amount, undo-last, today's timestamped log,
  7-day bar chart with goal line, streak counter and a reduced-motion-aware celebration when
  the goal is crossed.
- **Summary tab ("Take it with you")** — live preview with per-section checkboxes, a branded
  **PDF export** (`jspdf` + `jspdf-autotable`, dynamically imported on click) covering profile
  (including a "Medical history" line),
  BMI, energy & macros, water, today's meal plan, My Workout and the self-reported pain log
  (missing sections render "Not provided"), with page footers — plus a print stylesheet for the
  preview. Cross-links both ways with the Explorer's "My Workout".

### Landing page (`/`)

The hero is followed directly by the interactive Explore workspace, which is the primary Home
experience. The legacy pitch-deck sections are no longer rendered on Home. During an anatomy
quiz, labels, silhouettes, hover tooltips and nonessential map overlays are hidden; the Body
regions control remains available when the desktop region list is collapsed.

## Screenshots

*(Placeholder — capture screenshots after deploying: landing hero, explorer in Build mode,
pain assessment, meal planner, hydration ring, PDF summary.)*

## Setup & run

```bash
bun install          # install dependencies
bun run dev          # dev server on http://localhost:3000
bun run lint         # eslint
bun run type-check   # tsc --noEmit
bun run test         # vitest unit suite (lib/health, meal planner, pain engine, quiz)
```

No logins, no payments, no external assets, and no health data leaves the device. Profile,
pain, workout, meal, and hydration data remain in versioned localStorage. The optional
Supabase PostgreSQL database stores only server-side operational logs through `/api/logs`.

### Optional env flags (all default OFF — see `.env.example`)

| Flag | Effect |
| --- | --- |
| `ENABLE_WGER=true` | Attach exercise thumbnails in Build mode from the public wger API (name match, 4 s timeout, in-memory cache, silent fallback to no image). |
| `ENABLE_OPEN_FOOD_FACTS=true` | Power the Meal Planner's "Search a food" dialog with live per-100 g data from Open Food Facts. |
| `NEXT_PUBLIC_AVATAR_MODEL_URL` | Load a custom GLTF avatar instead of the procedural one. |
| `DATABASE_URL` | Supabase pooled PostgreSQL connection used by the server logger. |
| `DIRECT_URL` | Supabase direct PostgreSQL connection used by Prisma migrations. |

`GET /api/health-data/status` reports which providers are active (local is always true), and the
**DataSourcesDialog** (footer + landing Engine section) shows it honestly.

## Architecture

```
UI components ──► hooks ──► services (typed fetch) ──► API route handlers ──► providers ──► data files
      │                         │                          │
      └──► stores (Zustand) ────┘                     zod-validated in/out
```

- **Components never import data files.** They read stores/hooks; data flows through
  `services/regionService` + `services/painService` + `services/nutritionService` → `/api/*` →
  `lib/providers` (swappable `ExerciseDataProvider` / `NutritionDataProvider` + optional
  fail-soft external adapters) → `data/regions/*` + `data/foods.ts`.
- **The avatar is dumb.** `AvatarCanvas` receives
  `{selectedRegionId, hoveredRegionId, regionStyles, labelsVisible, onSelect, onHover}` and nothing
  else; `hooks/useRegionVisualState(mode)` computes `RegionVisualState` from mode + selection +
  exercise highlights + workout preview + pain-log heat + quiz state, so the 3D layer never knows
  about app modes.
- **Pure logic lives in `src/lib/`** — the pain rule engine (`lib/pain/assess.ts`,
  `redFlags.ts`, `guidance.ts`, `heat.ts`, `conditionNotes.ts`), set schemes and workout
  estimates (`lib/build/*`), the seeded quiz engine (`lib/quiz/quizEngine.ts`), the health
  calculators (`lib/health/` — bmi, energy, macros, water, hydration, units, profile
  validation, medical-history formatting), the meal planner (`lib/nutrition/` —
  `mealPlanner.ts`, `dietRules.ts`, `seededRandom.ts`) and the PDF builder (`lib/pdf/`) — all
  unit-tested, side-effect free.
- **Constants live in `src/config/`** — regions, camera presets, colors, storage keys, form
  catalogs, nutrition constants (`nutrition.ts`), zod schemas (`healthSchemas.ts`,
  `painSchemas.ts`), landing copy (`landingContent.ts`), team (`team.ts`), the medical-conditions
  catalog (`medicalConditions.ts`) and the guidance data files (`config/guidance/`); unions are
  derived from `as const` arrays (`REGION_IDS → RegionId`,
  `MEDICAL_CONDITION_IDS → MedicalConditionId`).
- **Server persistence is deliberately limited** — `src/lib/serverLogger.ts` writes bounded,
  non-sensitive operational events to the `AppLog` Prisma model. Health data is never accepted
  by that endpoint.

### Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to the Supabase pooled connection string and `DIRECT_URL` to the direct
   connection string. Never commit either value.
3. Run `bun run db:deploy` in deployment environments, or `bun run db:push` for local setup.
4. Configure the same environment variables in the hosting provider.

#### The pain guidance engine

`resolveUrgency` (unchanged rule ladder) decides *how urgent*; `buildGuidance`
(`lib/pain/guidance.ts`) decides *what to say*, composing region- and input-specific guidance
from typed data files in `config/guidance/`:

| File | Contents |
| --- | --- |
| `regionProfiles.ts` | Per-region `areaName`, `specialist`, `safeMovement`, `avoidMovement`, `commonLoadingFactors`, `urgentSigns` — all 19 regions. |
| `redFlagGuidance.ts` | One do-now/avoid/watch-for trio per red flag, with region-specific variants (e.g. bladder-bowel × lower-back, calf swelling × calves). |
| `sensationGuidance.ts` / `aggravatorGuidance.ts` | A tip per sensation/aggravator plus region overrides for the common combinations (sitting × lower-back, typing × neck, stairs × knees, …). |
| `onsetGuidance.ts` / `durationGuidance.ts` / `severityGuidance.ts` | Onset watch-fors, duration follow-ups and severity bands (1–3 / 4–5 / 6–7 / 8–10) with re-check rules. |

Composition order: urgency headline (region + specialist) → one line per red flag (most
serious first) → top-2 region aggravator tips → sensation + onset tips → a follow-up quoting
the user's own numbers → the region's avoid/safe-movement lines. Lists are capped (1–3 items,
5–9 lines total), de-duplicated, and never diagnostic ("can be linked to / worth getting
checked", no medicine names). `lib/pain/__tests__/guidance.test.ts` locks all of this down.

## Folder map

```
src/
  app/                layout.tsx (SEO/OG), globals.css, page.tsx (landing), explore/, health/,
                      not-found.tsx, error.tsx, loading.tsx, sitemap.ts, icon.svg
    api/regions/      GET list + GET [id] (404 on unknown, zod-validated)
    api/pain/assess/  POST — zod body → pure rule engine → typed result
    api/nutrition/    POST calculate (BMI/BMR/TDEE/targets/water), POST meal-plan,
                      GET food-search (optional Open Food Facts)
    api/health-data/  GET status (active providers), GET exercise-image (optional wger)
  components/
    layout/           SiteHeader (full-width, mobile Sheet menu, profile trigger), SiteFooter
                      (+ DataSourcesDialog), DisclaimerGate (root-level first-visit popup),
                      ModeSwitcher, Providers (Query + Toaster + DisclaimerGate + ProfileSheet)
    profile/          ProfileSheet, ProfileView (read-only), ProfileForm (edit),
                      MedicalHistoryField — the ONE profile UI
    landing/          LandingHeader (full-width, centered xl anchors), LandingHero, 9 section
                      components, Reveal, MiniMacroDonut
    avatar/           AvatarCanvas, ProceduralAvatar, GltfAvatar (optional GLTF path),
                      MuscleMesh, CameraRig, RegionTooltip/Labels, ViewControls, WebGLFallback,
                      geometry.ts, useAvatarMaterials.ts, CanvasErrorBoundary
    explore/          ExploreWorkspace, RegionList, ContextPanel, PanelEmptyState, MobileSheet
    build/ pain/ info/ mode panels (one responsibility per file)
    health/           HealthSuiteClient (URL-synced tabs + key numbers), CalculatorsTab, BmiGauge,
                      HowCalculatedPopover, ProfileRequiredState, meal/ (MealPlannerTab,
                      MealCard, FoodItemRow, PlanCharts, WeekPlanView, FoodSearchDialog),
                      hydration/ (HydrationTab, Ring, History), summary/ (SummaryTab,
                      SummaryPreview)
    shared/           DataSourcesDialog
  config/             site, theme, regions, camera, labels, assessment, painSchemas,
                      ergonomics, storageKeys, profileOptions, nutrition, healthSchemas,
                      healthTabs, landingContent, team, medicalConditions, conditionNotes,
                      guidance/ (regionProfiles, redFlagGuidance, sensationGuidance,
                      aggravatorGuidance, onsetGuidance, durationGuidance, severityGuidance),
                      avatar/*
  data/regions/       headNeck, upperBody, core, lowerBody — one RegionContent per region (19 total)
  data/foods.ts       curated India-friendly food database (40 items, per stated serving)
  hooks/              useRegionContent, useUrlSync, useRegionVisualState, useKeyboardShortcuts,
                      useHydrated, usePrefersReducedMotion, useExerciseImage, use-mobile
  lib/                build/ pain/ (assess, guidance, redFlags, conditionNotes, heat + tests),
                      quiz/ health/ (incl. medicalHistory) nutrition/ (pure logic), pdf/,
                      providers/, storage/
  services/           regionService, painService, nutritionService (the only fetchers)
  store/              useExplorerStore (UI state) + persisted workout / pain log / profile
                      (v2, migrated) / quiz-best / hydration / meal-plan + useProfilePanel
  types/              region, anatomy, exercise, pain, profile, quiz, avatar, nutrition
```

## Adding content

1. **Region:** add the id to `REGION_IDS` in `config/regions.ts` and a `REGIONS` entry;
   add a camera preset in `config/camera.ts`; add meshes in `config/avatar/muscleDefinitions.ts`;
   append a fully populated `RegionContent` to the right group file in `data/regions/`; and add a
   `RegionGuidanceProfile` entry to `config/guidance/regionProfiles.ts` so the pain guidance
   composer can talk about it (a unit test iterates `REGION_IDS` and fails on a missing
   profile).
2. **Region guidance entry:** fill every field of `RegionGuidanceProfile` (`areaName`,
   `specialist`, `safeMovement`, `avoidMovement`, `commonLoadingFactors`, `urgentSigns`) in
   natural language — keep the "can be linked to / worth getting checked" tone and never name
   medicines. Optionally add region overrides for specific red flags
   (`redFlagGuidance.ts → regionVariants`) or aggravator/sensation combinations
   (`aggravatorGuidance.ts` / `sensationGuidance.ts → regionVariants`).
3. **Medical condition:** add the id to `MEDICAL_CONDITION_IDS` and the labelled entry to
   `MEDICAL_CONDITIONS` (same group) in `config/medicalConditions.ts` — the picker, the
   profile view, the PDF line and the type union pick it up automatically. If it should
   influence pain-assessment notes, add a rule to `CONDITION_NOTE_RULES` in
   `config/conditionNotes.ts` (informational only — never urgency).
4. **Exercise:** just add it to the region's `build.exercises` — ids are
   `${regionId}-${kebab-name}` and must be globally unique.
5. **Food:** append one `Food` entry to `data/foods.ts` (id, name, servingLabel, kcal/protein/
   carbs/fat per serving, slots `B|LD|S`, role `complete|staple|protein|side|snack`, diet tier,
   allergen tags). The planner picks it up automatically.
6. No UI changes needed — every panel is fully data-driven.

**Optional GLTF avatar:** set `NEXT_PUBLIC_AVATAR_MODEL_URL` to a glTF URL and extend
`config/avatar/meshMap.ts` (mesh name → region). The procedural avatar stays the default.

## Data & state conventions

- Persisted client data uses **versioned keys** (`physiomap:v1:<name>`) through one storage
  helper (`lib/storage/`), which safely handles SSR, missing `window` and quota errors.
  Anything that reads persisted state renders a stable placeholder until hydration
  (`useHydrated` / `useSyncExternalStore`) — the console stays mismatch-free.
- The workspace URL (`/explore?mode=&region=`) and the health tab URL (`/health?tab=`) are the
  single sources of truth for deep links; `useUrlSync` restores them on load and follows
  browser back/forward. Units are always stored metric; imperial is display-only.

## Accessibility & performance

Keyboard-operable region list and mode switcher (with `1/2/3` + `Esc`), visible focus rings,
AA contrast, ARIA roles on every control, `prefers-reduced-motion` disables auto-rotate, avatar
pulses, reveal-on-scroll and celebration animations. The 3D scene caps `dpr` to `[1, 2]`, shares
geometries and per-region materials, pushes visual states imperatively (no mesh re-renders on
hover) and disposes geometries/materials on unmount. WebGL-less browsers get the searchable
Region List. Charts (Recharts) and the PDF stack are lazy-loaded; fonts ship through
`next/font`.

## Team

**Team Psycho-Coderz** — Yashpreet Singh (Team Leader), Yuvraj Singh, Manik Bhalla, Vinayak,
Udhayveer Singh. A shared vision for visual, understandable health guidance.

Out of scope by design: logins, payments, AI pose detection, AR, wearable sync (future
direction, not in this build).
