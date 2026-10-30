/**
 * Global keyboard shortcuts for the explorer:
 * 1 / 2 / 3 → Build / Pain / Info, Escape → deselect. Ignored while typing.
 */

import { useEffect } from 'react'
import { MODES } from '@/config/theme'
import { useExplorerStore } from '@/store/useExplorerStore'
import type { AppMode } from '@/types'

const MODE_BY_KEY: Record<string, AppMode> = {
  '1': MODES[0].id,
  '2': MODES[1].id,
  '3': MODES[2].id,
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      const { setMode, selectRegion, selectedRegionId } = useExplorerStore.getState()
      const nextMode = MODE_BY_KEY[event.key]
      if (nextMode) {
        setMode(nextMode)
        return
      }
      if (event.key === 'Escape' && selectedRegionId !== null) {
        selectRegion(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
