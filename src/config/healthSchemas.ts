/**
 * Zod schemas for the Health & Nutrition Suite inputs. Shared by the
 * `/api/nutrition/*` routes and client-side inline validation so both stay in
 * lock-step. Mirrors the pattern of `config/painSchemas.ts`.
 */

import { z } from 'zod'
import { ACTIVITY_LEVEL_ORDER, MEAL_PLAN_MAX_DAYS, SERVING_MAX, SERVING_MIN } from '@/config/nutrition'

export const SEX_OPTIONS = ['male', 'female'] as const
export const GOAL_OPTIONS = ['lose', 'maintain', 'gain'] as const
export const PACE_OPTIONS = [0.25, 0.5, 0.75] as const
export const paceSchema = z.union([z.literal(0.25), z.literal(0.5), z.literal(0.75)])
export const DIET_OPTIONS = ['vegan', 'veg', 'eggetarian', 'nonveg'] as const
export const DIET_TAG_OPTIONS = ['dairy', 'gluten', 'nuts', 'egg', 'soy', 'fish'] as const
export const UNIT_SYSTEM_OPTIONS = ['metric', 'imperial'] as const
export const MEALS_PER_DAY_OPTIONS = [3, 4, 5] as const
export const mealsPerDaySchema = z.union([z.literal(3), z.literal(4), z.literal(5)])

const AGE_MESSAGE = 'Age must be between 10 and 100.'
const HEIGHT_MESSAGE = 'Height must be between 100 and 250 cm.'
const WEIGHT_MESSAGE = 'Weight must be between 25 and 300 kg.'

/** Nutrition-relevant profile fields (always stored metric internally). */
export const healthProfileSchema = z.object({
  age: z.number({ message: 'Enter your age.' }).int(AGE_MESSAGE).min(10, AGE_MESSAGE).max(100, AGE_MESSAGE),
  sex: z.enum(SEX_OPTIONS, { message: 'Select a sex.' }),
  heightCm: z
    .number({ message: 'Enter a height.' })
    .min(100, HEIGHT_MESSAGE)
    .max(250, HEIGHT_MESSAGE),
  weightKg: z
    .number({ message: 'Enter a weight.' })
    .min(25, WEIGHT_MESSAGE)
    .max(300, WEIGHT_MESSAGE),
  activityLevel: z.enum(ACTIVITY_LEVEL_ORDER, { message: 'Select an activity level.' }),
  goal: z.enum(GOAL_OPTIONS, { message: 'Select a goal.' }),
  paceKgPerWeek: paceSchema,
})

/** Full profile schema (training fields included) for the shared ProfileForm. */
export const fullProfileSchema = healthProfileSchema.extend({
  dietPreference: z.enum(DIET_OPTIONS, { message: 'Select a diet preference.' }),
  excludedTags: z.enum(DIET_TAG_OPTIONS).array(),
  unitSystem: z.enum(UNIT_SYSTEM_OPTIONS),
})

/** Daily targets payload for the meal planner. */
export const nutritionTargetsSchema = z.object({
  kcal: z.number().min(1000).max(6000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(300),
  fiber: z.number().min(0).max(100),
})

/** POST /api/nutrition/meal-plan body. */
export const mealPlanRequestSchema = z.object({
  targets: nutritionTargetsSchema,
  diet: z.enum(DIET_OPTIONS),
  exclusions: z.enum(DIET_TAG_OPTIONS).array(),
  mealsPerDay: mealsPerDaySchema,
  seed: z.number().int().min(0).max(2 ** 31 - 1),
  days: z.number().int().min(1).max(MEAL_PLAN_MAX_DAYS),
})

/** Servings stepper bounds for planned items. */
export const servingsSchema = z
  .number()
  .min(SERVING_MIN)
  .max(SERVING_MAX * 20)
  .refine((value) => Number.isFinite(value), { message: 'Servings must be a number.' })

export type HealthProfileSchemaInput = z.infer<typeof healthProfileSchema>
export type FullProfileSchemaInput = z.infer<typeof fullProfileSchema>
export type MealPlanRequestSchemaInput = z.infer<typeof mealPlanRequestSchema>
