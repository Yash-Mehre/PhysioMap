/**
 * Exercise data provider contract. The app talks to providers through this
 * interface only — swap `localProvider` for an external adapter later without
 * touching API routes or UI.
 */

import type { Region, RegionContent } from '@/types'
import type { RegionId } from '@/config/regions'

export interface ExerciseDataProvider {
  getRegions(): readonly Region[]
  /** Full content bundle for one region, or `undefined` for unknown ids. */
  getRegionContent(id: RegionId): RegionContent | undefined
}
