/**
 * Unit conversion helpers. The app ALWAYS stores metric internally
 * (cm / kg); these helpers convert for display and form input only.
 */

import type { UnitSystem } from '@/types/profile'

const CM_PER_INCH = 2.54
const LB_PER_KG = 2.2046226218

/** Convert centimetres to a { feet, inches } split (inches 0–11). */
export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_INCH
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  if (inches === 12) return { feet: feet + 1, inches: 0 }
  return { feet, inches }
}

/** Convert a feet + inches pair to centimetres. */
export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH
}

/** Kilograms → pounds. */
export function kgToLb(kg: number): number {
  return kg * LB_PER_KG
}

/** Pounds → kilograms. */
export function lbToKg(lb: number): number {
  return lb / LB_PER_KG
}

/** Format a weight for display in the chosen unit system, e.g. "70 kg" / "154 lb". */
export function formatWeight(weightKg: number, system: UnitSystem): string {
  if (system === 'imperial') return `${Math.round(kgToLb(weightKg))} lb`
  return `${Math.round(weightKg)} kg`
}

/** Format a height for display, e.g. "175 cm" / `5'9"`. */
export function formatHeight(heightCm: number, system: UnitSystem): string {
  if (system === 'imperial') {
    const { feet, inches } = cmToFtIn(heightCm)
    return `${feet}′${inches}″`
  }
  return `${Math.round(heightCm)} cm`
}

/** Format millilitres compactly: "2,450 ml" or "2.5 L". */
export function formatMl(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000
    return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)} L`
  }
  return `${Math.round(ml)} ml`
}
