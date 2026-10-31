import { describe, expect, it } from 'vitest'
import { FOODS, FOOD_BY_ID } from '@/data/foods'
import {
  generateMealPlan,
  isWithinTarget,
  regenerateMealSlot,
  scalePlannedItem,
  type MealPlanRequest,
} from '@/lib/nutrition/mealPlanner'
import type { NutritionTargets } from '@/types/nutrition'

const TARGETS: NutritionTargets = {
  kcal: 2625,
  protein: 112,
  carbs: 380,
  fat: 73,
  fiber: 37,
}

function request(overrides: Partial<MealPlanRequest> = {}): MealPlanRequest {
  return {
    targets: TARGETS,
    diet: 'veg',
    exclusions: [],
    mealsPerDay: 5,
    seed: 42,
    days: 1,
    ...overrides,
  }
}

describe('generateMealPlan', () => {
  it('fills every slot of every day with items', () => {
    for (const diet of ['vegan', 'veg', 'eggetarian', 'nonveg'] as const) {
      const plan = generateMealPlan(request({ diet, days: 2 }))
      expect(plan.days).toHaveLength(2)
      for (const day of plan.days) {
        expect(day.slots).toHaveLength(5)
        for (const slot of day.slots) {
          expect(slot.items.length).toBeGreaterThan(0)
          expect(slot.totals.kcal).toBeGreaterThan(0)
        }
        expect(day.totals.kcal).toBeGreaterThan(0)
      }
    }
  })

  it('respects diet rules: a vegan plan contains no dairy, egg or meat foods', () => {
    const plan = generateMealPlan(request({ diet: 'vegan', days: 3 }))
    for (const day of plan.days) {
      for (const slot of day.slots) {
        for (const item of slot.items) {
          const food = FOOD_BY_ID[item.foodId]
          expect(food).toBeDefined()
          expect(food!.diet).toBe('vegan')
        }
      }
    }
  })

  it('respects exclusions: excluded tags never appear', () => {
    const plan = generateMealPlan(request({ diet: 'nonveg', exclusions: ['dairy', 'nuts'], days: 2 }))
    for (const day of plan.days) {
      for (const slot of day.slots) {
        for (const item of slot.items) {
          const food = FOOD_BY_ID[item.foodId]
          expect(food!.tags).not.toContain('dairy')
          expect(food!.tags).not.toContain('nuts')
        }
      }
    }
  })

  it('uses only foods from the curated database with valid servings', () => {
    const plan = generateMealPlan(request({ days: 1 }))
    for (const day of plan.days) {
      for (const slot of day.slots) {
        for (const item of slot.items) {
          expect(FOODS.some((food) => food.id === item.foodId)).toBe(true)
          expect(item.servings).toBeGreaterThanOrEqual(0.5)
          expect(item.servings).toBeLessThanOrEqual(2.5)
          expect(item.servings % 0.5).toBe(0)
        }
      }
    }
  })

  it('is deterministic for a given seed', () => {
    const a = generateMealPlan(request({ seed: 7, days: 2 }))
    const b = generateMealPlan(request({ seed: 7, days: 2 }))
    expect(JSON.stringify(a.days)).toBe(JSON.stringify(b.days))

    const c = generateMealPlan(request({ seed: 8, days: 2 }))
    expect(JSON.stringify(a.days)).not.toBe(JSON.stringify(c.days))
  })

  it('lands day totals within a sane tolerance of the target', () => {
    for (const diet of ['vegan', 'veg', 'eggetarian', 'nonveg'] as const) {
      const plan = generateMealPlan(request({ diet, days: 3 }))
      for (const day of plan.days) {
        const kcalError = Math.abs(day.totals.kcal - TARGETS.kcal) / TARGETS.kcal
        expect(kcalError).toBeLessThan(0.35)
        // Slots aim at their own share of the daily target.
        const slotError = Math.abs(day.slots[0].totals.kcal - day.slots[0].targetKcal) / day.slots[0].targetKcal
        expect(slotError).toBeLessThan(0.5)
      }
    }
  })

  it('keeps protein within reach of the protein target', () => {
    const plan = generateMealPlan(request({ diet: 'nonveg', days: 1 }))
    const proteinError = Math.abs(plan.days[0].totals.protein - TARGETS.protein) / TARGETS.protein
    expect(proteinError).toBeLessThan(0.5)
  })

  it('avoids identical main items in the same slot on consecutive days', () => {
    const plan = generateMealPlan(request({ days: 7 }))
    expect(plan.days).toHaveLength(7)
    for (let dayIndex = 1; dayIndex < plan.days.length; dayIndex += 1) {
      const previous = plan.days[dayIndex - 1]
      const current = plan.days[dayIndex]
      for (const slot of current.slots) {
        const previousSlot = previous.slots.find((candidate) => candidate.slotId === slot.slotId)
        expect(previousSlot).toBeDefined()
        const previousMains = previousSlot!.items
          .filter((item) => {
            const food = FOOD_BY_ID[item.foodId]
            return food ? ['complete', 'staple', 'protein'].includes(food.role) : true
          })
          .map((item) => item.foodId)
        const currentMains = slot.items
          .filter((item) => {
            const food = FOOD_BY_ID[item.foodId]
            return food ? ['complete', 'staple', 'protein'].includes(food.role) : true
          })
          .map((item) => item.foodId)
        for (const main of currentMains) {
          expect(previousMains).not.toContain(main)
        }
      }
    }
  })
})

describe('regenerateMealSlot', () => {
  it('changes only the targeted slot and keeps the rest identical', () => {
    const plan = generateMealPlan(request({ seed: 100, days: 1 }))
    const swapped = regenerateMealSlot(plan, 0, 'lunch', 999)

    expect(swapped.days).toHaveLength(plan.days.length)
    const originalLunch = plan.days[0].slots.find((slot) => slot.slotId === 'lunch')
    const swappedLunch = swapped.days[0].slots.find((slot) => slot.slotId === 'lunch')
    expect(originalLunch).toBeDefined()
    expect(swappedLunch).toBeDefined()

    const originalIds = originalLunch!.items.map((item) => item.foodId).sort().join(',')
    const swappedIds = swappedLunch!.items.map((item) => item.foodId).sort().join(',')
    expect(swappedIds).not.toBe(originalIds)

    for (const slotId of ['breakfast', 'snack-1', 'snack-2', 'dinner'] as const) {
      const before = plan.days[0].slots.find((slot) => slot.slotId === slotId)
      const after = swapped.days[0].slots.find((slot) => slot.slotId === slotId)
      expect(JSON.stringify(after)).toBe(JSON.stringify(before))
    }
  })

  it('recomputes the day totals after the swap', () => {
    const plan = generateMealPlan(request({ seed: 100, days: 1 }))
    const swapped = regenerateMealSlot(plan, 0, 'dinner', 1234)
    const recomputed = swapped.days[0].slots.reduce((sum, slot) => sum + slot.totals.kcal, 0)
    expect(swapped.days[0].totals.kcal).toBeCloseTo(recomputed, 0)
  })
})

describe('scalePlannedItem', () => {
  it('recomputes totals from per-serving values', () => {
    const item = {
      foodId: 'roti',
      name: 'Roti',
      servingLabel: '1 medium',
      servings: 1,
      perServing: { kcal: 100, protein: 3, carbs: 18, fat: 2 },
      totals: { kcal: 100, protein: 3, carbs: 18, fat: 2 },
    }
    const scaled = scalePlannedItem(item, 2.5)
    expect(scaled.servings).toBe(2.5)
    expect(scaled.totals.kcal).toBe(250)
    expect(scaled.totals.protein).toBe(7.5)
    expect(scaled.totals.carbs).toBe(45)
  })
})

describe('isWithinTarget', () => {
  it('flags days within ±5 % of the calorie target', () => {
    const tight = generateMealPlan(request({ diet: 'nonveg', seed: 3 }))
    // Deterministic plans usually land within 5 %; assert the helper itself
    // against hand-built totals by trusting the generated day's own numbers.
    const within = Math.abs(tight.days[0].totals.kcal - TARGETS.kcal) / TARGETS.kcal <= 0.05
    expect(isWithinTarget(tight, 0)).toBe(within)
    expect(isWithinTarget(tight, 99)).toBe(false) // missing day
  })
})
