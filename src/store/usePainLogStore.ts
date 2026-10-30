/** Pain Log store — persisted. Severity history powers the avatar heat map. */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { zustandJSONStorage } from '@/lib/storage/storage'
import type {
  Aggravator,
  PainAssessmentResult,
  PainDuration,
  PainLogEntry,
  PainOnset,
  PainUrgency,
  RedFlagKey,
  RegionId,
  Sensation,
} from '@/types'

interface PainLogState {
  entries: PainLogEntry[]
  addEntry: (entry: {
    regionId: RegionId
    severity: number
    sensations: Sensation[]
    urgency: PainUrgency | null
    onset: PainOnset
    duration: PainDuration
    aggravators: Aggravator[]
    redFlags: RedFlagKey[]
    result: PainAssessmentResult
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
              onset: entry.onset,
              duration: entry.duration,
              aggravators: entry.aggravators,
              redFlags: entry.redFlags,
              result: entry.result,
            },
            ...state.entries,
          ],
        })),
      removeEntry: (id) => set((state) => ({ entries: state.entries.filter((item) => item.id !== id) })),
      clearAll: () => set({ entries: [] }),
    }),
    {
      name: STORAGE_KEYS.painLog,
      version: 2,
      storage: zustandJSONStorage,
      migrate: (persistedState) => {
        const state = persistedState as PainLogState
        return {
          ...state,
          entries: state.entries.map((entry) => ({
            ...entry,
            onset: entry.onset ?? 'gradual',
            duration: entry.duration ?? 'under-1-week',
            aggravators: entry.aggravators ?? [],
            redFlags: entry.redFlags ?? [],
          })),
        }
      },
    },
  ),
)
