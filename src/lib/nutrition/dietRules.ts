/**
 * Diet compatibility rules (pure). Diets are ranked from most restrictive to
 * least: vegan 0 < veg 1 < eggetarian 2 < non-veg 3. A food is allowed when
 * its own diet tier is ≤ the user's tier, and none of its tags intersect the
 * user's exclusions.
 */

import type { DietPreference, DietTag } from '@/types/profile'
import type { Food, FoodDiet } from '@/types/nutrition'

export const DIET_RANKS: Record<DietPreference, number> = {
  vegan: 0,
  veg: 1,
  eggetarian: 2,
  nonveg: 3,
}

export const FOOD_DIET_RANKS: Record<FoodDiet, number> = {
  vegan: 0,
  veg: 1,
  egg: 2,
  nonveg: 3,
}

/** True when the food passes both the diet tier and the exclusion tags. */
export function isFoodAllowed(
  food: Food,
  diet: DietPreference,
  exclusions: readonly DietTag[],
): boolean {
  if (FOOD_DIET_RANKS[food.diet] > DIET_RANKS[diet]) return false
  return !food.tags.some((tag) => exclusions.includes(tag))
}

/** Filter a food list down to what the user may eat. */
export function filterAllowedFoods(
  foods: readonly Food[],
  diet: DietPreference,
  exclusions: readonly DietTag[],
): Food[] {
  return foods.filter((food) => isFoodAllowed(food, diet, exclusions))
}
