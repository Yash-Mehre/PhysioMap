/**
 * Optional Open Food Facts search adapter (https://world.openfoodfacts.org/).
 * Powers the "Search a food" dialog in the Meal Planner with per-100 g
 * nutriments. OFF by default — enable with `ENABLE_OPEN_FOOD_FACTS=true`.
 * Any failure silently returns an empty result list; the curated local
 * dataset keeps the demo fully functional offline.
 */

import { z } from 'zod'
import type { FoodSearchAdapter } from '@/lib/providers/types'
import type { FoodSearchResult } from '@/types/nutrition'

const REQUEST_TIMEOUT_MS = 4000
const PAGE_SIZE = 10
const CACHE_LIMIT = 40

const productSchema = z.object({
  code: z.string().optional(),
  product_name: z.string().min(2),
  brands: z.string().nullish(),
  image_small_url: z.url().nullish(),
  image_url: z.url().nullish(),
  ingredients_text: z.string().nullish(),
  nutrition_grades: z.string().nullish(),
  nutriments: z
    .object({
      'energy-kcal_100g': z.coerce.number().positive(),
      proteins_100g: z.coerce.number().nonnegative().nullish(),
      carbohydrates_100g: z.coerce.number().nonnegative().nullish(),
      fat_100g: z.coerce.number().nonnegative().nullish(),
    })
    .nullish(),
})

const searchResponseSchema = z.object({
  products: z.array(productSchema).max(PAGE_SIZE),
})

export function isOpenFoodFactsEnabled(): boolean {
  return process.env.ENABLE_OPEN_FOOD_FACTS === 'true'
}

const searchCache = new Map<string, FoodSearchResult[]>()

/** Search Open Food Facts; returns [] when disabled or on any failure. */
export async function searchOpenFoodFacts(query: string): Promise<FoodSearchResult[]> {
  const trimmed = query.trim()
  if (!isOpenFoodFactsEnabled() || trimmed.length < 2) return []
  if (searchCache.has(trimmed)) return searchCache.get(trimmed) ?? []

  let results: FoodSearchResult[] = []
  try {
    const params = new URLSearchParams({
      search_terms: trimmed,
      page_size: String(PAGE_SIZE),
      fields: 'code,product_name,brands,image_small_url,image_url,ingredients_text,nutrition_grades,nutriments',
    })
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    })
    if (response.ok) {
      const parsed = searchResponseSchema.safeParse(await response.json())
      if (parsed.success) {
        results = parsed.data.products
          .map((product) => ({
            id: `off:${product.code ?? product.product_name}`,
            name: product.product_name,
            brand: product.brands?.split(',')[0]?.trim() ?? '',
            kcalPer100g: Math.round(product.nutriments?.['energy-kcal_100g'] ?? 0),
            proteinPer100g: product.nutriments?.proteins_100g ?? 0,
            carbsPer100g: product.nutriments?.carbohydrates_100g ?? 0,
            fatPer100g: product.nutriments?.fat_100g ?? 0,
            imageUrl: product.image_url ?? product.image_small_url ?? undefined,
            ingredients: product.ingredients_text ?? undefined,
            nutritionGrade: product.nutrition_grades ?? undefined,
          }))
          .filter((item) => item.kcalPer100g > 0)
      }
    }
  } catch {
    /* offline, timeout or invalid payload — return what we have ([]) */
  }

  if (searchCache.size >= CACHE_LIMIT) {
    const oldest = searchCache.keys().next().value
    if (oldest !== undefined) searchCache.delete(oldest)
  }
  searchCache.set(trimmed, results)
  return results
}

export const openFoodFactsAdapter: FoodSearchAdapter = {
  searchFoods: searchOpenFoodFacts,
}
