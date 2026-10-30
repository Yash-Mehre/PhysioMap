/**
 * BMI calculation and classification (pure). BMI = kg / m². Two cut-off sets
 * are supported: WHO international and Asia-Pacific. BMI is a screening tool,
 * not a diagnosis — the UI carries that note.
 */

import { BMI_BANDS } from '@/config/nutrition'
import type { BmiBand, BmiCutoffs, BmiResult } from '@/types/nutrition'

/** Compute BMI (kg/m²), rounded to one decimal. */
export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

/** Resolve the band a BMI value falls into under the chosen cut-offs. */
export function getBmiBand(value: number, cutoffs: BmiCutoffs = 'who'): BmiBand {
  const bands = BMI_BANDS[cutoffs]
  return bands.find((band) => value >= band.min && value < band.max) ?? bands[bands.length - 1]
}

/** Healthy weight range (kg) for a height under the chosen cut-offs' normal band. */
export function calculateHealthyWeightRange(
  heightCm: number,
  cutoffs: BmiCutoffs = 'who',
): { minKg: number; maxKg: number } {
  const heightM = heightCm / 100
  const normal = BMI_BANDS[cutoffs].find((band) => band.key === 'normal') ?? BMI_BANDS[cutoffs][1]
  const maxKg = normal.max === Number.POSITIVE_INFINITY ? 24.9 : normal.max
  return {
    minKg: Math.round(normal.min * heightM * heightM),
    maxKg: Math.round(maxKg * heightM * heightM),
  }
}

/** Full BMI result: value, category and the healthy weight range. */
export function calculateBmiResult(
  weightKg: number,
  heightCm: number,
  cutoffs: BmiCutoffs = 'who',
): BmiResult {
  const value = calculateBmi(weightKg, heightCm)
  const band = getBmiBand(value, cutoffs)
  const range = calculateHealthyWeightRange(heightCm, cutoffs)
  return {
    value,
    categoryKey: band.key,
    categoryLabel: band.label,
    healthyMinKg: range.minKg,
    healthyMaxKg: range.maxKg,
  }
}
