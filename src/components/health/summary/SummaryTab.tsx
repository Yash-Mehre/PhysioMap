'use client'

/**
 * Summary tab ("Take it with you"): section checklist, PDF download (jspdf
 * loaded dynamically on click only), browser print of the paper preview, and
 * a cross-link into the 3D body map.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ArrowRight, FileDown, Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ProfileRequiredState } from '@/components/health/ProfileRequiredState'
import {
  SummaryPreview,
  formatSummaryEnergyDelta,
  formatSummaryPace,
  type SectionKey,
} from '@/components/health/summary/SummaryPreview'
import type { HealthSummarySnapshot } from '@/lib/pdf/healthSummary'
import { buildNutritionSummary, isProfileComplete } from '@/lib/health/profileValidation'
import { formatMedicalHistory } from '@/lib/health/medicalHistory'
import { hydrationWeekSeries } from '@/lib/health/hydration'
import { formatHeight, formatMl, formatWeight } from '@/lib/health/units'
import { REGION_BY_ID } from '@/config/regions'
import {
  ACTIVITY_LEVEL_LABELS,
  DIET_PREFERENCE_LABELS,
  DIET_TAG_LABELS,
  SEX_LABELS,
  WEIGHT_GOAL_LABELS,
} from '@/config/labels'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import { usePainLogStore } from '@/store/usePainLogStore'
import { useHydrationStore } from '@/store/useHydrationStore'
import { useMealPlanStore } from '@/store/useMealPlanStore'

const SECTION_ITEMS: ReadonlyArray<{ key: SectionKey; name: string; description: string }> = [
  { key: 'profile', name: 'Profile snapshot', description: 'Age, height, weight, activity level and goal.' },
  { key: 'bmi', name: 'BMI', description: 'Body mass index with your healthy weight range.' },
  { key: 'energy', name: 'Energy & macros', description: 'BMR, TDEE, calorie target and macro split.' },
  { key: 'water', name: 'Water', description: 'Daily goal, today’s intake and the last 7 days.' },
  { key: 'mealPlan', name: 'Today’s meal plan', description: 'Meals and items from your planner, with totals.' },
  { key: 'workout', name: 'My workout', description: 'Exercises with sets, reps and completion status.' },
  { key: 'painLog', name: 'Recent pain log', description: 'Your last five self-reported entries.' },
]

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  profile: true,
  bmi: true,
  energy: true,
  water: true,
  mealPlan: true,
  workout: true,
  painLog: true,
}

export function SummaryTab() {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)
  const items = useWorkoutStore((state) => state.items)
  const entries = usePainLogStore((state) => state.entries)
  const hydrationLog = useHydrationStore((state) => state.log)
  const plan = useMealPlanStore((state) => state.plan)

  const [sections, setSections] = useState<Record<SectionKey, boolean>>(DEFAULT_SECTIONS)
  const [isGenerating, setIsGenerating] = useState(false)

  const summary = useMemo(() => buildNutritionSummary(profile), [profile])
  const week = useMemo(() => hydrationWeekSeries(hydrationLog, summary.waterMl), [hydrationLog, summary.waterMl])
  const todayTotal = week.length > 0 ? week[week.length - 1].amountMl : 0
  const weekHasData = week.some((day) => day.amountMl > 0)

  if (!hydrated || !isProfileComplete(profile)) {
    return hydrated ? (
      <ProfileRequiredState />
    ) : (
      <div className="h-40 animate-pulse rounded-xl bg-white/5" aria-busy="true" />
    )
  }

  const hints: Record<SectionKey, string> = {
    profile: 'Profile complete',
    bmi: `${summary.bmi.value.toFixed(1)} · ${summary.bmi.categoryLabel}`,
    energy: `${Math.round(summary.energy.targetKcal).toLocaleString()} kcal target`,
    water: weekHasData ? `${formatMl(todayTotal)} today` : 'No entries yet',
    mealPlan: plan !== null ? `${plan.mealsPerDay} meals per day` : 'Not provided yet',
    workout:
      items.length > 0 ? `${items.length} ${items.length === 1 ? 'exercise' : 'exercises'}` : 'Not provided yet',
    painLog: entries.length > 0 ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` : 'Not provided yet',
  }

  const hasData: Record<SectionKey, boolean> = {
    profile: true,
    bmi: true,
    energy: true,
    water: weekHasData,
    mealPlan: plan !== null,
    workout: items.length > 0,
    painLog: entries.length > 0,
  }

  const handleToggle = (key: SectionKey, checked: boolean): void => {
    setSections((prev) => ({ ...prev, [key]: checked }))
  }

  /** Plain, pre-formatted data for the PDF renderer (jspdf logic stays dumb). */
  const buildSnapshot = (): HealthSummarySnapshot => {
    const day = plan !== null ? plan.days[0] : undefined
    return {
      generatedAt: new Date().toISOString(),
      profile: sections.profile
        ? {
            ageLabel: profile.age !== undefined ? `${profile.age} years` : '—',
            sexLabel: profile.sex !== undefined ? SEX_LABELS[profile.sex] : '—',
            heightLabel:
              profile.heightCm !== undefined ? formatHeight(profile.heightCm, profile.unitSystem) : '—',
            weightLabel:
              profile.weightKg !== undefined ? formatWeight(profile.weightKg, profile.unitSystem) : '—',
            activityLabel:
              profile.activityLevel !== undefined ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : '—',
            goalLabel: profile.goal !== undefined ? WEIGHT_GOAL_LABELS[profile.goal] : '—',
            paceLabel: formatSummaryPace(profile),
            dietLabel: DIET_PREFERENCE_LABELS[profile.dietPreference],
            exclusionsLabel:
              profile.excludedTags.length > 0
                ? profile.excludedTags.map((tag) => DIET_TAG_LABELS[tag]).join(', ')
                : 'None',
            medicalHistoryLabel: formatMedicalHistory(
              profile.medicalConditions,
              profile.otherConditions,
            ),
          }
        : null,
      bmi: sections.bmi
        ? {
            valueLabel: summary.bmi.value.toFixed(1),
            categoryLabel: summary.bmi.categoryLabel,
            healthyRangeLabel: `${formatWeight(summary.bmi.healthyMinKg, profile.unitSystem)} – ${formatWeight(
              summary.bmi.healthyMaxKg,
              profile.unitSystem,
            )}`,
          }
        : null,
      energy: sections.energy
        ? {
            bmrLabel: `${Math.round(summary.energy.bmr).toLocaleString()} kcal`,
            tdeeLabel: `${Math.round(summary.energy.tdee).toLocaleString()} kcal`,
            targetLabel: `${Math.round(summary.energy.targetKcal).toLocaleString()} kcal`,
            deltaLabel: formatSummaryEnergyDelta(summary.energy.calorieDelta, profile.goal),
            floorApplied: summary.energy.floorApplied,
          }
        : null,
      macros: sections.energy
        ? {
            rows: [
              {
                name: 'Protein',
                gramsLabel: `${Math.round(summary.macros.protein)} g`,
                kcalLabel: `${Math.round(summary.macros.proteinKcal).toLocaleString()} kcal`,
                shareLabel: `${Math.round(summary.macros.proteinShare * 100)} %`,
              },
              {
                name: 'Carbs',
                gramsLabel: `${Math.round(summary.macros.carbs)} g`,
                kcalLabel: `${Math.round(summary.macros.carbsKcal).toLocaleString()} kcal`,
                shareLabel: `${Math.round(summary.macros.carbsShare * 100)} %`,
              },
              {
                name: 'Fat',
                gramsLabel: `${Math.round(summary.macros.fat)} g`,
                kcalLabel: `${Math.round(summary.macros.fatKcal).toLocaleString()} kcal`,
                shareLabel: `${Math.round(summary.macros.fatShare * 100)} %`,
              },
            ],
            fiberLabel: `${Math.round(summary.macros.fiber)} g`,
          }
        : null,
      water: sections.water
        ? {
            goalLabel: formatMl(summary.waterMl),
            todayLabel: formatMl(todayTotal),
            week,
          }
        : null,
      mealPlan:
        sections.mealPlan && plan !== null && day !== undefined
          ? {
              mealsPerDayLabel: `${plan.mealsPerDay} meals per day`,
              meals: day.slots.map((slot) => ({
                label: slot.label,
                itemsLabel: slot.items.length > 0 ? slot.items.map((item) => item.name).join(', ') : '—',
                kcal: Math.round(slot.totals.kcal),
                protein: Math.round(slot.totals.protein),
              })),
              totalsLabel: `${Math.round(day.totals.kcal).toLocaleString()} kcal · ${Math.round(
                day.totals.protein,
              )} g protein`,
            }
          : null,
      workout:
        sections.workout && items.length > 0
          ? items.map((item) => ({
              name: item.name,
              setsReps: `${item.sets} × ${item.reps}`,
              done: item.completed,
            }))
          : null,
      painLog:
        sections.painLog && entries.length > 0
          ? entries.slice(0, 5).map((entry) => ({
              regionLabel: REGION_BY_ID[entry.regionId]?.label ?? entry.regionId,
              severityLabel: `${entry.severity}/10`,
              dateLabel: format(new Date(entry.date), 'd MMM yyyy'),
            }))
          : null,
    }
  }

  const handleDownload = async (): Promise<void> => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const { generateHealthSummaryPdf } = await import('@/lib/pdf/healthSummary')
      await generateHealthSummaryPdf(buildSnapshot())
      toast.success('PDF downloaded')
    } catch {
      toast.error('Could not generate the PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <p className="eyebrow">Take it with you</p>
          <h2 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Your health summary
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pick the sections you want, then download a branded PDF or print this page.
        </p>
        <div className="copper-rule" aria-hidden="true" />
      </header>

      <section
        aria-labelledby="summary-sections-heading"
        className="rounded-xl border border-white/8 bg-surface/60 p-5 sm:p-6"
      >
        <h3 id="summary-sections-heading" className="font-heading text-base font-bold text-foreground">
          Sections
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Uncheck anything you do not want in the PDF or the printout — the preview below updates instantly.
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {SECTION_ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex items-start gap-3 rounded-lg border border-white/8 bg-surface-raised/50 p-3.5 transition-colors hover:border-copper/30"
            >
              <Checkbox
                id={`summary-section-${item.key}`}
                checked={sections[item.key]}
                onCheckedChange={(value) => handleToggle(item.key, value === true)}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <Label
                  htmlFor={`summary-section-${item.key}`}
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  {item.name}
                </Label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <span
                    className={
                      hasData[item.key] ? 'h-1.5 w-1.5 rounded-full bg-[#58B584]' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'
                    }
                    aria-hidden="true"
                  />
                  {hints[item.key]}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center">
          <Button
            className="bg-brand-blue text-white hover:bg-brand-blue/85"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <FileDown aria-hidden="true" />
            )}
            {isGenerating ? 'Generating PDF…' : 'Download PDF'}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground sm:ml-auto sm:max-w-52 sm:text-right">
            Printing shows only the paper preview below.
          </p>
        </div>
      </section>

      <SummaryPreview sections={sections} />

      <aside className="rounded-xl border border-white/8 bg-surface/60 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold text-foreground">Bring it into training</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Pair this summary with your 3D body map workout.
        </p>
        <Link
          href="/explore"
          className="mt-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-copper transition-colors hover:text-warm-peach focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Open the body map
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </div>
  )
}
