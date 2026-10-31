'use client'

/**
 * Wizard step 2 — Your body: unit toggle (metric ⇄ imperial, converted live
 * through `lib/health/units`, stored metric), height, weight, activity level
 * cards and a live BMI preview chip as soon as height + weight are valid
 * (existing `lib/health` function — no new formula).
 */

import { useId, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { HeartPulse } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ACTIVITY_DESCRIPTIONS, ACTIVITY_LEVEL_ORDER } from '@/config/nutrition'
import { ACTIVITY_LEVEL_LABELS } from '@/config/labels'
import { UNIT_SYSTEM_OPTIONS } from '@/config/healthSchemas'
import { calculateBmiResult } from '@/lib/health/bmi'
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from '@/lib/health/units'
import { OptionCard, StepError } from '@/components/welcome/steps/stepUi'
import type { OnboardingFormValues } from '@/lib/validation/profileSchemas'
import type { ActivityLevel, UnitSystem } from '@/types/profile'
import { cn } from '@/lib/utils'

/** Parse a numeric input string; blank or non-finite becomes undefined. */
function parseNumberInput(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Feet + inches strings → centimetres (1 decimal); undefined when both blank. */
function imperialToCm(feetStr: string, inchesStr: string): number | undefined {
  if (feetStr.trim() === '' && inchesStr.trim() === '') return undefined
  const feet = feetStr.trim() === '' ? 0 : Number(feetStr)
  const inches = inchesStr.trim() === '' ? 0 : Number(inchesStr)
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return undefined
  return Math.round(ftInToCm(feet, inches) * 10) / 10
}

/** Pounds string → kilograms (1 decimal); undefined when blank. */
function poundsToKg(lbStr: string): number | undefined {
  const lb = parseNumberInput(lbStr)
  return lb === undefined ? undefined : Math.round(lbToKg(lb) * 10) / 10
}

export function BodyStep() {
  const fieldId = useId()
  const { register, watch, setValue, formState } = useFormContext<OnboardingFormValues>()
  const unitSystem = watch('unitSystem')
  const heightCm = watch('heightCm')
  const weightKg = watch('weightKg')
  const activityLevel = watch('activityLevel')
  const errors = formState.errors

  // Imperial display buffers (converted to metric on every change).
  const [heightFtStr, setHeightFtStr] = useState(() =>
    heightCm !== undefined ? String(cmToFtIn(heightCm).feet) : '',
  )
  const [heightInStr, setHeightInStr] = useState(() =>
    heightCm !== undefined ? String(cmToFtIn(heightCm).inches) : '',
  )
  const [weightLbStr, setWeightLbStr] = useState(() =>
    weightKg !== undefined ? String(Math.round(kgToLb(weightKg))) : '',
  )

  /** Toggle units, converting the visible buffers in both directions. */
  const handleUnitChange = (next: UnitSystem): void => {
    if (next === unitSystem) return
    if (next === 'imperial') {
      const cm = watch('heightCm')
      if (cm !== undefined) {
        const split = cmToFtIn(cm)
        setHeightFtStr(String(split.feet))
        setHeightInStr(String(split.inches))
      } else {
        setHeightFtStr('')
        setHeightInStr('')
      }
      const kg = watch('weightKg')
      setWeightLbStr(kg !== undefined ? String(Math.round(kgToLb(kg))) : '')
    } else {
      const cm = imperialToCm(heightFtStr, heightInStr)
      if (cm !== undefined) setValue('heightCm', cm)
      const kg = poundsToKg(weightLbStr)
      if (kg !== undefined) setValue('weightKg', kg)
    }
    setValue('unitSystem', next)
  }

  const handleActivityChange = (level: ActivityLevel): void => {
    setValue('activityLevel', level, { shouldValidate: true })
  }

  const heightValid = heightCm !== undefined && heightCm >= 100 && heightCm <= 250
  const weightValid = weightKg !== undefined && weightKg >= 25 && weightKg <= 300
  const bmiPreview = heightValid && weightValid ? calculateBmiResult(weightKg, heightCm) : null

  const heightHint =
    unitSystem === 'imperial' && heightCm !== undefined ? `≈ ${heightCm} cm` : undefined
  const weightHint =
    unitSystem === 'imperial' && weightKg !== undefined ? `≈ ${weightKg} kg` : undefined
  const heightMessage = errors.heightCm?.message ?? heightHint
  const weightMessage = errors.weightKg?.message ?? weightHint

  return (
    <div className="space-y-5">
      {/* Unit toggle */}
      <div
        role="group"
        aria-labelledby={`${fieldId}-units-label`}
        className="grid w-full grid-cols-2 gap-1 rounded-lg border border-white/8 bg-surface-raised p-1"
      >
        <span id={`${fieldId}-units-label`} className="sr-only">
          Units
        </span>
        {UNIT_SYSTEM_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={unitSystem === option}
            onClick={() => handleUnitChange(option)}
            className={cn(
              'min-h-9 rounded-md px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
              unitSystem === option
                ? 'bg-brand-blue text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option === 'metric' ? 'Metric (cm · kg)' : 'Imperial (ft · lb)'}
          </button>
        ))}
      </div>

      {/* Height + weight — keyed by unit system so the metric (uncontrolled,
          RHF-registered) and imperial (controlled buffer) inputs never swap
          inside the same DOM slot. */}
      <div key={unitSystem} className="grid grid-cols-2 gap-3">
        {unitSystem === 'metric' ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-height`}>Height (cm)</Label>
              <Input
                id={`${fieldId}-height`}
                type="number"
                min={100}
                max={250}
                step="any"
                placeholder="175"
                aria-invalid={errors.heightCm !== undefined}
                aria-describedby={heightMessage !== undefined ? `${fieldId}-height-error` : undefined}
                {...register('heightCm', { valueAsNumber: true })}
              />
              <StepError id={`${fieldId}-height-error`} message={errors.heightCm?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-weight`}>Weight (kg)</Label>
              <Input
                id={`${fieldId}-weight`}
                type="number"
                min={25}
                max={300}
                step="any"
                placeholder="70"
                aria-invalid={errors.weightKg !== undefined}
                aria-describedby={weightMessage !== undefined ? `${fieldId}-weight-error` : undefined}
                {...register('weightKg', { valueAsNumber: true })}
              />
              <StepError id={`${fieldId}-weight-error`} message={errors.weightKg?.message} />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-height-ft`}>Height (ft)</Label>
              <Input
                id={`${fieldId}-height-ft`}
                type="number"
                inputMode="numeric"
                min={3}
                max={8}
                value={heightFtStr}
                onChange={(event) => {
                  setHeightFtStr(event.target.value)
                  const cm = imperialToCm(event.target.value, heightInStr)
                  setValue('heightCm', cm, { shouldValidate: true })
                }}
                aria-invalid={errors.heightCm !== undefined}
                aria-describedby={heightMessage !== undefined ? `${fieldId}-height-error` : undefined}
              />
              <Label htmlFor={`${fieldId}-height-in`} className="sr-only">
                Height (inches)
              </Label>
              <Input
                id={`${fieldId}-height-in`}
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                value={heightInStr}
                onChange={(event) => {
                  setHeightInStr(event.target.value)
                  const cm = imperialToCm(heightFtStr, event.target.value)
                  setValue('heightCm', cm, { shouldValidate: true })
                }}
                aria-invalid={errors.heightCm !== undefined}
              />
              {heightMessage !== undefined ? (
                <p
                  id={`${fieldId}-height-error`}
                  aria-live="polite"
                  className={cn(
                    'text-xs',
                    errors.heightCm !== undefined ? 'text-mode-pain' : 'text-muted-foreground',
                  )}
                >
                  {heightMessage}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-weight-lb`}>Weight (lb)</Label>
              <Input
                id={`${fieldId}-weight-lb`}
                type="number"
                min={55}
                max={660}
                step="any"
                value={weightLbStr}
                onChange={(event) => {
                  setWeightLbStr(event.target.value)
                  const kg = poundsToKg(event.target.value)
                  setValue('weightKg', kg, { shouldValidate: true })
                }}
                aria-invalid={errors.weightKg !== undefined}
                aria-describedby={weightMessage !== undefined ? `${fieldId}-weight-error` : undefined}
              />
              {weightMessage !== undefined ? (
                <p
                  id={`${fieldId}-weight-error`}
                  aria-live="polite"
                  className={cn(
                    'text-xs',
                    errors.weightKg !== undefined ? 'text-mode-pain' : 'text-muted-foreground',
                  )}
                >
                  {weightMessage}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* Live BMI preview */}
      {bmiPreview !== null ? (
        <p
          className="flex items-center gap-2 rounded-full border border-copper/30 bg-copper/10 px-3.5 py-2 text-xs font-semibold text-copper"
          aria-live="polite"
        >
          <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
          Your BMI: {bmiPreview.value.toFixed(1)} · {bmiPreview.categoryLabel}
        </p>
      ) : null}

      {/* Activity level cards */}
      <div className="space-y-2">
        <span className="block text-sm font-medium leading-none">Activity level</span>
        <div className="grid gap-2">
          {ACTIVITY_LEVEL_ORDER.map((level) => (
            <OptionCard
              key={level}
              selected={activityLevel === level}
              onClick={() => handleActivityChange(level)}
              title={ACTIVITY_LEVEL_LABELS[level]}
              description={ACTIVITY_DESCRIPTIONS[level]}
            />
          ))}
        </div>
        <StepError id={`${fieldId}-activity-error`} message={errors.activityLevel?.message} />
      </div>
    </div>
  )
}
