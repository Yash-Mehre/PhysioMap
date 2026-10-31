'use client'

/**
 * Wizard step 3 — Goals & food: weight goal, pace (lose/gain only), diet
 * preference, foods to avoid, training level, equipment (multi-select) and
 * training goal.
 */

import { useFormContext } from 'react-hook-form'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { GOAL_OPTIONS, PACE_OPTIONS, DIET_OPTIONS, DIET_TAG_OPTIONS } from '@/config/healthSchemas'
import {
  ACTIVITY_LEVEL_LABELS,
  DIET_PREFERENCE_LABELS,
  DIET_TAG_LABELS,
  EQUIPMENT_LABELS,
  LEVEL_LABELS,
  TRAINING_GOAL_LABELS,
  WEIGHT_GOAL_LABELS,
} from '@/config/labels'
import { EQUIPMENT_OPTIONS, LEVEL_OPTIONS, TRAINING_GOAL_OPTIONS } from '@/config/profileOptions'
import { FieldGroup, OptionCard, StepError, ToggleChip } from '@/components/welcome/steps/stepUi'
import type { OnboardingFormValues } from '@/lib/validation/profileSchemas'
import type { DietTag, WeightGoal } from '@/types/profile'
import type { Equipment } from '@/types/exercise'
import { cn } from '@/lib/utils'

const GOAL_ICONS = { lose: TrendingDown, maintain: Minus, gain: TrendingUp } as const

export function GoalsStep() {
  const { watch, setValue, formState } = useFormContext<OnboardingFormValues>()
  const goal = watch('goal')
  const pace = watch('paceKgPerWeek')
  const dietPreference = watch('dietPreference')
  const excludedTags = watch('excludedTags')
  const trainingLevel = watch('trainingLevel')
  const equipment = watch('equipment')
  const trainingGoal = watch('trainingGoal')
  const errors = formState.errors

  const toggleTag = (tag: DietTag): void => {
    const next = excludedTags.includes(tag)
      ? excludedTags.filter((item) => item !== tag)
      : [...excludedTags, tag]
    setValue('excludedTags', next)
  }

  const toggleEquipment = (item: Equipment): void => {
    const next = equipment.includes(item)
      ? equipment.filter((value) => value !== item)
      : [...equipment, item]
    // Keep at least one option (mirrors the profile edit form).
    setValue('equipment', next.length > 0 ? next : ['bodyweight'], { shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <FieldGroup label="Weight goal">
        <div className="grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              compact
              selected={goal === option}
              onClick={() => setValue('goal', option, { shouldValidate: true })}
              title={WEIGHT_GOAL_LABELS[option]}
              icon={GOAL_ICONS[option]}
            />
          ))}
        </div>
        <StepError message={errors.goal?.message} id="goal-error" />
      </FieldGroup>

      {goal !== undefined && goal !== 'maintain' ? (
        <FieldGroup label={`Pace — how fast to ${goal === 'lose' ? 'lose' : 'gain'}`}>
          <div
            role="group"
            aria-label="Weekly pace"
            className="grid w-full grid-cols-3 gap-1 rounded-lg border border-white/8 bg-surface-raised p-1"
          >
            {PACE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={pace === option}
                onClick={() => setValue('paceKgPerWeek', option, { shouldValidate: true })}
                className={cn(
                  'min-h-9 rounded-md px-2 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                  pace === option ? 'bg-brand-blue text-white' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option} kg / week
              </button>
            ))}
          </div>
          <StepError message={errors.paceKgPerWeek?.message} id="pace-error" />
        </FieldGroup>
      ) : null}

      <FieldGroup label="Diet preference">
        <div className="grid grid-cols-2 gap-2">
          {DIET_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              compact
              selected={dietPreference === option}
              onClick={() => setValue('dietPreference', option, { shouldValidate: true })}
              title={DIET_PREFERENCE_LABELS[option]}
            />
          ))}
        </div>
        <StepError message={errors.dietPreference?.message} id="diet-error" />
      </FieldGroup>

      <FieldGroup label="Foods to avoid (optional)">
        <div className="flex flex-wrap gap-2">
          {DIET_TAG_OPTIONS.map((tag) => (
            <ToggleChip
              key={tag}
              selected={excludedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
              label={DIET_TAG_LABELS[tag]}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Meal plans skip anything you mark here.</p>
      </FieldGroup>

      <FieldGroup label="Training level">
        <div className="grid grid-cols-3 gap-2">
          {LEVEL_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              compact
              selected={trainingLevel === option}
              onClick={() => setValue('trainingLevel', option, { shouldValidate: true })}
              title={LEVEL_LABELS[option]}
            />
          ))}
        </div>
        <StepError message={errors.trainingLevel?.message} id="level-error" />
      </FieldGroup>

      <FieldGroup label="Equipment you have">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EQUIPMENT_OPTIONS.map((item) => {
            const selected = equipment.includes(item)
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleEquipment(item)}
                className={cn(
                  'flex min-h-10 touch-target items-center justify-center rounded-xl border px-2 text-xs font-semibold transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
                  selected
                    ? 'border-brand-blue/70 bg-brand-blue/15 text-foreground'
                    : 'border-white/10 bg-surface-raised/60 text-muted-foreground hover:border-white/25 hover:text-foreground',
                )}
              >
                {EQUIPMENT_LABELS[item]}
              </button>
            )
          })}
        </div>
        <StepError message={errors.equipment?.message} id="equipment-error" />
      </FieldGroup>

      <FieldGroup label="Training goal">
        <div className="grid grid-cols-3 gap-2">
          {TRAINING_GOAL_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              compact
              selected={trainingGoal === option}
              onClick={() => setValue('trainingGoal', option, { shouldValidate: true })}
              title={TRAINING_GOAL_LABELS[option]}
            />
          ))}
        </div>
        <StepError message={errors.trainingGoal?.message} id="training-goal-error" />
      </FieldGroup>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Not sure about the training options? Defaults work well — you can change everything later
        in your profile ({ACTIVITY_LEVEL_LABELS.moderate} is the most common starting point).
      </p>
    </div>
  )
}
