/**
 * Region types. `RegionId`, `RegionGroup` and `BodySide` are derived from the
 * as-const arrays in `@/config/regions` (single source of truth) and re-exported
 * here so every consumer can import from `@/types`.
 */

import type { BodySide, Region, RegionGroup, RegionId } from '@/config/regions'
import type { BuildInfo } from '@/types/exercise'
import type { AnatomyInfo, InjuryInfo } from '@/types/anatomy'
import type { PainInfo } from '@/types/pain'

export type { BodySide, Region, RegionGroup, RegionId }

/** The three modes one avatar powers. */
export type AppMode = 'build' | 'pain' | 'info'

/** Complete content bundle for one region — the unit the API serves. */
export interface RegionContent {
  region: Region
  anatomy: AnatomyInfo
  build: BuildInfo
  pain: PainInfo
}

/** Re-exported for convenience. */
export type { AnatomyInfo, BuildInfo, InjuryInfo, PainInfo }
