/**
 * Region content data hooks (TanStack Query). Caches per region and prefetches
 * every region on idle so switching regions/modes feels instant.
 */

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { REGION_IDS } from '@/config/regions'
import { regionService } from '@/services/regionService'
import type { RegionContent, RegionId } from '@/types'

const STALE_TIME_MS = 30 * 60 * 1000

/** Light region list (labels/groups) for the Region List and quiz. */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getRegions(),
    staleTime: STALE_TIME_MS,
  })
}

/** Full content bundle for one region. */
export function useRegionContent(regionId: RegionId | null) {
  return useQuery({
    queryKey: ['region-content', regionId],
    queryFn: () => regionService.getRegionContent(regionId as RegionId),
    enabled: regionId !== null,
    staleTime: STALE_TIME_MS,
  })
}

/** Prefetch all 19 region contents once the browser is idle. */
export function usePrefetchRegions(): void {
  const queryClient = useQueryClient()
  useEffect(() => {
    const idleCallback = (): void => {
      for (const regionId of REGION_IDS) {
        void queryClient.prefetchQuery({
          queryKey: ['region-content', regionId],
          queryFn: () => regionService.getRegionContent(regionId),
          staleTime: STALE_TIME_MS,
        })
      }
    }
    if (typeof window === 'undefined') return
    const supportsIdle = typeof window.requestIdleCallback === 'function'
    const runner = supportsIdle
      ? window.requestIdleCallback(idleCallback)
      : window.setTimeout(idleCallback, 1500)
    return () => {
      if (supportsIdle) window.cancelIdleCallback(runner)
      else window.clearTimeout(runner)
    }
  }, [queryClient])
}

export type { RegionContent }
