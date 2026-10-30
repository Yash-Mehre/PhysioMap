/** User profile & preferences (persisted). Message 2 builds the nutrition suite on top. */

import type { Equipment, Level, TrainingGoal } from '@/types/exercise'

export type Sex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'

export type WeightGoal = 'lose' | 'maintain' | 'gain'

export type PaceKgPerWeek = 0.25 | 0.5 | 0.75

export type DietTag = 'dairy' | 'gluten' | 'nuts' | 'egg' | 'soy' | 'fish'

export type DietPreference = 'veg' | 'eggetarian' | 'nonveg' | 'vegan'

export type UnitSystem = 'metric' | 'imperial'

export interface UserProfile {
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
}

export const DEFAULT_PROFILE: UserProfile = {
  excludedTags: [],
  dietPreference: 'veg',
  unitSystem: 'metric',
  trainingLevel: 'beginner',
  equipment: ['bodyweight'],
  trainingGoal: 'hypertrophy',
}
