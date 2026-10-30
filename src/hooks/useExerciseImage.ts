'use client'

/**
 * Optional wger exercise thumbnail lookup. Only fires when the wger adapter
 * is enabled (checked once via /api/health-data/status); results are cached
 * forever by TanStack Query so each exercise queries at most once per session.
 */

import { useQuery } from '@tanstack/react-query'
import { healthDataService } from '@/services/nutritionService'

/** Status of the optional health-data adapters (fetched once per session). */
export function useHealthDataStatus() {
  return useQuery({
    queryKey: ['health-data-status'],
    queryFn: () => healthDataService.getStatus(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

/** Resolve an optional exercise thumbnail; `undefined` until resolved, `null` when none. */
export function useExerciseImage(exerciseName: string): string | null | undefined {
  const status = useHealthDataStatus()
  const wgerEnabled = status.data?.providers.some((provider) => provider.id === 'wger' && provider.enabled) ?? false

  const image = useQuery({
    queryKey: ['exercise-image', exerciseName],
    queryFn: () => healthDataService.getExerciseImage(exerciseName),
    enabled: wgerEnabled,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 0,
  })

  if (!wgerEnabled) return null
  return image.data ?? undefined
}
