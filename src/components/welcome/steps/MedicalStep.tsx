'use client'

/**
 * Wizard step 4 — Medical history (required step): the user must either
 * select at least one condition / "Other" entry or explicitly tick "None of
 * the above" before continuing. Reuses the profile's MedicalHistoryField in
 * controlled mode so the "None" acknowledgement is real form state.
 */

import { useFormContext } from 'react-hook-form'
import { MedicalHistoryField } from '@/components/profile/MedicalHistoryField'
import type { OnboardingFormValues } from '@/lib/validation/profileSchemas'

export function MedicalStep() {
  const { watch, setValue, formState } = useFormContext<OnboardingFormValues>()
  const medicalConditions = watch('medicalConditions')
  const otherConditions = watch('otherConditions')
  const noneOfAbove = watch('noneOfAbove')
  const error = formState.errors.noneOfAbove

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
          Any past or current health conditions?
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your workouts, meals and hydration plan are adapted to your health. Select everything
          that applies.
        </p>
      </div>

      <MedicalHistoryField
        value={{ medicalConditions, otherConditions }}
        onChange={(next) => {
          setValue('medicalConditions', next.medicalConditions)
          setValue('otherConditions', next.otherConditions)
          const hasSelections =
            next.medicalConditions.length > 0 || next.otherConditions.length > 0
          if (hasSelections) {
            setValue('noneOfAbove', false, { shouldValidate: true })
          }
        }}
        noneAcknowledged={noneOfAbove}
        onNoneChange={(acknowledged) => {
          setValue('noneOfAbove', acknowledged, { shouldValidate: true })
          if (acknowledged) {
            setValue('medicalConditions', [])
            setValue('otherConditions', [])
          }
        }}
        hideHeader
      />

      {error?.message !== undefined ? (
        <p aria-live="polite" className="text-xs text-mode-pain">
          {error.message}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Saved only on this device — never uploaded, never sent to any API.
      </p>
    </div>
  )
}
