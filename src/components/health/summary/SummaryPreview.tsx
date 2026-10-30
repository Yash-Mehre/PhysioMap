'use client'

/**
 * Summary preview — a light "paper" mirror of the PDF structure. Reads the
 * persisted stores live and renders only the sections the user checked.
 * The element carries `.print-area`; the print stylesheet shows only it.
 */

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { format } from 'date-fns'
import { Check } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { REGION_BY_ID } from '@/config/regions'
import {
  ACTIVITY_LEVEL_LABELS,
  DIET_PREFERENCE_LABELS,
  DIET_TAG_LABELS,
  SEX_LABELS,
  WEIGHT_GOAL_LABELS,
} from '@/config/labels'
import { SITE } from '@/config/site'
import { buildNutritionSummary, getWaterGoalMl, isProfileComplete } from '@/lib/health/profileValidation'
import { hydrationWeekSeries } from '@/lib/health/hydration'
import { formatHeight, formatMl, formatWeight } from '@/lib/health/units'
import { useProfileStore } from '@/store/useProfileStore'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import type { WorkoutItem } from '@/store/useWorkoutStore'
import { usePainLogStore } from '@/store/usePainLogStore'
import { useHydrationStore } from '@/store/useHydrationStore'
import { useMealPlanStore } from '@/store/useMealPlanStore'
import type { UserProfile, UnitSystem, WeightGoal } from '@/types/profile'
import type { HydrationDayPoint, MealPlan, NutritionSummary } from '@/types/nutrition'
import type { PainLogEntry } from '@/types'

/** Sections of the health summary; keys are shared with the tab checklist. */
export type SectionKey = 'profile' | 'bmi' | 'energy' | 'water' | 'mealPlan' | 'workout' | 'painLog'

export interface SummaryPreviewProps {
  sections: Record<SectionKey, boolean>
}

/** Human label for the weekly pace (shared with the PDF snapshot). */
export function formatSummaryPace(profile: UserProfile): string {
  if (profile.goal === 'maintain' || profile.paceKgPerWeek === undefined) return 'Maintenance'
  return `${profile.paceKgPerWeek} kg / week`
}

/** Human label for the planned daily calorie delta (shared with the PDF snapshot). */
export function formatSummaryEnergyDelta(delta: number, goal: WeightGoal | undefined): string {
  if (goal === 'maintain' || delta === 0) return 'Maintenance'
  const rounded = Math.abs(Math.round(delta))
  return `${rounded.toLocaleString()} kcal / day ${delta < 0 ? 'deficit' : 'surplus'}`
}

export function SummaryPreview({ sections }: SummaryPreviewProps) {
  const profile = useProfileStore((state) => state.profile)
  const items = useWorkoutStore((state) => state.items)
  const entries = usePainLogStore((state) => state.entries)
  const hydrationLog = useHydrationStore((state) => state.log)
  const plan = useMealPlanStore((state) => state.plan)

  const complete = isProfileComplete(profile)
  const summary = useMemo(() => (complete ? buildNutritionSummary(profile) : null), [complete, profile])
  const goalMl = summary !== null ? summary.waterMl : getWaterGoalMl(profile)
  const week = useMemo(() => hydrationWeekSeries(hydrationLog, goalMl), [hydrationLog, goalMl])
  const todayTotal = week.length > 0 ? week[week.length - 1].amountMl : 0
  const generatedLabel = format(new Date(), 'd MMMM yyyy')

  return (
    <div className="print-area mx-auto w-full max-w-3xl rounded-xl bg-white p-6 text-slate-900 shadow-xl shadow-black/25 sm:p-8">
      <header>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <p className="font-heading text-2xl font-bold tracking-tight text-[#0B0F17]">{SITE.name}</p>
          <p className="text-xs text-slate-400">Generated {generatedLabel}</p>
        </div>
        <div className="mt-2.5 h-1 w-16 rounded-full bg-gradient-to-r from-[#2F63E0] to-[#D9A066]" aria-hidden="true" />
        <p className="mt-2.5 text-sm text-slate-600">{SITE.tagline}</p>
      </header>

      <div className="mt-7 space-y-7">
        {sections.profile ? <ProfileSection profile={profile} /> : null}
        {sections.bmi ? <BmiSection summary={summary} unitSystem={profile.unitSystem} /> : null}
        {sections.energy ? <EnergySection summary={summary} goal={profile.goal} /> : null}
        {sections.water ? <WaterSection week={week} goalMl={goalMl} todayTotal={todayTotal} /> : null}
        {sections.mealPlan ? <MealPlanSection plan={plan} /> : null}
        {sections.workout ? <WorkoutSection items={items} /> : null}
        {sections.painLog ? <PainLogSection entries={entries} /> : null}
      </div>

      <footer className="mt-8 border-t border-slate-200 pt-3">
        <p className="text-xs italic text-slate-500">Educational guidance, not medical advice.</p>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Paper building blocks
// ---------------------------------------------------------------------------

function NotProvided() {
  return <p className="text-sm italic text-slate-400">Not provided</p>
}

function PaperSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</h3>
        {note ? <span className="text-[10px] italic text-slate-400">{note}</span> : null}
      </div>
      <div className="mt-2.5">{children}</div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function ProfileSection({ profile }: { profile: UserProfile }) {
  const fields: Array<{ label: string; value: string; wide?: boolean }> = [
    { label: 'Age', value: profile.age !== undefined ? `${profile.age} years` : '—' },
    { label: 'Sex', value: profile.sex !== undefined ? SEX_LABELS[profile.sex] : '—' },
    {
      label: 'Height',
      value: profile.heightCm !== undefined ? formatHeight(profile.heightCm, profile.unitSystem) : '—',
    },
    {
      label: 'Weight',
      value: profile.weightKg !== undefined ? formatWeight(profile.weightKg, profile.unitSystem) : '—',
    },
    {
      label: 'Activity',
      value: profile.activityLevel !== undefined ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : '—',
    },
    { label: 'Goal', value: profile.goal !== undefined ? WEIGHT_GOAL_LABELS[profile.goal] : '—' },
    { label: 'Pace', value: formatSummaryPace(profile) },
    { label: 'Diet', value: DIET_PREFERENCE_LABELS[profile.dietPreference] },
    {
      label: 'Exclusions',
      value:
        profile.excludedTags.length > 0
          ? profile.excludedTags.map((tag) => DIET_TAG_LABELS[tag]).join(', ')
          : 'None',
      wide: true,
    },
  ]

  return (
    <PaperSection title="Profile snapshot">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.label} className={field.wide ? 'col-span-2' : undefined}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{field.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{field.value}</dd>
          </div>
        ))}
      </dl>
    </PaperSection>
  )
}

function BmiSection({ summary, unitSystem }: { summary: NutritionSummary | null; unitSystem: UnitSystem }) {
  return (
    <PaperSection title="Body mass index">
      {summary === null ? (
        <NotProvided />
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-3xl font-bold leading-none text-slate-900">
              {summary.bmi.value.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-[#2F63E0]">{summary.bmi.categoryLabel}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Healthy weight range for your height:{' '}
            <span className="font-semibold text-slate-900">
              {formatWeight(summary.bmi.healthyMinKg, unitSystem)} – {formatWeight(summary.bmi.healthyMaxKg, unitSystem)}
            </span>
          </p>
        </>
      )}
    </PaperSection>
  )
}

function EnergySection({ summary, goal }: { summary: NutritionSummary | null; goal: WeightGoal | undefined }) {
  return (
    <PaperSection title="Energy & macros">
      {summary === null ? (
        <NotProvided />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <EnergyStat label="BMR" value={`${Math.round(summary.energy.bmr).toLocaleString()} kcal`} />
            <EnergyStat label="TDEE" value={`${Math.round(summary.energy.tdee).toLocaleString()} kcal`} />
            <EnergyStat label="Daily target" value={`${Math.round(summary.energy.targetKcal).toLocaleString()} kcal`} />
            <EnergyStat label="Daily delta" value={formatSummaryEnergyDelta(summary.energy.calorieDelta, goal)} />
          </div>
          {summary.energy.floorApplied ? (
            <p className="mt-2.5 text-xs italic text-amber-700">
              Safety floor applied — target raised to the minimum safe calorie intake.
            </p>
          ) : null}
          <Table className="mt-3">
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Macro
                </TableHead>
                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Grams / day
                </TableHead>
                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  kcal
                </TableHead>
                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  % of calories
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <MacroRow
                name="Protein"
                grams={summary.macros.protein}
                kcal={summary.macros.proteinKcal}
                share={summary.macros.proteinShare}
              />
              <MacroRow
                name="Carbs"
                grams={summary.macros.carbs}
                kcal={summary.macros.carbsKcal}
                share={summary.macros.carbsShare}
              />
              <MacroRow name="Fat" grams={summary.macros.fat} kcal={summary.macros.fatKcal} share={summary.macros.fatShare} />
            </TableBody>
          </Table>
          <p className="mt-2 text-sm text-slate-600">
            Fiber target: <span className="font-semibold text-slate-900">{Math.round(summary.macros.fiber)} g</span>
          </p>
        </>
      )}
    </PaperSection>
  )
}

function EnergyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function MacroRow({ name, grams, kcal, share }: { name: string; grams: number; kcal: number; share: number }) {
  return (
    <TableRow className="border-slate-100 hover:bg-transparent">
      <TableCell className="text-sm font-medium text-slate-900">{name}</TableCell>
      <TableCell className="text-right text-sm tabular-nums text-slate-700">{Math.round(grams)} g</TableCell>
      <TableCell className="text-right text-sm tabular-nums text-slate-700">
        {Math.round(kcal).toLocaleString()} kcal
      </TableCell>
      <TableCell className="text-right text-sm tabular-nums text-slate-700">{Math.round(share * 100)} %</TableCell>
    </TableRow>
  )
}

function WaterSection({
  week,
  goalMl,
  todayTotal,
}: {
  week: HydrationDayPoint[]
  goalMl: number
  todayTotal: number
}) {
  const scaleMax = Math.max(goalMl, ...week.map((day) => day.amountMl), 1)
  const goalPercent = Math.min((goalMl / scaleMax) * 100, 100)

  return (
    <PaperSection title="Water">
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <p className="text-sm text-slate-600">
          Daily goal: <span className="font-semibold text-slate-900">{formatMl(goalMl)}</span>
        </p>
        <p className="text-sm text-slate-600">
          Today: <span className="font-semibold text-slate-900">{formatMl(todayTotal)}</span>
        </p>
      </div>
      <div className="mt-4" role="img" aria-label={`Water intake over the last 7 days, daily goal ${formatMl(goalMl)}`}>
        <div className="relative h-16">
          <div className="flex h-full items-end gap-1.5 sm:gap-2" aria-hidden="true">
            {week.map((day, index) => {
              const percent = Math.min((day.amountMl / scaleMax) * 100, 100)
              const height = day.amountMl > 0 ? Math.max(percent, 4) : 0
              return (
                <div key={`${day.label}-${index}`} className="flex h-full flex-1 items-end">
                  <div className="w-full rounded-t-[3px] bg-[#2F63E0]" style={{ height: `${height}%` }} />
                </div>
              )
            })}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#D9A066]"
            style={{ bottom: `${goalPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-1.5 flex gap-1.5 sm:gap-2">
          {week.map((day, index) => (
            <div key={`${day.label}-${index}`} className="min-w-0 flex-1 text-center">
              <p className="truncate text-[10px] font-medium text-slate-600">
                {day.amountMl > 0 ? formatMl(day.amountMl) : '–'}
              </p>
              <p className="text-[10px] text-slate-400">{day.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PaperSection>
  )
}

function MealPlanSection({ plan }: { plan: MealPlan | null }) {
  const day = plan !== null ? plan.days[0] : undefined

  return (
    <PaperSection title="Today's meal plan">
      {plan === null || day === undefined || day.slots.length === 0 ? (
        <NotProvided />
      ) : (
        <>
          <p className="text-sm text-slate-600">
            {plan.mealsPerDay} meals per day · {Math.round(day.totals.kcal).toLocaleString()} kcal ·{' '}
            {Math.round(day.totals.protein)} g protein
          </p>
          <Table className="mt-2.5">
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Meal
                </TableHead>
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Items
                </TableHead>
                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  kcal
                </TableHead>
                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Protein (g)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {day.slots.map((slot) => (
                <TableRow key={slot.slotId} className="border-slate-100 hover:bg-slate-50">
                  <TableCell className="text-sm font-medium text-slate-900">{slot.label}</TableCell>
                  <TableCell className="whitespace-normal text-sm text-slate-600">
                    {slot.items.length > 0 ? slot.items.map((item) => item.name).join(', ') : '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-slate-700">
                    {Math.round(slot.totals.kcal).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-slate-700">
                    {Math.round(slot.totals.protein)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-slate-200 bg-slate-50 font-semibold hover:bg-slate-50">
                <TableCell className="text-sm font-semibold text-slate-900">Daily total</TableCell>
                <TableCell aria-hidden="true" />
                <TableCell className="text-right text-sm font-semibold tabular-nums text-slate-900">
                  {Math.round(day.totals.kcal).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold tabular-nums text-slate-900">
                  {Math.round(day.totals.protein)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
    </PaperSection>
  )
}

function WorkoutSection({ items }: { items: WorkoutItem[] }) {
  return (
    <PaperSection title="My workout">
      {items.length === 0 ? (
        <NotProvided />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.exerciseId} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.sets} × {item.reps} · {REGION_BY_ID[item.regionId]?.label ?? item.regionId}
                </p>
              </div>
              {item.completed ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Done
                </span>
              ) : (
                <span className="shrink-0 text-xs font-medium text-slate-400">Not done</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </PaperSection>
  )
}

function PainLogSection({ entries }: { entries: PainLogEntry[] }) {
  const recent = entries.slice(0, 5)

  return (
    <PaperSection title="Recent pain log" note="Self-reported">
      {recent.length === 0 ? (
        <NotProvided />
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <p className="text-sm font-medium text-slate-900">
                {REGION_BY_ID[entry.regionId]?.label ?? entry.regionId}
              </p>
              <p className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{entry.severity}/10</span>
                <span>{format(new Date(entry.date), 'd MMM yyyy')}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </PaperSection>
  )
}
