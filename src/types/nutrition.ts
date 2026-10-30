/**
 * Nutrition & hydration domain types for the Health & Nutrition Suite.
 * Pure data contracts shared by the calculators, meal planner, hydration
 * tracker, PDF summary, providers and API routes.
 */

import type {
  ActivityLevel,
  DietPreference,
  DietTag,
  PaceKgPerWeek,
  Sex,
  WeightGoal,
} from '@/types/profile'

// ---------------------------------------------------------------------------
// Food database
// ---------------------------------------------------------------------------

/** Slots a food can appear in: Breakfast, Lunch/Dinner, Snack. */
export type FoodSlot = 'B' | 'LD' | 'S'

/** Structural role a food plays inside a meal template. */
export type FoodRole = 'complete' | 'staple' | 'protein' | 'side' | 'snack'

/** Diet tier of a food item (ranked, see `lib/nutrition/dietRules`). */
export type FoodDiet = 'vegan' | 'veg' | 'egg' | 'nonveg'

/** kcal + the three macros in one shape. */
export interface MacroTotals {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

/** One entry of the curated local food database (`src/data/foods.ts`). */
export interface Food {
  id: string
  name: string
  /** Human serving description, e.g. "1 katori" or "150 g". */
  servingLabel: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  slots: readonly FoodSlot[]
  role: FoodRole
  diet: FoodDiet
  /** Allergen/ingredient tags the user can exclude (dairy, gluten, …). */
  tags: readonly DietTag[]
}

// ---------------------------------------------------------------------------
// Meal plans
// ---------------------------------------------------------------------------

export type MealsPerDay = 3 | 4 | 5

export type MealSlotKind = 'breakfast' | 'snack' | 'lunch' | 'dinner'

/** Stable per-day slot ids (snacks are numbered to stay unique). */
export type MealSlotId = 'breakfast' | 'snack-1' | 'lunch' | 'snack-2' | 'dinner'

/** A food placed into a meal, with per-serving macros and computed totals. */
export interface PlannedFoodItem {
  foodId: string
  name: string
  servingLabel: string
  /** Serving multiplier (planner uses 0.5–2.5 in 0.5 steps; custom items use grams/100). */
  servings: number
  perServing: MacroTotals
  totals: MacroTotals
}

export interface MealSlotPlan {
  slotId: MealSlotId
  kind: MealSlotKind
  label: string
  targetKcal: number
  items: PlannedFoodItem[]
  totals: MacroTotals
}

export interface DayPlan {
  /** 0-based index inside a multi-day plan. */
  index: number
  slots: MealSlotPlan[]
  totals: MacroTotals
}

/** Daily nutrition targets the planner aims for. */
export interface NutritionTargets {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface MealPlan {
  seed: number
  diet: DietPreference
  exclusions: DietTag[]
  mealsPerDay: MealsPerDay
  targets: NutritionTargets
  days: DayPlan[]
  generatedAt: string
}

// ---------------------------------------------------------------------------
// Calculators
// ---------------------------------------------------------------------------

export type BmiCategoryKey = 'underweight' | 'normal' | 'overweight' | 'obese'

/** BMI cut-off set: WHO international or Asia-Pacific. */
export type BmiCutoffs = 'who' | 'asia-pacific'

export interface BmiBand {
  key: BmiCategoryKey
  label: string
  min: number
  /** Exclusive upper bound (Infinity for the top band). */
  max: number
}

export interface BmiResult {
  value: number
  categoryKey: BmiCategoryKey
  categoryLabel: string
  /** Healthy weight range (kg) for the user's height under the active cut-offs. */
  healthyMinKg: number
  healthyMaxKg: number
}

export interface EnergyResults {
  bmr: number
  tdee: number
  tdeeByLevel: Record<ActivityLevel, number>
  targetKcal: number
  /** Planned daily deficit (negative) or surplus (positive) in kcal. */
  calorieDelta: number
  /** True when the safety kcal floor overrode the computed target. */
  floorApplied: boolean
}

export interface MacroTargets extends MacroTotals {
  fiber: number
  proteinKcal: number
  carbsKcal: number
  fatKcal: number
  /** Energy share per macro, 0–1 (of the calorie target). */
  proteinShare: number
  carbsShare: number
  fatShare: number
}

/** Everything the calculators produce for one profile. */
export interface NutritionSummary {
  bmi: BmiResult
  energy: EnergyResults
  macros: MacroTargets
  waterMl: number
}

/** The nutrition-relevant subset of the profile (validate with zod in `config/healthSchemas`). */
export interface HealthProfileInput {
  age: number
  sex: Sex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: WeightGoal
  paceKgPerWeek: PaceKgPerWeek
}

// ---------------------------------------------------------------------------
// External food search (optional Open Food Facts adapter)
// ---------------------------------------------------------------------------

export interface FoodSearchResult {
  id: string
  name: string
  brand: string
  /** Per 100 g values. */
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  imageUrl?: string
}

export interface FoodSearchResponse {
  enabled: boolean
  source: 'open-food-facts'
  results: FoodSearchResult[]
}

// ---------------------------------------------------------------------------
// Hydration tracking
// ---------------------------------------------------------------------------

export interface HydrationEntry {
  id: string
  amountMl: number
  /** ISO timestamp. */
  timestamp: string
}

/** Hydration log keyed by local date (`YYYY-MM-DD`). */
export type HydrationLog = Record<string, HydrationEntry[]>

export interface HydrationDayPoint {
  dateKey: string
  /** Short weekday label, e.g. "Mon". */
  label: string
  amountMl: number
  goalMl: number
}

// ---------------------------------------------------------------------------
// Health data provider status
// ---------------------------------------------------------------------------

export type ProviderId = 'local' | 'wger' | 'open-food-facts'

export interface ProviderStatus {
  id: ProviderId
  label: string
  description: string
  enabled: boolean
}

export interface HealthDataStatus {
  providers: ProviderStatus[]
}
