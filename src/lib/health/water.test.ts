import { describe, expect, it } from 'vitest'
import { calculateWaterTarget } from '@/lib/health/water'

describe('calculateWaterTarget', () => {
  it('adds 35 ml per kg plus the activity bonus', () => {
    expect(calculateWaterTarget(70, 'moderate')).toBe(2950) // 2450 + 500
    expect(calculateWaterTarget(70, 'sedentary')).toBe(2450)
    expect(calculateWaterTarget(70, 'athlete')).toBe(3450) // 2450 + 1000
  })

  it('clamps to the 1.5–5 L window', () => {
    expect(calculateWaterTarget(40, 'sedentary')).toBe(1500) // 1400 → floor
    expect(calculateWaterTarget(120, 'athlete')).toBe(5000) // 5200 → ceiling
  })

  it('rounds to the nearest 50 ml', () => {
    // 72 kg light: 2520 + 250 = 2770 → 2750
    expect(calculateWaterTarget(72, 'light')).toBe(2750)
  })
})
