/**
 * Profile completeness + the one-call nutrition summary used across the
 * Health Suite (key numbers card, calculators, planner targets, PDF).
 */

import { WATER_FALLBACK_ML } from '@/config/nutrition'
import { calculateBmiResult } from '@/lib/health/bmi'
import { calculateEnergyResults } from '@/lib/health/energy'
import { calculateMacroTargets } from '@/lib/health/macros'
import { calculateWaterTarget } from '@/lib/health/water'
import type { UserProfile } from '@/types/profile'
import type { NutritionSummary } from '@/types/nutrition'

/**
 * A profile is "complete" for nutrition when every field the calculators need
 * is present. The Profile tab's zod schema enforces the value ranges.
 */
export function isProfileComplete(profile: UserProfile): boolean {
  return (
    profile.age !== undefined &&
    profile.sex !== undefined &&
    profile.heightCm !== undefined &&
    profile.weightKg !== undefined &&
    profile.activityLevel !== undefined &&
    profile.goal !== undefined &&
    profile.paceKgPerWeek !== undefined
  )
}

/** Water goal for a profile, or the 2,500 ml fallback when incomplete. */
export function getWaterGoalMl(profile: UserProfile): number {
  if (profile.weightKg === undefined || profile.activityLevel === undefined) return WATER_FALLBACK_ML
  return calculateWaterTarget(profile.weightKg, profile.activityLevel)
}

/**
 * Complete nutrition summary for a profile (BMI under WHO cut-offs, energy,
 * macros against the calorie target, water goal). Assumes the profile is
 * complete — check `isProfileComplete` first.
 */
export function buildNutritionSummary(profile: UserProfile): NutritionSummary {
  const input = {
    age: profile.age ?? 30,
    sex: profile.sex ?? 'male',
    heightCm: profile.heightCm ?? 170,
    weightKg: profile.weightKg ?? 70,
    activityLevel: profile.activityLevel ?? 'moderate',
    goal: profile.goal ?? 'maintain',
    paceKgPerWeek: profile.paceKgPerWeek ?? 0.5,
  }
  const energy = calculateEnergyResults(input)
  const macros = calculateMacroTargets(energy.targetKcal, input.weightKg, input.goal)
  return {
    bmi: calculateBmiResult(input.weightKg, input.heightCm),
    energy,
    macros,
    waterMl: calculateWaterTarget(input.weightKg, input.activityLevel),
  }
}
