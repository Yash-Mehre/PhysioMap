/** User profile & preferences store — persisted. Message 2 builds on this. */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { zustandJSONStorage } from '@/lib/storage/storage'
import { DEFAULT_PROFILE } from '@/types/profile'
import type { UserProfile } from '@/types/profile'

interface ProfileState {
  profile: UserProfile
  setProfile: (patch: Partial<UserProfile>) => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      resetProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: STORAGE_KEYS.profile, version: 1, storage: zustandJSONStorage },
  ),
)
