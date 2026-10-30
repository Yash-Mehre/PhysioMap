/** Option arrays for the profile dialog selects. */

import type { Equipment, Level, TrainingGoal } from '@/types'

export const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const satisfies readonly Level[]

export const EQUIPMENT_OPTIONS = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'machine',
  'cable',
  'bands',
] as const satisfies readonly Equipment[]

export const TRAINING_GOAL_OPTIONS = [
  'hypertrophy',
  'strength',
  'endurance',
] as const satisfies readonly TrainingGoal[]
