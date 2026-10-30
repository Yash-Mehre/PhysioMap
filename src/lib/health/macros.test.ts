import { describe, expect, it } from 'vitest'
import { calculateMacroTargets } from '@/lib/health/macros'

describe('calculateMacroTargets', () => {
  it('uses 1.6 g/kg protein for maintain with fat at 25 % and carbs as remainder', () => {
    // 70 kg maintain at 2625 kcal: protein 112 g (448), fat 73 g (656), carbs 380 g (1521), fiber 37 g
    const targets = calculateMacroTargets(2625, 70, 'maintain')
    expect(targets.protein).toBe(112)
    expect(targets.fat).toBe(73)
    expect(targets.carbs).toBe(380)
    expect(targets.fiber).toBe(37)
    expect(targets.proteinKcal).toBe(448)
    expect(targets.fatKcal).toBe(656)
    expect(targets.carbsKcal).toBe(1521)
  })

  it('raises protein to 2.0 g/kg when losing and 1.8 g/kg when gaining', () => {
    expect(calculateMacroTargets(2000, 80, 'lose').protein).toBe(160)
    expect(calculateMacroTargets(3000, 80, 'gain').protein).toBe(144)
  })

  it('computes energy shares that sum to ~1', () => {
    const targets = calculateMacroTargets(2625, 70, 'maintain')
    const total = targets.proteinShare + targets.carbsShare + targets.fatShare
    expect(total).toBeGreaterThan(0.98)
    expect(total).toBeLessThanOrEqual(1.01)
    expect(targets.fatShare).toBeCloseTo(0.25, 1)
  })

  it('never returns negative carbs when protein and fat crowd out the target', () => {
    const targets = calculateMacroTargets(1200, 120, 'lose')
    expect(targets.carbs).toBeGreaterThanOrEqual(0)
    expect(targets.carbsKcal).toBeGreaterThanOrEqual(0)
  })
})
