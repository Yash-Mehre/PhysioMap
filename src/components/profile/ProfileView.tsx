'use client'

/**
 * Read-only profile view rendered inside the ProfileSheet: "Your numbers"
 * strip (BMI + calorie target via the existing health functions) and clean
 * label/value rows per section. Fully read-only — the only action lives in
 * the sheet's sticky footer.
 */

import { Activity, Flame, HeartPulse, UserRound } from 'lucide-react'
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
import { formatSummaryPace } from '@/components/health/summary/SummaryPreview'
import { buildNutritionSummary } from '@/lib/health/profileValidation'
import { formatHeight, formatWeight } from '@/lib/health/units'
import { MEDICAL_HISTORY_NONE_LABEL, groupMedicalConditions } from '@/lib/health/medicalHistory'
import type { UserProfile } from '@/types'

function NotSet() {
  return <span className="text-sm text-muted-foreground/70">Not set</span>
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-foreground sm:text-right">{value}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">{title}</h3>
      <dl>{children}</dl>
    </section>
  )
}

/** True when the five numbers the calculators need are present. */
function hasCoreNumbers(profile: UserProfile): boolean {
  return (
    profile.age !== undefined &&
    profile.sex !== undefined &&
    profile.heightCm !== undefined &&
    profile.weightKg !== undefined &&
    profile.activityLevel !== undefined
  )
}

/** True when the user has not entered any of the main profile values. */
export function isProfileEmpty(profile: UserProfile): boolean {
  return (
    profile.age === undefined &&
    profile.sex === undefined &&
    profile.heightCm === undefined &&
    profile.weightKg === undefined &&
    profile.activityLevel === undefined &&
    profile.goal === undefined
  )
}

/** Compact BMI + daily-calorie strip, using the existing health functions. */
function YourNumbersStrip({ profile }: { profile: UserProfile }) {
  const summary = buildNutritionSummary(profile)
  return (
    <div className="grid grid-cols-2 gap-2" aria-label="Your numbers">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-surface-raised/60 px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface">
          <HeartPulse className="h-4 w-4 text-mode-pain" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">BMI</p>
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
            {profile.goal === undefined ? 'Maintenance target' : WEIGHT_GOAL_LABELS[profile.goal]}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ProfileView({ profile }: { profile: UserProfile }) {
  if (isProfileEmpty(profile)) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/30 bg-surface">
          <UserRound className="h-5 w-5 text-copper" aria-hidden="true" />
        </span>
        <p className="max-w-60 text-sm leading-relaxed text-muted-foreground">
          Add your age, height, weight and goals once — every calculator, meal plan and workout
          fills in from this one profile.
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
          Stored on this device only
        </p>
      </div>
    )
  }

  const grouped = groupMedicalConditions(profile.medicalConditions)
  const hasOther = profile.otherConditions.length > 0
  const hasHistory = grouped.length > 0 || hasOther

  return (
    <div className="space-y-5 px-4 py-4 sm:px-5">
      {hasCoreNumbers(profile) ? <YourNumbersStrip profile={profile} /> : null}

      <Section title="Personal">
        <Row
          label="Age"
          value={profile.age !== undefined ? `${profile.age} years` : <NotSet />}
        />
        <Row
          label="Sex"
          value={profile.sex !== undefined ? SEX_LABELS[profile.sex] : <NotSet />}
        />
        <Row
          label="Height"
          value={
            profile.heightCm !== undefined ? (
              formatHeight(profile.heightCm, profile.unitSystem)
            ) : (
              <NotSet />
            )
          }
        />
        <Row
          label="Weight"
          value={
            profile.weightKg !== undefined ? (
              formatWeight(profile.weightKg, profile.unitSystem)
            ) : (
              <NotSet />
            )
          }
        />
      </Section>

      <Section title="Lifestyle & goals">
        <Row
          label="Activity level"
          value={profile.activityLevel !== undefined ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : <NotSet />}
        />
        <Row label="Weight goal" value={profile.goal !== undefined ? WEIGHT_GOAL_LABELS[profile.goal] : <NotSet />} />
        <Row
          label="Pace"
          value={
            profile.goal !== undefined ? (
              formatSummaryPace(profile)
            ) : (
              <NotSet />
            )
          }
        />
      </Section>

      <Section title="Diet">
        <Row label="Preference" value={DIET_PREFERENCE_LABELS[profile.dietPreference]} />
        <Row
          label="Excluded food types"
          value={
            profile.excludedTags.length > 0 ? (
              profile.excludedTags.map((tag) => DIET_TAG_LABELS[tag]).join(', ')
            ) : (
              <NotSet />
            )
          }
        />
      </Section>

      <Section title="Training preferences">
        <Row label="Level" value={LEVEL_LABELS[profile.trainingLevel]} />
        <Row
          label="Equipment"
          value={profile.equipment.map((item) => EQUIPMENT_LABELS[item]).join(', ')}
        />
        <Row label="Goal" value={TRAINING_GOAL_LABELS[profile.trainingGoal]} />
      </Section>

      <Section title="Medical history">
        {hasHistory ? (
          <div className="space-y-2.5 pt-1">
            {grouped.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group.label}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {group.conditions.map((condition) => (
                    <li
                      key={condition.id}
                      className="rounded-full border border-mode-info/30 bg-mode-info/10 px-2.5 py-0.5 text-[11px] font-medium text-mode-info"
                    >
                      {condition.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {hasOther ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other</p>
                <ul className="flex flex-wrap gap-1.5">
                  {profile.otherConditions.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-mode-info/30 bg-mode-info/10 px-2.5 py-0.5 text-[11px] font-medium text-mode-info"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="pt-1 text-sm text-muted-foreground/70">{MEDICAL_HISTORY_NONE_LABEL}</p>
        )}
      </Section>
    </div>
  )
}
