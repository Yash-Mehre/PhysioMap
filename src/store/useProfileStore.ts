/** User profile & preferences store — persisted, with migrations so saved
 * profiles from earlier versions keep working. Onboarding state (`onboarded`)
 * gates the app behind the /welcome wizard. */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { completedProfileSchema } from '@/lib/validation/profileSchemas'
import { registerStoreReset } from '@/lib/storage/resetAll'
import { zustandJSONStorage } from '@/lib/storage/storage'
import { DEFAULT_PROFILE } from '@/types/profile'
import type { UserProfile } from '@/types/profile'

interface ProfileState {
  profile: UserProfile
  setProfile: (patch: Partial<UserProfile>) => void
  /** Validate + persist the onboarding result; returns false when invalid. */
  completeOnboarding: (profile: UserProfile) => boolean
  /** Clear the profile (log out) — the user must onboard again. */
  logout: () => void
}

/** v≤2 → v3: fill the medical-history fields and the onboarding flag added in
 * this version. A profile saved before the update with all four core numbers
 * present counts as already onboarded. */
function migrateProfile(persisted: unknown): Pick<ProfileState, 'profile'> {
  const state = (persisted ?? {}) as { profile?: Partial<UserProfile> }
  const profile = state.profile ?? {}
  const hasCoreNumbers =
    profile.age !== undefined &&
    profile.sex !== undefined &&
    profile.heightCm !== undefined &&
    profile.weightKg !== undefined
  return {
    profile: {
      ...DEFAULT_PROFILE,
      ...profile,
      medicalConditions: profile.medicalConditions ?? [],
      otherConditions: profile.otherConditions ?? [],
      onboarded: profile.onboarded ?? hasCoreNumbers,
      onboardedAt: profile.onboardedAt,
    },
  }
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      completeOnboarding: (profile) => {
        if (!completedProfileSchema.safeParse(profile).success) return false
        set({
          profile: { ...profile, onboarded: true, onboardedAt: new Date().toISOString() },
        })
        return true
      },
      logout: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: STORAGE_KEYS.profile,
      version: 3,
      storage: zustandJSONStorage,
      migrate: (persisted) => migrateProfile(persisted) as ProfileState,
    },
  ),
)

/** Log out clears the persisted profile too (registered store reset). */
registerStoreReset(() => useProfileStore.getState().logout())
