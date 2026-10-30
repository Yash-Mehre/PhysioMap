/**
 * Pure set-scheme logic for Build mode. Hypertrophy 3–4 × 8–12,
 * strength 4–5 × 3–6, endurance 2–3 × 15–20 (per the product brief).
 */

import type { TrainingGoal } from '@/types'

export interface SetScheme {
  goal: TrainingGoal
  setsRange: string
  repsRange: string
  restSeconds: number
  /** Default plan values used when an exercise is added to "My Workout". */
  defaultSets: number
  defaultReps: number
}

export const SET_SCHEMES: Record<TrainingGoal, SetScheme> = {
  hypertrophy: {
    goal: 'hypertrophy',
    setsRange: '3–4',
    repsRange: '8–12',
    restSeconds: 90,
    defaultSets: 3,
    defaultReps: 10,
  },
  strength: {
    goal: 'strength',
    setsRange: '4–5',
    repsRange: '3–6',
    restSeconds: 180,
    defaultSets: 4,
    defaultReps: 5,
  },
  endurance: {
    goal: 'endurance',
    setsRange: '2–3',
    repsRange: '15–20',
    restSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
  },
}

/** Get the scheme for a training goal (defaults to hypertrophy). */
export function getSetScheme(goal: TrainingGoal): SetScheme {
  return SET_SCHEMES[goal] ?? SET_SCHEMES.hypertrophy
}
