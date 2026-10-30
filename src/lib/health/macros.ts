/**
 * Macro targets (pure). Protein g/kg by goal (lose 2.0, maintain 1.6, gain
 * 1.8), fat = 25 % of calories, carbs = the remainder, fiber ≈ 14 g per
 * 1000 kcal. Protein 4 kcal/g, carbs 4, fat 9.
 */

import { FAT_CALORIE_SHARE, FIBER_G_PER_1000_KCAL, MACRO_KCAL_PER_G, PROTEIN_G_PER_KG } from '@/config/nutrition'
import type { WeightGoal } from '@/types/profile'
import type { MacroTargets } from '@/types/nutrition'

export function calculateMacroTargets(targetKcal: number, weightKg: number, goal: WeightGoal): MacroTargets {
  const protein = Math.round(PROTEIN_G_PER_KG[goal] * weightKg)
  const proteinKcal = protein * MACRO_KCAL_PER_G.protein

  const fatKcal = Math.round(targetKcal * FAT_CALORIE_SHARE)
  const fat = Math.round(fatKcal / MACRO_KCAL_PER_G.fat)

  const carbsKcal = Math.max(targetKcal - proteinKcal - fatKcal, 0)
  const carbs = Math.round(carbsKcal / MACRO_KCAL_PER_G.carbs)

  const fiber = Math.round((targetKcal / 1000) * FIBER_G_PER_1000_KCAL)

  const denom = Math.max(proteinKcal + carbsKcal + fatKcal, 1)

  return {
    kcal: targetKcal,
    protein,
    carbs,
    fat,
    fiber,
    proteinKcal,
    carbsKcal,
    fatKcal,
    proteinShare: proteinKcal / denom,
    carbsShare: carbsKcal / denom,
    fatShare: fatKcal / denom,
  }
}
