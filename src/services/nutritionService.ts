/** Typed fetch clients for the nutrition & health-data APIs. */

import type {
  FoodSearchResponse,
  HealthDataStatus,
  MealPlan,
  NutritionSummary,
} from '@/types/nutrition'
import type { MealPlanRequest } from '@/lib/nutrition/mealPlanner'
import type { HealthProfileInput } from '@/types/nutrition'
import { ApiError } from '@/services/regionService'

async function parseErrorResponse(response: Response, fallbackMessage: string): Promise<ApiError> {
  let code = `http-${response.status}`
  let message = fallbackMessage
  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string } }
    if (body.error) {
      code = body.error.code ?? code
      message = body.error.message ?? message
    }
  } catch {
    /* non-JSON error body — keep defaults */
  }
  return new ApiError(code, message, response.status)
}

export const nutritionService = {
  /** Run the calculators server-side (shares the same lib as the client). */
  calculate(input: HealthProfileInput): Promise<NutritionSummary> {
    return fetch('/api/nutrition/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then(async (response) => {
      if (response.ok) return (await response.json()) as NutritionSummary
      throw await parseErrorResponse(response, 'Calculation failed.')
    })
  },

  /** Generate a deterministic meal plan. */
  generateMealPlan(request: MealPlanRequest): Promise<MealPlan> {
    return fetch('/api/nutrition/meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }).then(async (response) => {
      if (response.ok) return (await response.json()) as MealPlan
      throw await parseErrorResponse(response, 'Meal plan generation failed.')
    })
  },

  /** Optional Open Food Facts live search (empty when the flag is off). */
  searchFoods(query: string): Promise<FoodSearchResponse> {
    return fetch(`/api/nutrition/food-search?q=${encodeURIComponent(query)}`).then(
      async (response) => {
        if (response.ok) return (await response.json()) as FoodSearchResponse
        throw await parseErrorResponse(response, 'Food search failed.')
      },
    )
  },
}

export const healthDataService = {
  /** Which data providers are active (local is always true). */
  getStatus(): Promise<HealthDataStatus> {
    return fetch('/api/health-data/status').then(async (response) => {
      if (response.ok) return (await response.json()) as HealthDataStatus
      throw await parseErrorResponse(response, 'Could not load provider status.')
    })
  },

  /** Optional wger exercise thumbnail by name (null when unavailable/off). */
  getExerciseImage(name: string): Promise<string | null> {
    return fetch(`/api/health-data/exercise-image?name=${encodeURIComponent(name)}`).then(
      async (response) => {
        if (response.ok) {
          const body = (await response.json()) as { imageUrl: string | null }
          return body.imageUrl
        }
        return null
      },
    )
  },
}
