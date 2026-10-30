/**
 * Meal plan store — persisted. Holds the active plan; servings edits and
 * custom (Open Food Facts) items mutate the plan through pure helpers.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { zustandJSONStorage } from '@/lib/storage/storage'
import { scalePlannedItem } from '@/lib/nutrition/mealPlanner'
import type { MealPlan, MealSlotId, PlannedFoodItem } from '@/types/nutrition'

interface MealPlanState {
  plan: MealPlan | null
  setPlan: (plan: MealPlan) => void
  updateItemServings: (dayIndex: number, slotId: MealSlotId, foodId: string, servings: number) => void
  addCustomItem: (dayIndex: number, slotId: MealSlotId, item: PlannedFoodItem) => void
  removeItem: (dayIndex: number, slotId: MealSlotId, foodId: string) => void
  clearPlan: () => void
}

/** Recompute slot/day totals after item-level mutations. */
function recomputePlan(plan: MealPlan, dayIndex: number, slotId: MealSlotId): MealPlan {
  const day = plan.days[dayIndex]
  if (!day) return plan
  const slots = day.slots.map((slot) => {
    if (slot.slotId !== slotId) return slot
    const totals = slot.items.reduce(
      (sum, item) => ({
        kcal: sum.kcal + item.totals.kcal,
        protein: sum.protein + item.totals.protein,
        carbs: sum.carbs + item.totals.carbs,
        fat: sum.fat + item.totals.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    )
    return { ...slot, totals }
  })
  const dayTotals = slots.reduce(
    (sum, slot) => ({
      kcal: sum.kcal + slot.totals.kcal,
      protein: sum.protein + slot.totals.protein,
      carbs: sum.carbs + slot.totals.carbs,
      fat: sum.fat + slot.totals.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
  const days = plan.days.map((d) => (d.index === dayIndex ? { ...d, slots, totals: dayTotals } : d))
  return { ...plan, days }
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set) => ({
      plan: null,

      setPlan: (plan) => set({ plan }),

      updateItemServings: (dayIndex, slotId, foodId, servings) =>
        set((state) => {
          if (!state.plan) return state
          const day = state.plan.days[dayIndex]
          const slot = day?.slots.find((s) => s.slotId === slotId)
          if (!day || !slot) return state
          const items = slot.items.map((item) =>
            item.foodId === foodId ? scalePlannedItem(item, servings) : item,
          )
          const updated = {
            ...state.plan,
            days: state.plan.days.map((d) =>
              d.index === dayIndex
                ? { ...d, slots: d.slots.map((s) => (s.slotId === slotId ? { ...s, items } : s)) }
                : d,
            ),
          }
          return { plan: recomputePlan(updated, dayIndex, slotId) }
        }),

      addCustomItem: (dayIndex, slotId, item) =>
        set((state) => {
          if (!state.plan) return state
          const day = state.plan.days[dayIndex]
          const slot = day?.slots.find((s) => s.slotId === slotId)
          if (!day || !slot) return state
          if (slot.items.some((existing) => existing.foodId === item.foodId)) return state
          const items = [...slot.items, item]
          const updated = {
            ...state.plan,
            days: state.plan.days.map((d) =>
              d.index === dayIndex
                ? { ...d, slots: d.slots.map((s) => (s.slotId === slotId ? { ...s, items } : s)) }
                : d,
            ),
          }
          return { plan: recomputePlan(updated, dayIndex, slotId) }
        }),

      removeItem: (dayIndex, slotId, foodId) =>
        set((state) => {
          if (!state.plan) return state
          const day = state.plan.days[dayIndex]
          const slot = day?.slots.find((s) => s.slotId === slotId)
          if (!day || !slot) return state
          const items = slot.items.filter((item) => item.foodId !== foodId)
          const updated = {
            ...state.plan,
            days: state.plan.days.map((d) =>
              d.index === dayIndex
                ? { ...d, slots: d.slots.map((s) => (s.slotId === slotId ? { ...s, items } : s)) }
                : d,
            ),
          }
          return { plan: recomputePlan(updated, dayIndex, slotId) }
        }),

      clearPlan: () => set({ plan: null }),
    }),
    { name: STORAGE_KEYS.mealPlan, version: 1, storage: zustandJSONStorage },
  ),
)
