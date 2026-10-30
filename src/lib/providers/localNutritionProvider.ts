/** Local, in-memory implementation of the nutrition data provider. */

import { FOODS } from '@/data/foods'
import type { NutritionDataProvider } from '@/lib/providers/types'

export const localNutritionProvider: NutritionDataProvider = {
  getFoods() {
    return FOODS
  },
}
