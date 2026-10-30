/** Anatomy education content for a region (Info mode source data). */

import type { RegionId } from '@/config/regions'

export interface InjuryInfo {
  name: string
  cause: string
  prevention: string
}

export interface AnatomyInfo {
  anatomicalName: string
  location: string
  actions: string[]
  origin: string
  insertion: string
  innervation: string
  funFacts: string[]
  injuries: InjuryInfo[]
  preventionTips: string[]
  synergistIds: RegionId[]
  antagonistIds: RegionId[]
}
