import { describe, expect, it } from 'vitest'
import { cmToFtIn, ftInToCm, formatHeight, formatMl, formatWeight, kgToLb, lbToKg } from '@/lib/health/units'

describe('unit conversions', () => {
  it('converts cm to feet + inches', () => {
    expect(cmToFtIn(175)).toEqual({ feet: 5, inches: 9 })
    expect(cmToFtIn(152)).toEqual({ feet: 5, inches: 0 })
    expect(cmToFtIn(183)).toEqual({ feet: 6, inches: 0 })
  })

  it('round-trips cm ⇄ ft/in', () => {
    const cm = 178
    const { feet, inches } = cmToFtIn(cm)
    expect(Math.round(ftInToCm(feet, inches))).toBe(cm)
  })

  it('converts kg ⇄ lb', () => {
    expect(kgToLb(70)).toBeCloseTo(154.32, 1)
    expect(Math.round(lbToKg(154.32))).toBe(70)
  })

  it('formats weight and height per unit system', () => {
    expect(formatWeight(70, 'metric')).toBe('70 kg')
    expect(formatWeight(70, 'imperial')).toBe('154 lb')
    expect(formatHeight(175, 'metric')).toBe('175 cm')
    expect(formatHeight(175, 'imperial')).toBe('5′9″')
  })

  it('formats millilitres compactly', () => {
    expect(formatMl(750)).toBe('750 ml')
    expect(formatMl(2500)).toBe('2.5 L')
    expect(formatMl(3000)).toBe('3 L')
  })
})
