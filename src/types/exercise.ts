/** Training-related types: exercises, relief exercises, hypertrophy guides. */

import type { RegionId } from '@/config/regions'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type Equipment = 'bodyweight' | 'dumbbells' | 'barbell' | 'machine' | 'cable' | 'bands'

export type TrainingGoal = 'hypertrophy' | 'strength' | 'endurance'

export type ReliefKind = 'stretch' | 'mobility' | 'strengthen' | 'release'

export interface Exercise {
  id: string
  name: string
  regionId: RegionId
  secondaryRegionIds: RegionId[]
  level: Level
  equipment: Equipment
  steps: string[]
  cues: string[]
  commonMistakes: string[]
  biomechanics: string
}

export interface ReliefExercise {
  id: string
  name: string
  regionId: RegionId
  kind: ReliefKind
  steps: string[]
  sets: number
  holdSeconds?: number
  reps?: number
  cautions: string[]
}

export interface HypertrophyGuide {
  weeklySets: string
  repRange: string
  restSeconds: number
  frequencyPerWeek: string
  tempo: string
  progressionTip: string
}

export interface BuildInfo {
  exercises: Exercise[]
  hypertrophyGuide: HypertrophyGuide
  biomechanicsNotes: string[]
}
