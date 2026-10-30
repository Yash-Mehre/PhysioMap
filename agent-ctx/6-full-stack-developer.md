# TASK 6 — Landing Page (full-stack-developer)

## Scope delivered

Built the full 10-section pitch-deck landing page, landing header, DataSourcesDialog and typed content configs. All copy lives in `src/config/landingContent.ts` / `src/config/team.ts`; components contain zero hardcoded copy.

## Files written (ownership list, all complete)

1. `src/config/team.ts` — `TEAM_MEMBERS` (5 members, `isLeader` on Yashpreet Singh only, stable `id` keys since two members share "YS" initials).
2. `src/config/landingContent.ts` — typed content (`as const satisfies` + explicit interfaces): `SectionIntro`, `LandingProblem`, `LandingStep`, `LandingModeCard`, `LandingSuiteCard`, `LandingPersona`, `LandingFutureItem`, `EngineLayer`, `HeaderNavLink`; exports HEADER_NAV/HEADER_CTA, HERO_CONTENT, PROBLEM_*, SOLUTION_*, MODES_* (+ pain note), SUITE_* , ENGINE_* (layers, flow nodes, caption), PERSONAS_*, FUTURE_*, TEAM_*, CLOSING_CONTENT.
3. `src/components/landing/Reveal.tsx` — client reveal wrapper; `useReducedMotion()` → renders plain div; otherwise `initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true, margin:'-80px'}}`. Content never stays hidden.
4. `src/components/landing/LandingHero.tsx` — REWRITTEN. Two-column grid, bg-grid + brand-blue blur, motion entrance, eyebrow "ZINNOVATIO HACKATHON · TEAM PSYCHO-CODERZ", H1 "PhysioMap:" + gradient second line, copper-rule, subtitle, Launch CTA + "See how it works" outline anchor CTA (smooth scroll, reduced-motion gated). Right: ONLY WebGL canvas on the page — dynamic AvatarCanvas (ssr:false, Loader2 status), `interactive autoRotate`, hover override `{tint/emissive:'#F3B38A', intensity:0.35, opacity:1}` over `createNeutralRegionStyles(REGION_IDS)`, click → `router.push('/explore?mode=info&region=<id>')`, WebGL-fallback `onOpenRegions` → `/explore`, "Tap a muscle" hint chip (Hand icon) bottom-center, decorative rounded frame, h-[380px]/sm:h-[460px]/lg:h-[600px].
5. `src/components/landing/ProblemSection.tsx` — 3 cards (PersonStanding/LineChart/MessageCircleWarning in copper-tinted circles).
6. `src/components/landing/SolutionSection.tsx` — Tap→Explore→Act stepper, `sm:grid-cols-[1fr_auto_1fr_auto_1fr]` with hidden-on-mobile ArrowRight separators, copper number badges 1-2-3, closing line "One avatar connects fitness, recovery, and education."
7. `src/components/landing/ModesSection.tsx` — mode cards with mode-color gradient top bar, inline SVG illustrations (bars / concentric target / eye — no WebGL), dot bullets, mode-colored "Try it" links (`/explore?mode=build&region=chest`, `pain&region=lower-back`, `info&region=shoulders`), pain-mode callout `border-mode-pain/25 bg-mode-pain/8`.
8. `src/components/landing/SuiteSection.tsx` — 4 Link cards (`border-t-2 border-t-brand-blue` verified to override base border in Tailwind v4 cascade), Calculator/UtensilsCrossed/Droplets/FileDown icons, hover:-translate-y-0.5; planner card embeds `<MiniMacroDonut />` + "Sample" chip.
9. `src/components/landing/EngineSection.tsx` — left: React (bg-brand-blue), Three.js/WebGL (bg-warm-peach), Health APIs (bg-white) layer cards with Atom/Box/Database; right: pure-SVG 4-node flow diagram (360×312 viewBox, surfaceRaised nodes, copper arrows, blue-stroked 3D engine node), "View data sources" outline button → `<DataSourcesDialog>`, honesty caption.
10. `src/components/landing/PersonaSection.tsx` — 4 Link cards (Zap/Laptop/Dumbbell/HeartPulse) with the specified deep links + caption.
11. `src/components/landing/FutureSection.tsx` — dashed-border cards (ScanFace/Glasses/Watch) + "Planned" badges + honesty caption.
12. `src/components/landing/TeamSection.tsx` — 5 cards (sm:2 / lg:5 cols), copper initial badges h-12 w-12, Team Leader badge on first, caption; data from `@/config/team`.
13. `src/components/landing/ClosingCta.tsx` — centered panel, gradient "Thank you.", subtitle credit, Launch CTA. SiteFooter renders after it (page.tsx).
14. `src/components/landing/LandingHeader.tsx` — sticky top-0 z-40, transparent → `bg-background/85 backdrop-blur-md border-b border-white/8` after scrollY>8 (passive listener + cleanup), logo mirrors SiteHeader, anchor nav (Problem·Solution·Modes·Suite·Engine·Team) with `scrollIntoView` smooth gated by prefers-reduced-motion + `history.replaceState`, Launch CTA (hidden on mobile), mobile Sheet (right) with anchors (closes sheet, delayed scroll for Radix scroll-lock release) + CTA (closes on navigate). h-11 targets.
15. `src/components/landing/MiniMacroDonut.tsx` — pure SVG donut (r=40, stroke 10, rotate(-90)), protein #F26B4E 30% / carbs #3B74F2 50% / fat #F3B38A 20% via precomputed stroke-dasharray/offset, "2,625 kcal" center, aria-label + sr-only breakdown.
16. `src/components/shared/DataSourcesDialog.tsx` — client dialog (children trigger pattern like ProfileDialog); TanStack Query `['health-data-status']` via `healthDataService.getStatus()`, `enabled: open`, staleTime 5min; skeleton rows while pending; provider rows (enabled dot #58B584 / off #9AA6BC, "Active" / "Optional · off" badges), env-flag footer note, error fallback row.
17. `src/app/page.tsx` — REPLACED. Server component, `export const metadata` description, renders LandingHeader + main (Hero, Problem, Solution, Modes, Suite, Engine, Personas, Future, Team, ClosingCta) + SiteFooter. Sections 2-9 are server components rendering the client `<Reveal>`.

## QA results

- `bunx tsc --noEmit`: ZERO errors project-wide (an earlier transient error in `src/lib/pdf/healthSummary.ts` — another agent's file — was resolved before final run).
- `bun run lint`: ZERO errors.
- Runtime: page verified live BEFORE the dev server went down — `GET /` 200 twice, SSR HTML confirmed all 10 section ids, team names, donut, pain note, "Tap a muscle", closing CTA. Dev server later stopped responding (system-managed process, no crash trace in dev.log; other agents were compiling in parallel). Final edits after that (sheet CTA onClick) are covered by tsc+lint.
- Tailwind cascade verified: `border-t-brand-blue` registers after `border-color` utilities in tailwindcss v4 source → suite card top bar renders blue as specified.

## Deviations / notes for other agents

- `globals.css` untouched (per rules). No new packages. No files outside ownership list edited.
- Modes eyebrow copy "THREE MODES" and personas eyebrow "WHO IT'S FOR" chosen where spec said just "eyebrow".
- Suite grid is `sm:grid-cols-2 lg:grid-cols-4`; persona grid `sm:grid-cols-2 lg:grid-cols-4`.
- ClosingCta uses a subtle rounded panel (border-white/8 bg-surface/50 + blue blur) — spec only required "centered block py-20".
- `TeamMember` in config/team.ts has an extra `id` field (stable React keys; two "YS" initials collide).
- DataSourcesDialog self-contains its own copy (shared component, not landing-section copy).
- `/explore` and `/health?tab=...` deep links are consumed by Tasks 2/3 components (explore page, health tabs).
