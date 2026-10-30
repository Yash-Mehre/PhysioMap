import { describe, expect, it } from 'vitest'
import {
  calculateBmr,
  calculateCalorieTarget,
  calculateEnergyResults,
  calculateTdee,
  calculateTdeeByLevel,
} from '@/lib/health/energy'
import type { HealthProfileInput } from '@/types/nutrition'

describe('calculateBmr (Mifflin-St Jeor)', () => {
  it('matches the male formula 10w + 6.25h − 5a + 5', () => {
    // 700 + 1093.75 − 105 + 5 = 1693.75 → 1694
    expect(calculateBmr('male', 70, 175, 21)).toBe(1694)
  })

  it('matches the female formula 10w + 6.25h − 5a − 161', () => {
    // 600 + 1000 − 150 − 161 = 1289
    expect(calculateBmr('female', 60, 160, 30)).toBe(1289)
  })
})

describe('calculateTdee', () => {
  it('multiplies BMR by the activity factor', () => {
    expect(calculateTdee(1000, 'sedentary')).toBe(1200)
    expect(calculateTdee(1000, 'moderate')).toBe(1550)
    expect(calculateTdee(1000, 'athlete')).toBe(1900)
  })

  it('covers all five levels', () => {
    const levels = calculateTdeeByLevel(2000)
    expect(Object.keys(levels)).toHaveLength(5)
    expect(levels.moderate).toBe(3100)
  })
})

describe('calculateCalorieTarget', () => {
  it('keeps TDEE for maintain', () => {
    const result = calculateCalorieTarget(2600, 'maintain', 0.5, 'male')
    expect(result.targetKcal).toBe(2600)
    expect(result.calorieDelta).toBe(0)
    expect(result.floorApplied).toBe(false)
  })

  it('adds the full surplus for gain', () => {
    // 0.5 × 7700 / 7 = 550
    const result = calculateCalorieTarget(2600, 'gain', 0.5, 'male')
    expect(result.targetKcal).toBe(3150)
    expect(result.calorieDelta).toBe(550)
  })

  it('caps a lose deficit at 25 % of TDEE', () => {
    // 0.75 pace wants −825 but the cap is 650 → 1950
    const result = calculateCalorieTarget(2600, 'lose', 0.75, 'male')
    expect(result.targetKcal).toBe(1950)
    expect(result.calorieDelta).toBe(-650)
  })

  it('applies small deficits in full', () => {
    // 0.25 pace → −275 (below the 650 cap)
    const result = calculateCalorieTarget(2600, 'lose', 0.25, 'male')
    expect(result.targetKcal).toBe(2325)
    expect(result.calorieDelta).toBe(-275)
  })

  it('enforces the safety floor (1500 male / 1200 female)', () => {
    const male = calculateCalorieTarget(1600, 'lose', 0.75, 'male')
    expect(male.floorApplied).toBe(true)
    expect(male.targetKcal).toBe(1500)

    const female = calculateCalorieTarget(1300, 'lose', 0.5, 'female')
    expect(female.floorApplied).toBe(true)
    expect(female.targetKcal).toBe(1200)
  })
})

describe('calculateEnergyResults', () => {
  const profile: HealthProfileInput = {
    age: 21,
    sex: 'male',
    heightCm: 175,
    weightKg: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    paceKgPerWeek: 0.5,
  }

  it('matches the reference case (BMR ≈ 1694, TDEE ≈ 2625)', () => {
    const results = calculateEnergyResults(profile)
    expect(results.bmr).toBe(1694)
    expect(results.tdee).toBe(2625)
    expect(results.targetKcal).toBe(2625)
  })

  it('highlights the chosen level in the per-level table', () => {
    const results = calculateEnergyResults(profile)
    expect(results.tdeeByLevel[profile.activityLevel]).toBe(results.tdee)
  })
})
