/**
 * Hydration store — persisted, entries keyed by local date (`YYYY-MM-DD`).
 * Pure math lives in `lib/health/hydration`; this store only mutates the log.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { toDateKey } from '@/lib/health/hydration'
import { registerStoreReset } from '@/lib/storage/resetAll'
import { zustandJSONStorage } from '@/lib/storage/storage'
import type { HydrationEntry, HydrationLog } from '@/types/nutrition'

interface HydrationState {
  log: HydrationLog
  addEntry: (amountMl: number) => void
  /** Remove the most recent entry logged today. */
  undoLast: () => void
  clearAll: () => void
}

function createEntryId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `water-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      log: {},

      addEntry: (amountMl) =>
        set((state) => {
          if (!Number.isFinite(amountMl) || amountMl <= 0) return state
          const dateKey = toDateKey(new Date())
          const entry: HydrationEntry = {
            id: createEntryId(),
            amountMl: Math.round(amountMl),
            timestamp: new Date().toISOString(),
          }
          return { log: { ...state.log, [dateKey]: [entry, ...(state.log[dateKey] ?? [])] } }
        }),

      undoLast: () =>
        set((state) => {
          const dateKey = toDateKey(new Date())
          const today = state.log[dateKey]
          if (!today || today.length === 0) return state
          const next = { ...state.log, [dateKey]: today.slice(1) }
          if (next[dateKey].length === 0) delete next[dateKey]
          return { log: next }
        }),

      clearAll: () => set({ log: {} }),
    }),
    { name: STORAGE_KEYS.hydration, version: 1, storage: zustandJSONStorage },
  ),
)

/** Log out clears the hydration history too (registered store reset). */
registerStoreReset(() => useHydrationStore.getState().clearAll())
