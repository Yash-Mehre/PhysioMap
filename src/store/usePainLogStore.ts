/** Pain Log store — persisted. Severity history powers the avatar heat map. */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { registerStoreReset } from '@/lib/storage/resetAll'
import { zustandJSONStorage } from '@/lib/storage/storage'
import type { PainLogEntry, PainUrgency, RegionId, Sensation } from '@/types'

interface PainLogState {
  entries: PainLogEntry[]
  addEntry: (entry: {
    regionId: RegionId
    severity: number
    sensations: Sensation[]
    urgency: PainUrgency | null
  }) => void
  removeEntry: (id: string) => void
  clearAll: () => void
}

function createEntryId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}

export const usePainLogStore = create<PainLogState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              id: createEntryId(),
              date: new Date().toISOString(),
              regionId: entry.regionId,
              severity: entry.severity,
              sensations: entry.sensations,
              urgency: entry.urgency,
            },
            ...state.entries,
          ],
        })),
      removeEntry: (id) => set((state) => ({ entries: state.entries.filter((item) => item.id !== id) })),
      clearAll: () => set({ entries: [] }),
    }),
    { name: STORAGE_KEYS.painLog, version: 1, storage: zustandJSONStorage },
  ),
)

/** Log out clears the pain log too (registered store reset). */
registerStoreReset(() => usePainLogStore.getState().clearAll())
