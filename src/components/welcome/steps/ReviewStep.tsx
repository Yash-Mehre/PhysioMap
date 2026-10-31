'use client'

/**
 * Wizard step 5 — Review: label/value rows grouped like the profile view,
 * medical history as chips, a "Your numbers" strip (BMI + category, daily
 * calorie target — existing `lib/health` functions) and an Edit link per
 * section that jumps back to that step.
 */

import { Flame, HeartPulse, Pencil } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import {
  ACTIVITY_LEVEL_LABELS,
  DIET_PREFERENCE_LABELS,
  DIET_TAG_LABELS,
  EQUIPMENT_LABELS,
  LEVEL_LABELS,
  SEX_LABELS,
  TRAINING_GOAL_LABELS,
  WEIGHT_GOAL_LABELS,
} from '@/config/labels'
import { buildNutritionSummary } from '@/lib/health/profileValidation'
import { formatHeight, formatWeight } from '@/lib/health/units'
import { groupMedicalConditions } from '@/lib/health/medicalHistory'
import type { OnboardingFormValues } from '@/lib/validation/profileSchemas'

export interface ReviewStepProps {
  /** Jump back to the given wizard step (0-based). */
  onEdit: (step: number) => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-2 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function Section({
  title,
  onEdit,
  step,
  children,
}: {
  title: string
  onEdit: (step: number) => void
  step: number
  children: React.ReactNode
}) {
  return (
    <section aria-label={title} className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  )
}

export function ReviewStep({ onEdit }: ReviewStepProps) {
  const { getValues } = useFormContext<OnboardingFormValues>()
  const values = getValues()

  const summary = buildNutritionSummary({
    ...values,
    onboarded: true,
  })
  const grouped = groupMedicalConditions(values.medicalConditions)
  const hasOther = values.otherConditions.length > 0

  return (
    <div className="space-y-5">
      {/* Your numbers */}
      <div className="grid grid-cols-2 gap-2" aria-label="Your numbers">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-surface-raised/60 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface">
            <HeartPulse className="h-4 w-4 text-mode-pain" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              BMI
            </p>
            <p className="font-heading text-base font-bold leading-tight text-foreground">
              {summary.bmi.value.toFixed(1)}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{summary.bmi.categoryLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-surface-raised/60 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface">
            <Flame className="h-4 w-4 text-copper" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Daily calories
            </p>
            <p className="font-heading text-base font-bold leading-tight text-foreground">
              {Math.round(summary.energy.targetKcal).toLocaleString()} kcal
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {WEIGHT_GOAL_LABELS[values.goal ?? 'maintain']}
            </p>
          </div>
        </div>
      </div>

      <Section title="About you" onEdit={onEdit} step={0}>
        <Row label="Name" value={values.name} />
        <Row label="Age" value={`${values.age} years`} />
        <Row label="Sex" value={values.sex !== undefined ? SEX_LABELS[values.sex] : '—'} />
      </Section>

      <Section title="Your body" onEdit={onEdit} step={1}>
        <Row
          label="Height"
          value={
            values.heightCm !== undefined
              ? formatHeight(values.heightCm, values.unitSystem)
              : '—'
          }
        />
        <Row
          label="Weight"
          value={
            values.weightKg !== undefined
              ? formatWeight(values.weightKg, values.unitSystem)
              : '—'
          }
        />
        <Row
          label="Activity"
          value={
            values.activityLevel !== undefined ? ACTIVITY_LEVEL_LABELS[values.activityLevel] : '—'
          }
        />
      </Section>

      <Section title="Goals & food" onEdit={onEdit} step={2}>
        <Row label="Goal" value={values.goal !== undefined ? WEIGHT_GOAL_LABELS[values.goal] : '—'} />
        {values.goal !== undefined && values.goal !== 'maintain' ? (
          <Row label="Pace" value={`${values.paceKgPerWeek} kg / week`} />
        ) : null}
        <Row label="Diet" value={DIET_PREFERENCE_LABELS[values.dietPreference]} />
        <Row
          label="Foods to avoid"
          value={
            values.excludedTags.length > 0
              ? values.excludedTags.map((tag) => DIET_TAG_LABELS[tag]).join(', ')
              : 'None'
          }
        />
        <Row label="Training level" value={LEVEL_LABELS[values.trainingLevel]} />
        <Row
          label="Equipment"
          value={values.equipment.map((item) => EQUIPMENT_LABELS[item]).join(', ')}
        />
        <Row label="Training goal" value={TRAINING_GOAL_LABELS[values.trainingGoal]} />
      </Section>

      <Section title="Medical history" onEdit={onEdit} step={3}>
        {grouped.length > 0 || hasOther ? (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {grouped.flatMap((group) =>
              group.conditions.map((condition) => (
                <li
                  key={condition.id}
                  className="rounded-full border border-mode-info/30 bg-mode-info/10 px-2.5 py-0.5 text-[11px] font-medium text-mode-info"
                >
                  {condition.label}
                </li>
              )),
            )}
            {values.otherConditions.map((item) => (
              <li
                key={`other-${item}`}
                className="rounded-full border border-mode-info/30 bg-mode-info/10 px-2.5 py-0.5 text-[11px] font-medium text-mode-info"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="pt-1 text-sm text-muted-foreground">None of the above</p>
        )}
      </Section>
    </div>
  )
}
