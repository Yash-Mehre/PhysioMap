# Task 4 — Hydration Tab (full-stack-developer)

## Status: COMPLETE

## Files written (ownership respected — only these 3)

1. **`src/components/health/hydration/HydrationTab.tsx`** (REPLACED stub) — main tab, no props.
2. **`src/components/health/hydration/HydrationRing.tsx`** (NEW) — animated SVG progress ring.
3. **`src/components/health/hydration/HydrationHistory.tsx`** (NEW) — 7-day Recharts bar chart, **named export**.

## Implementation summary

### HydrationTab.tsx
- Works WITHOUT a complete profile (goal falls back via `getWaterGoalMl` → `WATER_FALLBACK_ML` 2500). Skeleton grid until `useHydrated()`; otherwise always renders the tracker.
- Incomplete profile → subtle info chip: "Using a default 2,500 ml goal — complete your profile for a personalized target" with `next/link` to `/health?tab=profile`.
- Layout: `grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`.
- Left main card: `HydrationRing` centered + "1,450 ml of 2,950 ml" (font-heading bold) + rounded percent chip + streak chip (Flame, `text-[#E8A94A]`, hidden at 0) + "Goal reached!" celebration chip.
- Quick-add card: three outline buttons (Droplets icon, `HYDRATION_QUICK_ADDS` 150/250/500, h-11 touch targets); custom amount form (Input `id="custom-amount"` + Label, min 50 / max 2000 / step 50, Enter submits) with `bg-brand-blue` Add button; ghost "Undo last" (Undo2, disabled when today has no entries — keyed by `toDateKey(new Date())`); today's log list (max-h-72, scroll-slim, newest-first, date-fns `format(ts, 'h:mm a')`, subtle blue dot) with "Nothing logged yet today." empty state.
- Toasts: `toast.success(`Added ${formatMl(amount)}`)` on add (quick + custom); `toast.error` on invalid custom input; `toast.success('Hydration goal reached — great work!')` on goal crossing; small toast on undo.
- Celebration: `wasGoalReachedRef` (null-initialized so a reload with goal already met does not re-fire) → toast only on false→true crossing; the chip itself mounts/unmounts with `goalReached` so its spring replays on each crossing. With `usePrefersReducedMotion()` true, chip renders as a plain span (no animation).
- `HydrationHistory` lazy-loaded exactly per spec: `dynamic(() => import(...).then(m => m.HydrationHistory), { ssr: false, loading: ... h-64 animate-pulse skeleton })`.

### HydrationRing.tsx
- Props `{ totalMl, goalMl, size = 200 }`; SVG track circle `rgba(255,255,255,0.08)` w14, progress arc `#3B74F2` round cap, `strokeDasharray/offset` from `hydrationPercent`, rotated -90° (fills from top), animated with `motion.circle` spring (safe under global `MotionConfig reducedMotion="user"`).
- Center: percent (font-heading text-3xl bold) OR CheckCircle2 `text-[#58B584]` + "Goal reached" when met; below center `formatMl(total) / formatMl(goal)` in text-xs muted. `role="img"` + aria-label "1,450 of 2,950 ml — 49% of today's water goal" (adapted phrasing when reached).

### HydrationHistory.tsx
- Props `{ log, goalMl }`; computes `hydrationWeekSeries`. BarChart height 240 (`h-60`) in ResponsiveContainer; bars fill `#3B74F2` radius `[6,6,0,0]`, today (last) bar `#58B584` via `Cell`; dashed `ReferenceLine y={goalMl}` stroke `#D9A066` label "Goal" inside top right; XAxis label ticks `#9AA6BC` 11; YAxis minimal `#9AA6BC` 10 with `formatMl` ticks and domain rounded to 500 ml; CartesianGrid vertical=false `rgba(255,255,255,0.06)`; custom dark tooltip (bg `#1A2233`, border white/10, "Mon: 1,450 ml / 2,950 ml") with a type-guarded payload parse (no `any`). Bar animation disabled when `usePrefersReducedMotion()`. Caption: "Bars show your daily total; the copper line is your goal."

## QA results
- `bunx tsc --noEmit` → **0 errors** (whole project).
- `bun run lint` → **0 errors / 0 warnings** (whole project).
- `curl http://localhost:3000/health?tab=hydration` → HTTP 200, dev.log clean (no compile errors).

## Deviations from spec
- **Lint-driven refactor**: eslint rule `react-hooks/set-state-in-effect` (eslint-config-next 16) rejects `setCelebrationKey` inside the crossing effect. Dropped the `celebrationKey` counter state — the chip mounts/unmounts with `goalReached`, so its spring replays on every false→true crossing without extra state; the toast still fires only on crossings via the ref-guarded effect (exact spec semantics kept).
- "Goal reached!" chip text/icon also colored `text-[#58B584]` (spec only pinned the icon color).
- Added a small toast on undo ("Removed the last entry") for feedback — spec was silent; harmless.
- Skeleton pulse uses codebase-standard `animate-pulse` (same as every existing skeleton in the project).

## Notes for other agents
- Consumed existing contracts unchanged: `useHydrationStore`, `@/lib/health/hydration` helpers, `getWaterGoalMl`/`isProfileComplete`, `HYDRATION_QUICK_ADDS`/`WATER_FALLBACK_ML`, `formatMl`, `useHydrated`, `usePrefersReducedMotion`.
- If Task 5 (SummaryTab) wants to reuse the ring: `HydrationRing` is a named export, pure props, no store dependency.
- Note: `/agent-ctx` at filesystem root is NOT writable in this sandbox — records live at `/home/z/my-project/agent-ctx/`.
