/**
 * Pure workout duration estimation.
 * Formula: total sets × (≈40 s work + goal rest) + 5 min warm-up.
 */

import { getSetScheme } from '@/lib/build/setSchemes'
import type { TrainingGoal } from '@/types'

const WORK_SECONDS_PER_SET = 40
const WARM_UP_SECONDS = 5 * 60

export interface WorkoutDurationInput {
  totalSets: number
  goal: TrainingGoal
}

/** Estimated workout duration in seconds. */
export function estimateWorkoutSeconds({ totalSets, goal }: WorkoutDurationInput): number {
  if (totalSets <= 0) return 0
  const restSeconds = getSetScheme(goal).restSeconds
  return Math.round(totalSets * (WORK_SECONDS_PER_SET + restSeconds) + WARM_UP_SECONDS)
}

/** Format seconds as a compact human duration, e.g. "23 min" or "1 h 05 min". */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 min'
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours} h` : `${hours} h ${String(remainder).padStart(2, '0')} min`
}
