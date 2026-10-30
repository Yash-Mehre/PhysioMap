'use client'

/** Floating label that follows the pointer while a region is hovered. */

import { REGION_BY_ID } from '@/config/regions'
import type { RegionId } from '@/types'

export interface RegionTooltipProps {
  regionId: RegionId
  /** Pointer position relative to the canvas container. */
  x: number
  y: number
}

export function RegionTooltip({ regionId, x, y }: RegionTooltipProps) {
  const label = REGION_BY_ID[regionId].label
  const clampedX = Math.max(8, x + 14)
  const clampedY = Math.max(8, y - 12)
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 rounded-lg border border-white/10 bg-surface-raised/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm"
      style={{ left: clampedX, top: clampedY }}
    >
      {label}
    </div>
  )
}
