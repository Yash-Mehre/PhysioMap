import { describe, expect, it } from 'vitest'
import { calculateBmi, calculateBmiResult, calculateHealthyWeightRange, getBmiBand } from '@/lib/health/bmi'

describe('calculateBmi', () => {
  it('computes kg / m² rounded to one decimal', () => {
    expect(calculateBmi(70, 175)).toBe(22.9)
    expect(calculateBmi(100, 175)).toBe(32.7)
    expect(calculateBmi(50, 160)).toBe(19.5)
  })
})

describe('getBmiBand (WHO cut-offs)', () => {
  it('classifies the four WHO bands', () => {
    expect(getBmiBand(17).key).toBe('underweight')
    expect(getBmiBand(18.5).key).toBe('normal')
    expect(getBmiBand(24.9).key).toBe('normal')
    expect(getBmiBand(25).key).toBe('overweight')
    expect(getBmiBand(29.9).key).toBe('overweight')
    expect(getBmiBand(30).key).toBe('obese')
  })

  it('classifies with tighter Asia-Pacific cut-offs', () => {
    expect(getBmiBand(22.9, 'asia-pacific').key).toBe('normal')
    expect(getBmiBand(23, 'asia-pacific').key).toBe('overweight')
    expect(getBmiBand(24.9, 'asia-pacific').key).toBe('overweight')
    expect(getBmiBand(25, 'asia-pacific').key).toBe('obese')
  })
})

describe('calculateHealthyWeightRange', () => {
  it('derives the range from the normal band and height', () => {
    // 175 cm → WHO normal band 18.5–25 × 1.75² = 56.7–76.6 kg
    const who = calculateHealthyWeightRange(175)
    expect(who.minKg).toBe(57)
    expect(who.maxKg).toBe(77)
    // Asia-Pacific normal band tops out at BMI 23 → 70.4 kg
    const asia = calculateHealthyWeightRange(175, 'asia-pacific')
    expect(asia.minKg).toBe(57)
    expect(asia.maxKg).toBe(70)
  })
})

describe('calculateBmiResult', () => {
  it('bundles value, category and healthy range', () => {
    const result = calculateBmiResult(70, 175)
    expect(result.value).toBe(22.9)
    expect(result.categoryKey).toBe('normal')
    expect(result.categoryLabel).toBe('Normal weight')
    expect(result.healthyMinKg).toBeLessThanOrEqual(70)
    expect(result.healthyMaxKg).toBeGreaterThanOrEqual(70)
  })
})
