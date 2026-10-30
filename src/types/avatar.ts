/**
 * Presentational contract between the explorer and the 3D avatar.
 * The avatar is "dumb": it only knows how to render region visual states.
 */

import type { RegionId } from '@/config/regions'

export interface RegionVisualState {
  /** Blend target for the muscle base color (0–55% mix). */
  tint?: string
  emissive: string
  emissiveIntensity: number
  opacity: number
  /** Slow emissive pulse (used for severe pain heat and quiz targets). */
  pulse?: boolean
  /** Render a scaled back-side shell outline around the region. */
  outline?: boolean
}

export interface AvatarCanvasProps {
  selectedRegionId: RegionId | null
  hoveredRegionId: RegionId | null
  regionStyles: Record<RegionId, RegionVisualState>
  labelsVisible: boolean
  /** Info-mode layer control: hide muscle detail, show neutral body only. */
  silhouette: boolean
  /** Disable pointer interactions (landing hero). */
  interactive?: boolean
  /** Slowly rotate the camera (landing hero). */
  autoRotate?: boolean
  onSelect: (regionId: RegionId | null) => void
  onHover: (regionId: RegionId | null) => void
}

/** Neutral state for every region (used by the landing hero). */
export function createNeutralRegionStyles(
  regionIds: readonly RegionId[],
): Record<RegionId, RegionVisualState> {
  const styles = {} as Record<RegionId, RegionVisualState>
  for (const id of regionIds) {
    styles[id] = { emissive: '#000000', emissiveIntensity: 0, opacity: 1 }
  }
  return styles
}
