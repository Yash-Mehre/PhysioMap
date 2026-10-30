/**
 * Deterministic, seedable meal planner (pure — no DOM, no storage, no fetch).
 *
 * For each meal slot the planner tries ~200 seeded candidate combinations
 * built from composition templates (see `MEAL_SPLITS` + templates below),
 * scaling servings in 0.5 steps (0.5–2.5) toward the slot's calorie target.
 * The best candidates per slot are then combined into a whole day, scored by
 * weighted relative error of kcal (×3), protein (×2), carbs (×1) and fat (×1),
 * and the best combination wins. Multi-day plans guarantee that no identical
 * main item appears in the same slot on consecutive days.
 */

import {
  DAY_SCORE_WEIGHTS,
  MEAL_SPLITS,
  PLANNER_CANDIDATES_PER_SLOT,
  PLANNER_TOP_PER_SLOT,
  SERVING_STEPS,
  TARGET_TOLERANCE,
} from '@/config/nutrition'
import { FOODS } from '@/data/foods'
import { filterAllowedFoods } from '@/lib/nutrition/dietRules'
import { createSeededRng, mixSlotSeed, pickSeeded } from '@/lib/nutrition/seededRandom'
import type { DietPreference, DietTag } from '@/types/profile'
import type {
  DayPlan,
  Food,
  MacroTotals,
  MealPlan,
  MealSlotId,
  MealSlotKind,
  MealSlotPlan,
  MealsPerDay,
  NutritionTargets,
  PlannedFoodItem,
} from '@/types/nutrition'

// ---------------------------------------------------------------------------
// Public request type
// ---------------------------------------------------------------------------

export interface MealPlanRequest {
  targets: NutritionTargets
  diet: DietPreference
  exclusions: DietTag[]
  mealsPerDay: MealsPerDay
  seed: number
  days: number
}

// ---------------------------------------------------------------------------
// Internal model
// ---------------------------------------------------------------------------

/** One scored combination for a single slot. */
interface SlotCandidate {
  items: PlannedFoodItem[]
  totals: MacroTotals
  /** Ids of the "main" items (complete / staple / protein roles). */
  mainFoodIds: string[]
  /** Stable identity of the food combination (ids + servings). */
  signature: string
  /** Relative kcal error vs the slot target (lower is better). */
  kcalError: number
}

const MAIN_ROLES: readonly string[] = ['complete', 'staple', 'protein']

function emptyTotals(): MacroTotals {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0 }
}

function addTotals(a: MacroTotals, b: MacroTotals): MacroTotals {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

/** Build a planned item (totals = per-serving × servings). */
function makeItem(food: Food, servings: number): PlannedFoodItem {
  const perServing: MacroTotals = {
    kcal: food.kcal,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
  }
  return {
    foodId: food.id,
    name: food.name,
    servingLabel: food.servingLabel,
    servings,
    perServing,
    totals: {
      kcal: round1(perServing.kcal * servings),
      protein: round1(perServing.protein * servings),
      carbs: round1(perServing.carbs * servings),
      fat: round1(perServing.fat * servings),
    },
  }
}

/** Rescale an existing planned item (used by the servings stepper). */
export function scalePlannedItem(item: PlannedFoodItem, servings: number): PlannedFoodItem {
  return {
    ...item,
    servings,
    totals: {
      kcal: round1(item.perServing.kcal * servings),
      protein: round1(item.perServing.protein * servings),
      carbs: round1(item.perServing.carbs * servings),
      fat: round1(item.perServing.fat * servings),
    },
  }
}

// ---------------------------------------------------------------------------
// Pools & templates
// ---------------------------------------------------------------------------

interface FoodPools {
  breakfastComplete: Food[]
  breakfastExtra: Food[]
  staple: Food[]
  protein: Food[]
  side: Food[]
  lunchComplete: Food[]
  snack: Food[]
}

function buildPools(foods: readonly Food[]): FoodPools {
  const inSlot = (food: Food, slot: Food['slots'][number]): boolean => food.slots.includes(slot)
  return {
    breakfastComplete: foods.filter((f) => inSlot(f, 'B') && f.role === 'complete'),
    breakfastExtra: foods.filter(
      (f) => (inSlot(f, 'B') && f.role === 'side') || (inSlot(f, 'S') && f.role === 'snack'),
    ),
    staple: foods.filter((f) => inSlot(f, 'LD') && f.role === 'staple'),
    protein: foods.filter((f) => inSlot(f, 'LD') && f.role === 'protein'),
    side: foods.filter((f) => inSlot(f, 'LD') && f.role === 'side'),
    lunchComplete: foods.filter((f) => inSlot(f, 'LD') && f.role === 'complete'),
    snack: foods.filter((f) => inSlot(f, 'S') && f.role === 'snack'),
  }
}

/** Template for one candidate: which pools to draw from and how many items. */
interface TemplateSpec {
  pools: (keyof FoodPools)[]
}

function templatesForKind(kind: MealSlotKind, pools: FoodPools): TemplateSpec[] {
  switch (kind) {
    case 'breakfast':
      return [
        { pools: ['breakfastComplete'] },
        { pools: ['breakfastComplete', 'breakfastExtra'] },
      ]
    case 'lunch':
    case 'dinner':
      return [
        { pools: ['staple', 'protein', 'side'] },
        { pools: ['lunchComplete', 'side'] },
      ]
    case 'snack':
      return [{ pools: ['snack'] }, { pools: ['snack', 'snack'] }]
  }
}

// ---------------------------------------------------------------------------
// Candidate generation
// ---------------------------------------------------------------------------

/** Pick a seeded, distinct food from each template pool (null when empty). */
function pickFoodsForTemplate(
  spec: TemplateSpec,
  pools: FoodPools,
  rng: () => number,
): Food[] | null {
  const picked: Food[] = []
  const usedIds = new Set<string>()
  for (const poolKey of spec.pools) {
    const pool = pools[poolKey]
    if (pool.length === 0) return null
    // Try a few times to find an unused food (snack×snack template needs two).
    let choice: Food | null = null
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const candidate = pickSeeded(pool, rng)
      if (!usedIds.has(candidate.id)) {
        choice = candidate
        break
      }
    }
    if (!choice) return null
    usedIds.add(choice.id)
    picked.push(choice)
  }
  return picked
}

/**
 * Scale the anchor (highest-calorie) item's servings through every legal step
 * and keep the value that lands closest to the slot target.
 */
function scaleTowardTarget(items: Food[], rng: () => number, targetKcal: number): PlannedFoodItem[] {
  const baseServings = items.map(() => pickSeeded(SERVING_STEPS, rng))
  const anchorIndex = items.reduce(
    (best, food, index) => (food.kcal > items[best].kcal ? index : best),
    0,
  )

  let bestServings = baseServings
  let bestError = Number.POSITIVE_INFINITY
  for (const step of SERVING_STEPS) {
    const servings = [...baseServings]
    servings[anchorIndex] = step
    const kcal = items.reduce((sum, food, index) => sum + food.kcal * servings[index], 0)
    const error = Math.abs(kcal - targetKcal)
    if (error < bestError) {
      bestError = error
      bestServings = servings
    }
  }

  return items.map((food, index) => makeItem(food, bestServings[index]))
}

/** Generate and rank candidates for one slot. */
function generateSlotCandidates(
  kind: MealSlotKind,
  slotIndex: number,
  dayIndex: number,
  targetKcal: number,
  pools: FoodPools,
  seed: number,
  excludeMainFoodIds: readonly string[],
): SlotCandidate[] {
  const rng = createSeededRng(mixSlotSeed(seed, dayIndex, slotIndex))
  const templates = templatesForKind(kind, pools)
  const byCombination = new Map<string, SlotCandidate>()

  for (let attempt = 0; attempt < PLANNER_CANDIDATES_PER_SLOT; attempt += 1) {
    const spec = pickSeeded(templates, rng)
    const foods = pickFoodsForTemplate(spec, pools, rng)
    if (!foods) continue

    // Consecutive-day rule: skip candidates reusing an excluded main item.
    const mainFoodIds = foods.filter((f) => MAIN_ROLES.includes(f.role)).map((f) => f.id)
    if (mainFoodIds.some((id) => excludeMainFoodIds.includes(id))) continue

    const items = scaleTowardTarget(foods, rng, targetKcal)
    const totals = items.reduce((sum, item) => addTotals(sum, item.totals), emptyTotals())
    const combinationKey = foods.map((f) => f.id).sort().join('+')
    const signature = items.map((item) => `${item.foodId}@${item.servings}`).join('|')
    const kcalError = targetKcal > 0 ? Math.abs(totals.kcal - targetKcal) / targetKcal : 1

    const existing = byCombination.get(combinationKey)
    if (!existing || kcalError < existing.kcalError) {
      byCombination.set(combinationKey, { items, totals, mainFoodIds, signature, kcalError })
    }
  }

  return [...byCombination.values()]
    .sort((a, b) => a.kcalError - b.kcalError)
    .slice(0, PLANNER_TOP_PER_SLOT)
}

// ---------------------------------------------------------------------------
// Day assembly
// ---------------------------------------------------------------------------

/** Weighted relative error of a full day against the targets (lower = better). */
function scoreDay(totals: MacroTotals, targets: NutritionTargets): number {
  const rel = (actual: number, target: number): number => (target > 0 ? Math.abs(actual - target) / target : 0)
  return (
    rel(totals.kcal, targets.kcal) * DAY_SCORE_WEIGHTS.kcal +
    rel(totals.protein, targets.protein) * DAY_SCORE_WEIGHTS.protein +
    rel(totals.carbs, targets.carbs) * DAY_SCORE_WEIGHTS.carbs +
    rel(totals.fat, targets.fat) * DAY_SCORE_WEIGHTS.fat
  )
}

function assembleDay(
  candidatesPerSlot: SlotCandidate[][],
  targets: NutritionTargets,
): PlannedFoodItem[][] {
  let bestChoice: PlannedFoodItem[][] | null = null
  let bestScore = Number.POSITIVE_INFINITY

  const indices = candidatesPerSlot.map(() => 0)
  const totals: MacroTotals = emptyTotals()

  // Iterative odometer over the cross product of slot candidates.
  const walk = (slot: number, accumulated: MacroTotals): void => {
    if (slot === candidatesPerSlot.length) {
      const score = scoreDay(accumulated, targets)
      if (score < bestScore) {
        bestScore = score
        bestChoice = indices.map((candidateIndex, slotIndex) => candidatesPerSlot[slotIndex][candidateIndex].items)
      }
      return
    }
    for (let candidateIndex = 0; candidateIndex < candidatesPerSlot[slot].length; candidateIndex += 1) {
      indices[slot] = candidateIndex
      walk(slot + 1, addTotals(accumulated, candidatesPerSlot[slot][candidateIndex].totals))
    }
  }

  walk(0, totals)
  return bestChoice ?? candidatesPerSlot.map((list) => (list.length > 0 ? list[0].items : []))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generate a full meal plan (deterministic for a given seed). */
export function generateMealPlan(request: MealPlanRequest): MealPlan {
  const allowed = filterAllowedFoods(FOODS, request.diet, request.exclusions)
  const pools = buildPools(allowed)
  const splits = MEAL_SPLITS[request.mealsPerDay]
  const days: DayPlan[] = []
  let previousDayMains: Record<string, string[]> = {}

  for (let dayIndex = 0; dayIndex < request.days; dayIndex += 1) {
    const candidatesPerSlot: SlotCandidate[][] = []
    for (let slotIndex = 0; slotIndex < splits.length; slotIndex += 1) {
      const split = splits[slotIndex]
      const targetKcal = request.targets.kcal * split.share
      const exclude = previousDayMains[split.slotId] ?? []
      let candidates = generateSlotCandidates(
        split.kind,
        slotIndex,
        dayIndex,
        targetKcal,
        pools,
        request.seed,
        exclude,
      )
      // If the consecutive-day filter starved a slot, retry without it.
      if (candidates.length === 0 && exclude.length > 0) {
        candidates = generateSlotCandidates(
          split.kind,
          slotIndex,
          dayIndex,
          targetKcal,
          pools,
          request.seed,
          [],
        )
      }
      candidatesPerSlot.push(candidates)
    }

    const chosenItems = assembleDay(candidatesPerSlot, request.targets)
    const slots: MealSlotPlan[] = splits.map((split, slotIndex) => ({
      slotId: split.slotId,
      kind: split.kind,
      label: split.label,
      targetKcal: Math.round(request.targets.kcal * split.share),
      items: chosenItems[slotIndex] ?? [],
      totals: (chosenItems[slotIndex] ?? []).reduce(
        (sum, item) => addTotals(sum, item.totals),
        emptyTotals(),
      ),
    }))

    previousDayMains = Object.fromEntries(
      slots.map((slot) => [
        slot.slotId,
        slot.items.filter((item) => {
          const food = FOODS.find((f) => f.id === item.foodId)
          return food ? MAIN_ROLES.includes(food.role) : true
        }).map((item) => item.foodId),
      ]),
    )

    days.push({
      index: dayIndex,
      slots,
      totals: slots.reduce((sum, slot) => addTotals(sum, slot.totals), emptyTotals()),
    })
  }

  return {
    seed: request.seed,
    diet: request.diet,
    exclusions: [...request.exclusions],
    mealsPerDay: request.mealsPerDay,
    targets: request.targets,
    days,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Re-pick exactly one slot of one day (keep the rest), avoiding the slot's
 * current main item so a swap always changes something.
 */
export function regenerateMealSlot(
  plan: MealPlan,
  dayIndex: number,
  slotId: MealSlotId,
  seed: number,
): MealPlan {
  const day = plan.days[dayIndex]
  if (!day) return plan
  const slotIndex = day.slots.findIndex((slot) => slot.slotId === slotId)
  if (slotIndex < 0) return plan

  const allowed = filterAllowedFoods(FOODS, plan.diet, plan.exclusions)
  const pools = buildPools(allowed)
  const split = MEAL_SPLITS[plan.mealsPerDay][slotIndex]
  const currentSlot = day.slots[slotIndex]

  const currentMains = currentSlot.items
    .filter((item) => {
      const food = FOODS.find((f) => f.id === item.foodId)
      return food ? MAIN_ROLES.includes(food.role) : true
    })
    .map((item) => item.foodId)

  let candidates = generateSlotCandidates(
    split.kind,
    slotIndex,
    dayIndex,
    plan.targets.kcal * split.share,
    pools,
    seed,
    currentMains,
  )
  if (candidates.length === 0) {
    candidates = generateSlotCandidates(
      split.kind,
      slotIndex,
      dayIndex,
      plan.targets.kcal * split.share,
      pools,
      seed,
      [],
    )
  }
  if (candidates.length === 0) return plan

  // Score each replacement against the whole (fixed) rest of the day.
  const restTotals = day.slots.reduce(
    (sum, slot, index) => (index === slotIndex ? sum : addTotals(sum, slot.totals)),
    emptyTotals(),
  )
  let best = candidates[0]
  let bestScore = Number.POSITIVE_INFINITY
  for (const candidate of candidates) {
    const score = scoreDay(addTotals(restTotals, candidate.totals), plan.targets)
    if (score < bestScore) {
      bestScore = score
      best = candidate
    }
  }

  const newSlot: MealSlotPlan = {
    ...currentSlot,
    items: best.items,
    totals: best.totals,
  }

  const newSlots = day.slots.map((slot, index) => (index === slotIndex ? newSlot : slot))
  const newDays = plan.days.map((d) =>
    d.index === dayIndex
      ? { ...d, slots: newSlots, totals: newSlots.reduce((sum, slot) => addTotals(sum, slot.totals), emptyTotals()) }
      : d,
  )

  return { ...plan, days: newDays }
}

/** True when a day's kcal lands within ±5 % of the target. */
export function isWithinTarget(plan: MealPlan, dayIndex = 0): boolean {
  const day = plan.days[dayIndex]
  if (!day || plan.targets.kcal <= 0) return false
  return Math.abs(day.totals.kcal - plan.targets.kcal) / plan.targets.kcal <= TARGET_TOLERANCE
}
