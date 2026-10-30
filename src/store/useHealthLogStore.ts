'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { zustandJSONStorage } from '@/lib/storage/storage'
import type { RegionId } from '@/types'

export type HealthLogAction = 'relief' | 'desk' | 'remedy'

export interface HealthLogEntry {
  id: string
  createdAt: string
  action: HealthLogAction
  regionId: RegionId
  title: string
  details: string
}

interface HealthLogState {
  entries: HealthLogEntry[]
  addEntry: (entry: Omit<HealthLogEntry, 'id' | 'createdAt'>) => void
  removeEntry: (id: string) => void
  clearAll: () => void
}

function createId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `health-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

export const useHealthLogStore = create<HealthLogState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            { ...entry, id: createId(), createdAt: new Date().toISOString() },
            ...state.entries,
          ],
        })),
      removeEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      clearAll: () => set({ entries: [] }),
    }),
    { name: STORAGE_KEYS.healthLog, version: 1, storage: zustandJSONStorage },
  ),
)
