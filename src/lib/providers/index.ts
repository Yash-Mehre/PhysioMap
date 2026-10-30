/**
 * Active data providers. Local curated datasets are ALWAYS active; the
 * optional external adapters (wger, Open Food Facts) are controlled by env
 * flags and default to OFF. Swap or decorate providers here without touching
 * API routes, services or UI.
 */

import type { ProviderStatus } from '@/types/nutrition'
import { localProvider } from '@/lib/providers/localProvider'
import { localNutritionProvider } from '@/lib/providers/localNutritionProvider'
import { isWgerEnabled } from '@/lib/providers/wgerProvider'
import { isOpenFoodFactsEnabled } from '@/lib/providers/openFoodFactsProvider'
import type { ExerciseDataProvider, NutritionDataProvider } from '@/lib/providers/types'

export const dataProvider: ExerciseDataProvider = localProvider
export const nutritionDataProvider: NutritionDataProvider = localNutritionProvider

/** Honest live status of every provider (used by /api/health-data/status). */
export function getProviderStatuses(): ProviderStatus[] {
  return [
    {
      id: 'local',
      label: 'Curated local dataset',
      description: '40 India-friendly foods, 19 body regions, exercises and guides — bundled with the app and always active.',
      enabled: true,
    },
    {
      id: 'wger',
      label: 'wger exercise API',
      description: 'Optional live adapter that attaches exercise thumbnails from wger.de in Build mode.',
      enabled: isWgerEnabled(),
    },
    {
      id: 'open-food-facts',
      label: 'Open Food Facts',
      description: 'Optional live adapter powering the “Search a food” dialog with per-100 g nutrition data.',
      enabled: isOpenFoodFactsEnabled(),
    },
  ]
}
