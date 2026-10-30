/**
 * "My Workout" store — persisted. Items denormalise the exercise name/regions
 * at add time so the plan renders instantly without content lookups.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { zustandJSONStorage } from '@/lib/storage/storage'
import type { Exercise, RegionId, TrainingGoal } from '@/types'
import { getSetScheme } from '@/lib/build/setSchemes'

export interface WorkoutItem {
  exerciseId: string
  name: string
  regionId: RegionId
  secondaryRegionIds: RegionId[]
  sets: number
  reps: number
  completed: boolean
}

interface WorkoutState {
  items: WorkoutItem[]
  addItem: (exercise: Exercise, goal: TrainingGoal) => void
  removeItem: (exerciseId: string) => void
  updateItem: (exerciseId: string, patch: Partial<Pick<WorkoutItem, 'sets' | 'reps' | 'completed'>>) => void
  moveItem: (exerciseId: string, direction: -1 | 1) => void
  clearAll: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (exercise, goal) =>
        set((state) => {
          if (state.items.some((item) => item.exerciseId === exercise.id)) return state
          const scheme = getSetScheme(goal)
          const item: WorkoutItem = {
            exerciseId: exercise.id,
            name: exercise.name,
            regionId: exercise.regionId,
            secondaryRegionIds: exercise.secondaryRegionIds,
            sets: scheme.defaultSets,
            reps: scheme.defaultReps,
            completed: false,
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (exerciseId) =>
        set((state) => ({ items: state.items.filter((item) => item.exerciseId !== exerciseId) })),

      updateItem: (exerciseId, patch) =>
        set((state) => ({
          items: state.items.map((item) => (item.exerciseId === exerciseId ? { ...item, ...patch } : item)),
        })),

      moveItem: (exerciseId, direction) =>
        set((state) => {
          const index = state.items.findIndex((item) => item.exerciseId === exerciseId)
          const target = index + direction
          if (index < 0 || target < 0 || target >= state.items.length) return state
          const items = [...state.items]
          const [moved] = items.splice(index, 1)
          items.splice(target, 0, moved)
          return { items }
        }),

      clearAll: () => set({ items: [] }),
    }),
    { name: STORAGE_KEYS.workout, version: 1, storage: zustandJSONStorage },
  ),
)
