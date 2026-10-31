/**
 * URL sync for /explore: `?mode=pain&region=knees` is shareable and restores
 * state. Uses history.replaceState (no navigation churn) and follows
 * browser back/forward via popstate.
 */

import { useEffect, useRef } from 'react'
import { isRegionId } from '@/config/regions'
import { useExplorerStore } from '@/store/useExplorerStore'
import type { AppMode, RegionId } from '@/types'

const APP_MODES: readonly AppMode[] = ['build', 'pain', 'info']

function isAppMode(value: string | null): value is AppMode {
  return value !== null && (APP_MODES as readonly string[]).includes(value)
}

function readUrlState(): { mode: AppMode | null; regionId: RegionId | null } {
  if (typeof window === 'undefined') return { mode: null, regionId: null }
  const params = new URLSearchParams(window.location.search)
  const modeParam = params.get('mode')
  const regionParam = params.get('region')
  return {
    mode: isAppMode(modeParam) ? modeParam : null,
    regionId: isRegionId(regionParam) ? regionParam : null,
  }
}

function writeUrlState(mode: AppMode, regionId: RegionId | null): void {
  const params = new URLSearchParams()
  if (mode !== 'build') params.set('mode', mode)
  if (regionId) params.set('region', regionId)
  const query = params.toString()
  const url = `${window.location.pathname}${query ? `?${query}` : ''}`
  window.history.replaceState(null, '', url)
}

/** Wires explorer store state to the URL. Mount once on the explore page. */
export function useUrlSync(): void {
  const mode = useExplorerStore((state) => state.mode)
  const selectedRegionId = useExplorerStore((state) => state.selectedRegionId)
  const setMode = useExplorerStore((state) => state.setMode)
  const selectRegion = useExplorerStore((state) => state.selectRegion)
  const suppressNextWrite = useRef(true)

  // 1. Restore state from the URL on mount.
  useEffect(() => {
    const { mode: urlMode, regionId } = readUrlState()
    if (urlMode) setMode(urlMode)
    if (regionId) selectRegion(regionId)
  }, [setMode, selectRegion])

  // 2. Write store changes back to the URL (skip the restore-driven update).
  useEffect(() => {
    if (suppressNextWrite.current) {
      suppressNextWrite.current = false
      return
    }
    writeUrlState(mode, selectedRegionId)
  }, [mode, selectedRegionId])

  // 3. Follow browser back/forward.
  useEffect(() => {
    const onPopState = (): void => {
      const { mode: urlMode, regionId } = readUrlState()
      suppressNextWrite.current = true
      if (urlMode) setMode(urlMode)
      if (regionId) selectRegion(regionId)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setMode, selectRegion])
}
