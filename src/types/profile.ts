/** User profile & preferences (persisted). The nutrition suite and the
 * profile sheet build on top of this. */

import type { MedicalConditionId } from '@/config/medicalConditions'
import type { Equipment, Level, TrainingGoal } from '@/types/exercise'

export type { MedicalConditionId } from '@/config/medicalConditions'

export type Sex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'

export type WeightGoal = 'lose' | 'maintain' | 'gain'

export type PaceKgPerWeek = 0.25 | 0.5 | 0.75

export type DietTag = 'dairy' | 'gluten' | 'nuts' | 'egg' | 'soy' | 'fish'

export type DietPreference = 'veg' | 'eggetarian' | 'nonveg' | 'vegan'

export type UnitSystem = 'metric' | 'imperial'

export interface UserProfile {
  /** Required during onboarding; ≤ 40 chars, shown across the app. */
  name?: string
  age?: number
  sex?: Sex
  heightCm?: number
  weightKg?: number
  activityLevel?: ActivityLevel
  goal?: WeightGoal
  paceKgPerWeek?: PaceKgPerWeek
  excludedTags: DietTag[]
  dietPreference: DietPreference
  unitSystem: UnitSystem
  trainingLevel: Level
  equipment: Equipment[]
  trainingGoal: TrainingGoal
  /** User-selected medical conditions (informational only, never uploaded). */
  medicalConditions: MedicalConditionId[]
  /** Free-text "Other" conditions (≤ 10 items, each ≤ 40 chars, unique). */
  otherConditions: string[]
  /** True once the welcome onboarding wizard has been completed. */
  onboarded: boolean
  /** ISO date when onboarding was completed. */
  onboardedAt?: string
}

export const DEFAULT_PROFILE: UserProfile = {
  excludedTags: [],
  dietPreference: 'veg',
  unitSystem: 'metric',
  trainingLevel: 'beginner',
  equipment: ['bodyweight'],
  trainingGoal: 'hypertrophy',
  medicalConditions: [],
  otherConditions: [],
  onboarded: false,
}
