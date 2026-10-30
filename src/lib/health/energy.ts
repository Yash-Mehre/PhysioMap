/**
 * Energy math (pure): BMR (Mifflin-St Jeor), TDEE, and the daily calorie
 * target by goal with a capped deficit and safety floors.
 */

import {
  ACTIVITY_FACTORS,
  ACTIVITY_LEVEL_ORDER,
  KCAL_FLOOR,
  KCAL_PER_KG_WEIGHT_CHANGE,
  MAX_DEFICIT_SHARE,
} from '@/config/nutrition'
import type { ActivityLevel, PaceKgPerWeek, Sex, WeightGoal } from '@/types/profile'
import type { EnergyResults, HealthProfileInput } from '@/types/nutrition'

/**
 * BMR via the Mifflin-St Jeor equation:
 * men   10·kg + 6.25·cm − 5·age + 5
 * women 10·kg + 6.25·cm − 5·age − 161
 */
export function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  return Math.round(rawBmr(sex, weightKg, heightCm, age))
}

/** Unrounded BMR — TDEE levels derive from this to avoid double rounding. */
function rawBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

/** TDEE = BMR × activity factor. */
export function calculateTdee(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[level])
}

/** TDEE for all five activity levels (for the comparison table). */
export function calculateTdeeByLevel(bmr: number): Record<ActivityLevel, number> {
  return Object.fromEntries(
    ACTIVITY_LEVEL_ORDER.map((level) => [level, calculateTdee(bmr, level)]),
  ) as Record<ActivityLevel, number>
}

/**
 * Daily calorie target by goal.
 * deficit/surplus = pace × 7700 / 7 (kcal/day); a deficit is capped at 25 % of
 * TDEE; the target never drops below 1500 kcal (male) / 1200 kcal (female).
 */
export function calculateCalorieTarget(
  tdee: number,
  goal: WeightGoal,
  pace: PaceKgPerWeek,
  sex: Sex,
): { targetKcal: number; calorieDelta: number; floorApplied: boolean } {
  const dailyChange = (pace * KCAL_PER_KG_WEIGHT_CHANGE) / 7

  let target = tdee
  if (goal === 'lose') {
    const maxDeficit = tdee * MAX_DEFICIT_SHARE
    target = tdee - Math.min(dailyChange, maxDeficit)
  } else if (goal === 'gain') {
    target = tdee + dailyChange
  }

  const floor = KCAL_FLOOR[sex]
  const floorApplied = target < floor
  if (floorApplied) target = floor

  return {
    targetKcal: Math.round(target),
    calorieDelta: goal === 'lose' ? -Math.min(dailyChange, tdee * MAX_DEFICIT_SHARE) : goal === 'gain' ? dailyChange : 0,
    floorApplied,
  }
}

/** Full energy results for a nutrition profile. */
export function calculateEnergyResults(input: HealthProfileInput): EnergyResults {
  const bmr = rawBmr(input.sex, input.weightKg, input.heightCm, input.age)
  const tdeeByLevel = Object.fromEntries(
    ACTIVITY_LEVEL_ORDER.map((level) => [level, Math.round(bmr * ACTIVITY_FACTORS[level])]),
  ) as Record<ActivityLevel, number>
  const tdee = tdeeByLevel[input.activityLevel]
  const { targetKcal, calorieDelta, floorApplied } = calculateCalorieTarget(
    tdee,
    input.goal,
    input.paceKgPerWeek,
    input.sex,
  )
  return { bmr: Math.round(bmr), tdee, tdeeByLevel, targetKcal, calorieDelta, floorApplied }
}
