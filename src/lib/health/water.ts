/**
 * Daily water target (pure): 35 ml per kg body weight + an activity bonus
 * (0 / 250 / 500 / 750 / 1000 ml), clamped to 1.5–5 L and rounded to 50 ml.
 */

import {
  WATER_ACTIVITY_BONUS_ML,
  WATER_MAX_ML,
  WATER_MIN_ML,
  WATER_ML_PER_KG,
  WATER_ROUND_ML,
} from '@/config/nutrition'
import type { ActivityLevel } from '@/types/profile'

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function calculateWaterTarget(weightKg: number, activityLevel: ActivityLevel): number {
  const raw = weightKg * WATER_ML_PER_KG + WATER_ACTIVITY_BONUS_ML[activityLevel]
  const clamped = Math.min(Math.max(raw, WATER_MIN_ML), WATER_MAX_ML)
  return roundTo(clamped, WATER_ROUND_ML)
}
