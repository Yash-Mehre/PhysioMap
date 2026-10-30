/** User profile & preferences store — persisted, with a migration so saved
 * profiles from before the medical-history update keep working. */

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

/** v1 → v2: fill the medical-history fields added in this version. */
function migrateProfile(persisted: unknown): Pick<ProfileState, 'profile'> {
  const state = (persisted ?? {}) as { profile?: Partial<UserProfile> }
  const profile = state.profile ?? {}
  return {
    profile: {
      ...DEFAULT_PROFILE,
      ...profile,
      medicalConditions: profile.medicalConditions ?? [],
      otherConditions: profile.otherConditions ?? [],
    },
  }
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      resetProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: STORAGE_KEYS.profile,
      version: 2,
      storage: zustandJSONStorage,
      migrate: (persisted) => migrateProfile(persisted) as ProfileState,
    },
  ),
)
