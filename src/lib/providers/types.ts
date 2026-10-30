/**
 * Data provider contracts. The app talks to providers through these
 * interfaces only — the local curated datasets are always active, and
 * optional external adapters (wger, Open Food Facts) decorate or extend them
 * when enabled via env flags. Every adapter must fail soft: on ANY error it
 * silently falls back to local data.
 */

import type { Region, RegionContent } from '@/types'
import type { RegionId } from '@/config/regions'
import type { Food, FoodSearchResult, ProviderStatus } from '@/types/nutrition'

export interface ExerciseDataProvider {
  getRegions(): readonly Region[]
  /** Full content bundle for one region, or `undefined` for unknown ids. */
  getRegionContent(id: RegionId): RegionContent | undefined
}

export interface NutritionDataProvider {
  getFoods(): readonly Food[]
}

/** Live status of every provider (local is always enabled). */
export type ProviderStatusResolver = () => ProviderStatus[]

/** Optional external adapter contracts (implemented in `lib/providers/*Provider`). */
export interface ExerciseImageAdapter {
  /** Resolve a thumbnail URL by exercise name; `null` when unavailable. */
  getExerciseImage(exerciseName: string): Promise<string | null>
}

export interface FoodSearchAdapter {
  searchFoods(query: string): Promise<FoodSearchResult[]>
}
