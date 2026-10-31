'use client'

/**
 * Wizard step 1 — About you: name (required), age and sex. Also hosts the
 * demo quick-fill chips (presentations).
 */

import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEX_OPTIONS } from '@/config/healthSchemas'
import { SEX_LABELS } from '@/config/labels'
import { PROFILE_NAME_MAX_LENGTH } from '@/config/medicalConditions'
import type { DemoProfile } from '@/config/demoProfiles'
import { DemoChips } from '@/components/welcome/DemoChips'
import { StepError } from '@/components/welcome/steps/stepUi'
import type { OnboardingFormValues } from '@/lib/validation/profileSchemas'
import type { Sex } from '@/types/profile'
import { cn } from '@/lib/utils'

export function AboutStep({ onDemoFill }: { onDemoFill: (demo: DemoProfile) => void }) {
  const fieldId = useId()
  const { register, watch, setValue, formState } = useFormContext<OnboardingFormValues>()
  const sex = watch('sex')
  const errors = formState.errors

  const handleSexChange = (value: string): void => {
    const next = SEX_OPTIONS.find((option) => option === value)
    if (next !== undefined) setValue('sex', next, { shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <DemoChips onPick={onDemoFill} />

      <div className="space-y-1.5">
        <Label htmlFor={`${fieldId}-name`}>Name</Label>
        <Input
          id={`${fieldId}-name`}
          type="text"
          maxLength={PROFILE_NAME_MAX_LENGTH}
          autoComplete="name"
          placeholder="Your name"
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name !== undefined ? `${fieldId}-name-error` : undefined}
          {...register('name')}
        />
        <StepError id={`${fieldId}-name-error`} message={errors.name?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-age`}>Age</Label>
          <Input
            id={`${fieldId}-age`}
            type="number"
            inputMode="numeric"
            min={10}
            max={100}
            placeholder="e.g. 28"
            aria-invalid={errors.age !== undefined}
            aria-describedby={errors.age !== undefined ? `${fieldId}-age-error` : undefined}
            {...register('age', { valueAsNumber: true })}
          />
          <StepError id={`${fieldId}-age-error`} message={errors.age?.message} />
        </div>

        <div className="space-y-1.5">
          <span id={`${fieldId}-sex-label`} className="block text-sm font-medium leading-none">
            Sex
          </span>
          <div
            role="group"
            aria-labelledby={`${fieldId}-sex-label`}
            className="grid w-full grid-cols-2 gap-1 rounded-lg border border-white/8 bg-surface-raised p-1"
          >
            {SEX_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sex === option}
                onClick={() => handleSexChange(option)}
                className={cn(
                  'min-h-9 rounded-md px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                  sex === option
                    ? 'bg-brand-blue text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {SEX_LABELS[option]}
              </button>
            ))}
          </div>
          <StepError id={`${fieldId}-sex-error`} message={errors.sex?.message} />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Everything you enter is stored only on this device and used to personalise your results.
      </p>
    </div>
  )
}
