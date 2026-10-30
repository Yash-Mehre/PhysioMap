/**
 * Region data barrel: merges the four group files into one lookup keyed by
 * region id. 19 regions total — the provider serves from here.
 */

import type { RegionId } from '@/config/regions'
import type { RegionContent } from '@/types'
import { headNeckRegions } from '@/data/regions/headNeck'
import { upperBodyRegions } from '@/data/regions/upperBody'
import { coreRegions } from '@/data/regions/core'
import { lowerBodyRegions } from '@/data/regions/lowerBody'

export const ALL_REGION_CONTENTS: readonly RegionContent[] = [
  ...headNeckRegions,
  ...upperBodyRegions,
  ...coreRegions,
  ...lowerBodyRegions,
]

export const regionContentById: Record<RegionId, RegionContent> = Object.fromEntries(
  ALL_REGION_CONTENTS.map((content) => [content.region.id, content]),
) as Record<RegionId, RegionContent>
