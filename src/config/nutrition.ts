/**
 * Nutrition & health constants — single source of truth for every calculator
 * and the meal planner. Pure data, no logic (logic lives in `src/lib/health`
 * and `src/lib/nutrition`).
 */

import type { ActivityLevel, Sex, WeightGoal } from '@/types/profile'
import type { BmiBand, BmiCutoffs, MealSlotId, MealSlotKind, MealsPerDay } from '@/types/nutrition'

// ---------------------------------------------------------------------------
// Energy (BMR / TDEE / calorie target)
// ---------------------------------------------------------------------------

/** Multiply BMR by these to get TDEE (standard Harris-style factors). */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
}

export const ACTIVITY_LEVEL_ORDER: readonly ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'athlete',
]

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: 'Mostly sitting, little or no exercise.',
  light: 'Light exercise or sports 1–3 days a week.',
  moderate: 'Moderate exercise 3–5 days a week.',
  active: 'Hard exercise 6–7 days a week.',
  athlete: 'Hard daily exercise plus a physical job or two-a-day training.',
}

/** kcal equivalent of 1 kg of body weight change. */
export const KCAL_PER_KG_WEIGHT_CHANGE = 7700

/** Deficit is capped at 25 % of TDEE for safety. */
export const MAX_DEFICIT_SHARE = 0.25

/** Never plan below these daily kcal floors. */
export const KCAL_FLOOR: Record<Sex, number> = {
  male: 1500,
  female: 1200,
}

// ---------------------------------------------------------------------------
// BMI
// ---------------------------------------------------------------------------

export const BMI_CUTOFF_LABELS: Record<BmiCutoffs, string> = {
  who: 'WHO international',
  'asia-pacific': 'Asia-Pacific',
}

export const BMI_BANDS: Record<BmiCutoffs, readonly BmiBand[]> = {
  who: [
    { key: 'underweight', label: 'Underweight', min: 0, max: 18.5 },
    { key: 'normal', label: 'Normal weight', min: 18.5, max: 25 },
    { key: 'overweight', label: 'Overweight', min: 25, max: 30 },
    { key: 'obese', label: 'Obese', min: 30, max: Number.POSITIVE_INFINITY },
  ],
  'asia-pacific': [
    { key: 'underweight', label: 'Underweight', min: 0, max: 18.5 },
    { key: 'normal', label: 'Normal weight', min: 18.5, max: 23 },
    { key: 'overweight', label: 'Overweight (at risk)', min: 23, max: 25 },
    { key: 'obese', label: 'Obese (high risk)', min: 25, max: Number.POSITIVE_INFINITY },
  ],
}

// ---------------------------------------------------------------------------
// Macros
// ---------------------------------------------------------------------------

/** Protein grams per kg body weight, by goal. */
export const PROTEIN_G_PER_KG: Record<WeightGoal, number> = {
  lose: 2.0,
  maintain: 1.6,
  gain: 1.8,
}

/** Fat covers 25 % of the daily calorie target. */
export const FAT_CALORIE_SHARE = 0.25

/** Fiber ≈ 14 g per 1000 kcal. */
export const FIBER_G_PER_1000_KCAL = 14

export const MACRO_KCAL_PER_G = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const

// ---------------------------------------------------------------------------
// Water
// ---------------------------------------------------------------------------

export const WATER_ML_PER_KG = 35

export const WATER_ACTIVITY_BONUS_ML: Record<ActivityLevel, number> = {
  sedentary: 0,
  light: 250,
  moderate: 500,
  active: 750,
  athlete: 1000,
}

export const WATER_MIN_ML = 1500
export const WATER_MAX_ML = 5000
export const WATER_ROUND_ML = 50

/** Goal used when no profile exists yet. */
export const WATER_FALLBACK_ML = 2500

export const HYDRATION_QUICK_ADDS = [150, 250, 500] as const

// ---------------------------------------------------------------------------
// Meal planner
// ---------------------------------------------------------------------------

export interface MealSplitSlot {
  slotId: MealSlotId
  kind: MealSlotKind
  label: string
  /** Share of the daily calorie target (all shares sum to 1). */
  share: number
}

/** Calorie split per slot for 3/4/5 meals a day. */
export const MEAL_SPLITS: Record<MealsPerDay, readonly MealSplitSlot[]> = {
  3: [
    { slotId: 'breakfast', kind: 'breakfast', label: 'Breakfast', share: 0.3 },
    { slotId: 'lunch', kind: 'lunch', label: 'Lunch', share: 0.35 },
    { slotId: 'dinner', kind: 'dinner', label: 'Dinner', share: 0.35 },
  ],
  4: [
    { slotId: 'breakfast', kind: 'breakfast', label: 'Breakfast', share: 0.25 },
    { slotId: 'lunch', kind: 'lunch', label: 'Lunch', share: 0.35 },
    { slotId: 'snack-1', kind: 'snack', label: 'Snack', share: 0.1 },
    { slotId: 'dinner', kind: 'dinner', label: 'Dinner', share: 0.3 },
  ],
  5: [
    { slotId: 'breakfast', kind: 'breakfast', label: 'Breakfast', share: 0.22 },
    { slotId: 'snack-1', kind: 'snack', label: 'Morning snack', share: 0.08 },
    { slotId: 'lunch', kind: 'lunch', label: 'Lunch', share: 0.3 },
    { slotId: 'snack-2', kind: 'snack', label: 'Evening snack', share: 0.1 },
    { slotId: 'dinner', kind: 'dinner', label: 'Dinner', share: 0.3 },
  ],
}

/** Legal serving multipliers for planner items. */
export const SERVING_STEPS = [0.5, 1, 1.5, 2, 2.5] as const

export const SERVING_MIN = 0.5
export const SERVING_MAX = 2.5

/** Seeded candidate combinations tried per meal slot. */
export const PLANNER_CANDIDATES_PER_SLOT = 200

/** Best slot candidates kept for the day-level cross search. */
export const PLANNER_TOP_PER_SLOT = 8

/** Day score weights: kcal error matters most, then protein, then carbs/fat. */
export const DAY_SCORE_WEIGHTS = {
  kcal: 3,
  protein: 2,
  carbs: 1,
  fat: 1,
} as const

export const MEAL_PLAN_MAX_DAYS = 7

/** Chip tolerance for "Within ±5 % of target". */
export const TARGET_TOLERANCE = 0.05

export const MEAL_PLAN_NOTE =
  'Nutrition values are approximate and for general guidance. Not a substitute for a dietitian.'

// ---------------------------------------------------------------------------
// Explainability blurbs ("How is this calculated?")
// ---------------------------------------------------------------------------

export const FORMULA_SOURCES = {
  bmi: {
    formula: 'BMI = weight (kg) ÷ height² (m²)',
    source: 'WHO / Asia-Pacific BMI classifications',
  },
  bmr: {
    formula: 'Mifflin-St Jeor: men 10·kg + 6.25·cm − 5·age + 5 · women 10·kg + 6.25·cm − 5·age − 161',
    source: 'Mifflin-St Jeor equation (1990)',
  },
  tdee: {
    formula: 'TDEE = BMR × activity factor (1.2 – 1.9)',
    source: 'Harris-Benedict activity factors',
  },
  calorieTarget: {
    formula: 'Target = TDEE ± pace × 7700 ÷ 7 (deficit capped at 25 % of TDEE; floors 1500/1200 kcal)',
    source: '7700 kcal ≈ 1 kg body weight',
  },
  macros: {
    formula: 'Protein 1.6–2.0 g/kg by goal · fat 25 % of kcal · carbs the remainder · fiber 14 g per 1000 kcal',
    source: 'Common sports-nutrition ranges',
  },
  water: {
    formula: '35 ml per kg body weight + activity bonus (0–1000 ml), clamped to 1.5–5 L',
    source: 'EFSA-style daily water guidance',
  },
} as const
