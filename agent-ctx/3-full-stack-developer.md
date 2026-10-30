# TASK 3 — Meal Planner tab (full-stack-developer)

## Scope completed
Built the complete Meal Planner tab of the Health & Nutrition Suite. Only files in my
ownership list were touched; all existing contracts (types, stores, lib helpers, service,
config constants) were consumed as-is, never redefined.

## Files written (all under `src/components/health/meal/`)
1. `MealPlannerTab.tsx` — REPLACED stub (443 lines). Controls card (meals-per-day Select
   3/4/5 default 5 with label "Meals per day", "Generate plan" primary bg-brand-blue button,
   "Regenerate" outline button with RefreshCw + fresh `Math.floor(Math.random()*2**31)` seed,
   disabled without a plan, Today/7-day ToggleGroup). Targets line built from
   `buildNutritionSummary(profile)` (energy.targetKcal + macros) with goal/diet/exclusions
   chips (`WEIGHT_GOAL_LABELS`, `DIET_PREFERENCE_LABELS`, `DIET_TAG_LABELS`). Generation calls
   `nutritionService.generateMealPlan` with `days: view === 'week' ? 7 : 1`, loading state,
   `toast.error('Could not generate a plan')` on failure. Guards: `!hydrated` → skeleton;
   `!isProfileComplete` → `<ProfileRequiredState />`. Empty state ("No plan yet" + Generate).
   Today view: totals-vs-target progress rows (kcal/protein/carbs/fat, color-coded
   over=pain/within=#58B584/under=build, role=progressbar + aria values), green
   "Within ±5% of target" chip via `isWithinTarget(plan)`, "Search a food" button,
   meal-card grid `sm:grid-cols-2 lg:grid-cols-3`, lazy PlanCharts. Week view: WeekPlanView
   (or a prompt card to generate a 7-day plan when the stored plan is shorter). Footer note
   `MEAL_PLAN_NOTE`. FoodSearchDialog wired to the targeted slot (default 'lunch' from the
   header button; per-card "Add food" targets that slot).
2. `MealCard.tsx` — slot card: font-heading label, "580 / 578 kcal" (green text-[#58B584]
   within TARGET_TOLERANCE else muted), Swap ghost icon button (aria-label
   `Swap ${label}`), FoodItemRow list, dashed "No matching foods — try relaxing your diet or
   exclusions." empty row, "Add food" ghost button. Wires `updateItemServings` /
   `removeItem` from `useMealPlanStore` itself (props stay `{dayIndex, slot, onSwap, onAddCustom}`).
3. `FoodItemRow.tsx` — name (truncate) + "2 × 1 katori" serving text (when servings !== 1),
   macro line "160 kcal · 9 g protein · 22 g carbs · 4 g fat" (text-[11px]), stepper with
   Minus/Plus ghost h-7 w-7 buttons: planner items clamp 0.5–2.5 in 0.5 steps showing `×1.5`;
   `off:`-prefixed custom items step 0.5 (50 g) up to 10 showing grams (`150 g`). Trash2
   remove (text-mode-pain hover:bg-mode-pain/10). aria-labels on every button, aria-live value.
4. `PlanCharts.tsx` — default export (for `next/dynamic` in MealPlannerTab, ssr:false, pulse
   loading fallback). Card 1: double Recharts donut (Pie innerRadius 38%/56% = target ring,
   innerRadius 64%/86% = plan ring, cornerRadius 4, paddingAngle 2; protein #F26B4E,
   carbs #3B74F2, fat #F3B38A; rings share energy semantics via MACRO_KCAL_PER_G) with
   center "X of Y kcal" overlay and custom legend "Protein 96 g / 112 g · 26% of energy".
   Card 2: BarChart (CartesianGrid rgba(255,255,255,0.06), XAxis slot labels — "Morning
   snack"→"AM snack" etc., custom dark Tooltip bg #1A2233 border-white/10) with Plan bars
   #3B74F2 + thin Target bars rgba(255,255,255,0.18) and a Plan/Target legend.
5. `WeekPlanView.tsx` (146 lines) — day-chip row ("Day 1…7" + kcal + green dot when
   `isWithinTarget(plan, i)`, min-h-44px, aria-pressed), "No identical main dish on
   consecutive days." caption with CalendarCheck, selected-day summary line
   (kcal/protein/carbs/fat vs target), MealCard grid with working Swap
   (`regenerateMealSlot` + fresh seed → `setPlan`), steppers and its own FoodSearchDialog
   wiring (`addCustomItem` + sonner toast).
6. `FoodSearchDialog.tsx` — Dialog sm:max-w-md, autofocus search input, 400 ms debounce,
   TanStack Query `useQuery(['food-search', q], enabled: open && q.length >= 2)`. States:
   integration-off info box (exact copy from spec), skeletons while pending, error text,
   empty results, and result rows (max-h-96 overflow-y-auto scroll-slim): thumbnail (plain
   img alt=name h-10 w-10 rounded object-cover, only when imageUrl) or icon placeholder,
   brand + per-100 g macro line, grams stepper (default 100 g, 50 g steps, 50–500), Add
   button (aria-label `Add ${name} to meal`, brand-blue). onAdd builds PlannedFoodItem
   (foodId already `off:`-prefixed, servingLabel '100 g', servings = grams/100, totals =
   perServing × servings rounded to 1 dp) then the parent closes it. Caption
   "Nutrition data from Open Food Facts (per 100 g)."

## QA status
- `bunx tsc --noEmit`: ZERO errors in my six files (verified by filtering output to
  `components/health/meal/`). NOTE: at final run there were 6 TS2552 errors in
  `src/components/health/CalculatorsTab.tsx` (missing `Skeleton` import) — that file is
  owned by a PARALLEL agent (Task 2) and was mid-write; per the ownership rules I did not
  touch it.
- `bun run lint`: PASS, zero errors (exit 0).
- dev.log: my files compiled cleanly (last "✓ Compiled in 2.1s" right after the final
  MealPlannerTab save; all ⨯ entries in the log are older, from before the suite tabs
  existed). The dev server process was not listening on :3000 at the end of my run —
  it is system-managed and was healthy through my final compile.

## Design decisions / deviations
- ToggleGroup used for the Today/7-day switch (spec allowed Tabs or ToggleGroup). Active
  state `data-[state=on]:bg-brand-blue data-[state=on]:text-white` — verified against the
  compiled Tailwind CSS that these utilities sort AFTER the toggle base's
  `data-[state=on]:bg-accent` / `text-accent-foreground`, so the override wins.
- Steppers use custom divs (spec allowed "shadcn Progress or custom divs") because the
  shared Progress component fixes the indicator at bg-primary and cannot be color-coded
  per macro.
- Donut rings are energy-based (grams × 4/4/9 kcal) so both rings are semantically
  comparable; the legend carries grams + % of energy, matching the "Protein 96 g / 112 g"
  spec format.
- The "Search a food" header button targets the lunch slot by default (lunch exists in
  every meal split); per-card "Add food" targets that card's slot. The add target is
  confirmed via a sonner toast ("Added X to Lunch").
- Week view with a <7-day stored plan shows an explicit "Generate 7-day plan" prompt card
  instead of silently regenerating (regeneration replaces the whole plan per spec).
- FoodItemRow stepper buttons are h-7 w-7 exactly as the task spec for that file dictates
  (overrides the general 44px rule there; day chips and primary buttons are ≥44px).
