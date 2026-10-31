/**
 * Shared zod schemas for profile data entry — used by BOTH the /welcome
 * onboarding wizard and the profile edit form (ProfileSheet), so the two can
 * never drift apart. The API-facing nutrition schemas stay in
 * `config/healthSchemas.ts`; the field rules below reuse them verbatim.
 */

import { z } from 'zod'
import {
  DIET_OPTIONS,
  DIET_TAG_OPTIONS,
  UNIT_SYSTEM_OPTIONS,
  healthProfileSchema,
} from '@/config/healthSchemas'
import {
  MEDICAL_CONDITION_IDS,
  OTHER_CONDITION_LIMITS,
  PROFILE_NAME_MAX_LENGTH,
} from '@/config/medicalConditions'
import { EQUIPMENT_OPTIONS, LEVEL_OPTIONS, TRAINING_GOAL_OPTIONS } from '@/config/profileOptions'
import type {
  ActivityLevel,
  DietPreference,
  DietTag,
  Equipment,
  Level,
  MedicalConditionId,
  PaceKgPerWeek,
  Sex,
  TrainingGoal,
  UnitSystem,
  WeightGoal,
} from '@/types'

/** Display name — required during onboarding (2–40 characters). */
export const profileNameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(PROFILE_NAME_MAX_LENGTH, `Name must be ${PROFILE_NAME_MAX_LENGTH} characters or fewer.`)

/** Optional display name for the profile edit form (empty allowed). */
export const optionalNameSchema = z
  .string()
  .trim()
  .max(PROFILE_NAME_MAX_LENGTH, `Name must be ${PROFILE_NAME_MAX_LENGTH} characters or fewer.`)

/** Core numeric/enum rules — shared verbatim by the nutrition API schema,
 * the profile edit form and the wizard steps. */
export const profileCoreSchema = healthProfileSchema

const medicalConditionsSchema = z.enum(MEDICAL_CONDITION_IDS).array()
const otherConditionsSchema = z
  .string()
  .trim()
  .min(1)
  .max(OTHER_CONDITION_LIMITS.maxLength)
  .array()
  .max(OTHER_CONDITION_LIMITS.maxItems)

/** Wizard form values (always stored metric internally). */
export interface OnboardingFormValues {
  name: string
  age?: number
  sex?: Sex
  unitSystem: UnitSystem
  heightCm?: number
  weightKg?: number
  activityLevel?: ActivityLevel
  goal?: WeightGoal
  paceKgPerWeek: PaceKgPerWeek
  dietPreference: DietPreference
  excludedTags: DietTag[]
  trainingLevel: Level
  equipment: Equipment[]
  trainingGoal: TrainingGoal
  medicalConditions: MedicalConditionId[]
  otherConditions: string[]
  /** True once the user ticked "None of the above" (wizard-only, not saved). */
  noneOfAbove: boolean
}

/** Step 1 — About you. */
export const aboutStepSchema = z.object({
  name: profileNameSchema,
  age: healthProfileSchema.shape.age,
  sex: healthProfileSchema.shape.sex,
})

/** Step 2 — Your body (activity included for the calorie preview). */
export const bodyStepSchema = z.object({
  heightCm: healthProfileSchema.shape.heightCm,
  weightKg: healthProfileSchema.shape.weightKg,
  activityLevel: healthProfileSchema.shape.activityLevel,
})

/** Step 3 — Goals, food and training. */
export const goalsStepSchema = z.object({
  goal: healthProfileSchema.shape.goal,
  paceKgPerWeek: healthProfileSchema.shape.paceKgPerWeek,
  dietPreference: z.enum(DIET_OPTIONS, { message: 'Select a diet preference.' }),
  excludedTags: z.enum(DIET_TAG_OPTIONS).array(),
  trainingLevel: z.enum(LEVEL_OPTIONS, { message: 'Select a training level.' }),
  equipment: z
    .enum(EQUIPMENT_OPTIONS)
    .array()
    .min(1, 'Select at least one equipment option.'),
  trainingGoal: z.enum(TRAINING_GOAL_OPTIONS, { message: 'Select a training goal.' }),
})

/** Step 4 base shape — the "answered" rule lives in the refinements below. */
const medicalStepBase = z.object({
  medicalConditions: medicalConditionsSchema,
  otherConditions: otherConditionsSchema,
  noneOfAbove: z.boolean(),
})

const MEDICAL_STEP_MESSAGE = 'Select at least one condition, or tick “None of the above”.'

/** Step 4 — Medical history: answered = conditions, "other" entries or an
 * explicit "None of the above". */
export const medicalStepSchema = medicalStepBase.refine(
  (values) =>
    values.noneOfAbove || values.medicalConditions.length > 0 || values.otherConditions.length > 0,
  { message: MEDICAL_STEP_MESSAGE, path: ['noneOfAbove'] },
)

/** Whole onboarding form — every step's rules combined. */
export const onboardingFormSchema = z
  .object({
    ...aboutStepSchema.shape,
    ...bodyStepSchema.shape,
    ...goalsStepSchema.shape,
    ...medicalStepBase.shape,
    unitSystem: z.enum(UNIT_SYSTEM_OPTIONS),
  })
  .superRefine((values, ctx) => {
    const answered =
      values.noneOfAbove || values.medicalConditions.length > 0 || values.otherConditions.length > 0
    if (!answered) {
      ctx.addIssue({
        code: 'custom',
        path: ['noneOfAbove'],
        message: MEDICAL_STEP_MESSAGE,
      })
    }
  })

/**
 * What `completeOnboarding` accepts: every required wizard field, valid. The
 * medical-history answer itself is not re-checkable from the saved shape (a
 * "None of the above" profile persists as empty lists), so only the limits
 * apply here.
 */
export const completedProfileSchema = z
  .object({
    ...aboutStepSchema.shape,
    ...bodyStepSchema.shape,
    ...goalsStepSchema.shape,
    unitSystem: z.enum(UNIT_SYSTEM_OPTIONS),
    medicalConditions: medicalConditionsSchema,
    otherConditions: otherConditionsSchema,
  })
  .passthrough()

/** Field names validated per wizard step (for RHF `trigger`). */
export const STEP_FIELDS: readonly (keyof OnboardingFormValues)[][] = [
  ['name', 'age', 'sex'],
  ['heightCm', 'weightKg', 'activityLevel'],
  [
    'goal',
    'paceKgPerWeek',
    'dietPreference',
    'excludedTags',
    'trainingLevel',
    'equipment',
    'trainingGoal',
  ],
  ['medicalConditions', 'otherConditions', 'noneOfAbove'],
  [],
]
