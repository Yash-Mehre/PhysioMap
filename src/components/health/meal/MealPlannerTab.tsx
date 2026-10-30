'use client'

/**
 * Meal Planner tab: plan generation controls (meals per day, generate /
 * regenerate, Today vs 7-day view), the day totals vs target bar, meal cards
 * with servings steppers and swap, lazy-loaded charts, the optional Open Food
 * Facts search dialog and the 7-day week view. Plans persist in the
 * meal-plan store.
 */

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { CalendarRange, Loader2, RefreshCw, Search, Sparkles, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProfileRequiredState } from '@/components/health/ProfileRequiredState'
import { MealCard } from '@/components/health/meal/MealCard'
import { FoodSearchDialog } from '@/components/health/meal/FoodSearchDialog'
import { WeekPlanView } from '@/components/health/meal/WeekPlanView'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import { useMealPlanStore } from '@/store/useMealPlanStore'
import { buildNutritionSummary, isProfileComplete } from '@/lib/health/profileValidation'
import { isWithinTarget, regenerateMealSlot } from '@/lib/nutrition/mealPlanner'
import { nutritionService } from '@/services/nutritionService'
import { DIET_PREFERENCE_LABELS, DIET_TAG_LABELS, WEIGHT_GOAL_LABELS } from '@/config/labels'
import { MEAL_PLAN_NOTE, TARGET_TOLERANCE } from '@/config/nutrition'
import { MEALS_PER_DAY_OPTIONS } from '@/config/healthSchemas'
import type {
  MealPlan,
  MealSlotId,
  MealsPerDay,
  NutritionTargets,
  PlannedFoodItem,
} from '@/types/nutrition'

const PlanCharts = dynamic(() => import('@/components/health/meal/PlanCharts').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-hidden="true" />,
})

type PlanView = 'today' | 'week'

interface TargetRow {
  key: 'kcal' | 'protein' | 'carbs' | 'fat'
  label: string
  actual: number
  target: number
  unit: string
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

/** One "1,890 / 2,625 kcal" progress row, color-coded over / within / under. */
function TargetProgressRow({ row }: { row: TargetRow }) {
  const ratio = row.target > 0 ? row.actual / row.target : 0
  const within = Math.abs(ratio - 1) <= TARGET_TOLERANCE
  const over = ratio > 1 + TARGET_TOLERANCE
  const valueClass = over ? 'text-mode-pain' : within ? 'text-[#58B584]' : 'text-mode-build'
  const barClass = over ? 'bg-mode-pain' : within ? 'bg-[#58B584]' : 'bg-mode-build'
  const widthPct = Math.min(100, Math.max(2, ratio * 100))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {row.label}
        </span>
        <span className="text-xs text-muted-foreground">
          <span className={`font-heading text-sm font-bold ${valueClass}`}>
            {Math.round(row.actual).toLocaleString()}
          </span>{' '}
          / {Math.round(row.target).toLocaleString()} {row.unit}
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(row.target)}
        aria-valuenow={Math.round(row.actual)}
        aria-label={`${row.label}: ${Math.round(row.actual)} of ${Math.round(row.target)} ${row.unit}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barClass}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}

/** Day-0 view: totals vs target, meal cards and the lazy-loaded charts. */
function TodayView({
  plan,
  onSwapSlot,
  onOpenSearch,
}: {
  plan: MealPlan
  onSwapSlot: (dayIndex: number, slotId: MealSlotId) => void
  onOpenSearch: (slotId: MealSlotId) => void
}) {
  const day = plan.days[0]
  if (!day) return null

  const targetRows: TargetRow[] = [
    { key: 'kcal', label: 'Calories', actual: day.totals.kcal, target: plan.targets.kcal, unit: 'kcal' },
    { key: 'protein', label: 'Protein', actual: day.totals.protein, target: plan.targets.protein, unit: 'g' },
    { key: 'carbs', label: 'Carbs', actual: day.totals.carbs, target: plan.targets.carbs, unit: 'g' },
    { key: 'fat', label: 'Fat', actual: day.totals.fat, target: plan.targets.fat, unit: 'g' },
  ]

  return (
    <>
      <section
        className="rounded-xl border border-white/8 bg-surface/60 p-4 sm:p-5"
        aria-label="Today's totals versus target"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-heading text-sm font-bold text-foreground">Today</h3>
            {isWithinTarget(plan, 0) && (
              <span className="rounded-full border border-[#58B584]/30 bg-[#58B584]/15 px-2.5 py-1 text-[10px] font-semibold text-[#58B584]">
                Within ±5% of target
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenSearch('lunch')}
            className="h-8 border-white/10 bg-transparent text-xs"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search a food
          </Button>
        </div>
        <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {targetRows.map((row) => (
            <TargetProgressRow key={row.key} row={row} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {day.slots.map((slot) => (
          <MealCard
            key={slot.slotId}
            dayIndex={0}
            slot={slot}
            onSwap={() => onSwapSlot(0, slot.slotId)}
            onAddCustom={() => onOpenSearch(slot.slotId)}
          />
        ))}
      </div>

      <PlanCharts plan={plan} dayIndex={0} />
    </>
  )
}

export function MealPlannerTab() {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)
  const plan = useMealPlanStore((state) => state.plan)
  const setPlan = useMealPlanStore((state) => state.setPlan)
  const addCustomItem = useMealPlanStore((state) => state.addCustomItem)

  const [mealsPerDay, setMealsPerDay] = useState<MealsPerDay>(5)
  const [mealsTouched, setMealsTouched] = useState(false)
  const [view, setView] = useState<PlanView>('today')
  const [generating, setGenerating] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTarget, setSearchTarget] = useState<MealSlotId | null>(null)

  const complete = isProfileComplete(profile)
  const summary = useMemo(
    () => (complete ? buildNutritionSummary(profile) : null),
    [complete, profile],
  )

  const handleMealsChange = (value: string): void => {
    const parsed = Number(value)
    if ((MEALS_PER_DAY_OPTIONS as readonly number[]).includes(parsed)) {
      setMealsPerDay(parsed as MealsPerDay)
      setMealsTouched(true)
    }
  }

  const handleViewChange = (value: string): void => {
    if (value === 'today' || value === 'week') setView(value)
  }

  const handleGenerate = async (): Promise<void> => {
    if (!summary || generating) return
    setGenerating(true)
    try {
      const targets: NutritionTargets = {
        kcal: summary.energy.targetKcal,
        protein: summary.macros.protein,
        carbs: summary.macros.carbs,
        fat: summary.macros.fat,
        fiber: summary.macros.fiber,
      }
      const generated = await nutritionService.generateMealPlan({
        targets,
        diet: profile.dietPreference,
        exclusions: profile.excludedTags,
        mealsPerDay,
        seed: randomSeed(),
        days: view === 'week' ? 7 : 1,
      })
      setPlan(generated)
      toast.success(view === 'week' ? '7-day plan generated' : 'Meal plan generated')
    } catch {
      toast.error('Could not generate a plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleSwapSlot = (dayIndex: number, slotId: MealSlotId): void => {
    if (!plan) return
    setPlan(regenerateMealSlot(plan, dayIndex, slotId, randomSeed()))
  }

  const openSearch = (slotId: MealSlotId): void => {
    setSearchTarget(slotId)
    setSearchOpen(true)
  }

  const handleAddFood = (item: PlannedFoodItem): void => {
    if (!plan || !searchTarget) return
    const slot = plan.days[0]?.slots.find((entry) => entry.slotId === searchTarget)
    addCustomItem(0, searchTarget, item)
    toast.success(`Added ${item.name} to ${slot?.label ?? 'meal'}`)
    setSearchOpen(false)
    setSearchTarget(null)
  }

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-28 animate-pulse rounded-xl bg-white/5" />
        <div className="h-64 animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  if (!complete || !summary) {
    return <ProfileRequiredState />
  }

  const goal = profile.goal ?? 'maintain'
  const mealsHint =
    plan !== null && mealsTouched && plan.mealsPerDay !== mealsPerDay
      ? 'Regenerate to apply the new meal count.'
      : null

  return (
    <div className="space-y-4">
      <section
        className="rounded-xl border border-white/8 bg-surface/60 p-4 sm:p-5"
        aria-label="Meal plan controls"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-40">
            <Label
              htmlFor="meals-per-day"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Meals per day
            </Label>
            <Select value={String(mealsPerDay)} onValueChange={handleMealsChange}>
              <SelectTrigger
                id="meals-per-day"
                className="mt-1.5 w-full border-white/10 bg-surface-raised/60"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10">
                {MEALS_PER_DAY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} meals
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="bg-brand-blue text-white hover:bg-brand-blue/85"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {generating ? 'Generating…' : 'Generate plan'}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleGenerate()}
            disabled={!plan || generating}
            className="border-white/10 bg-transparent"
          >
            <RefreshCw
              className={generating ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              aria-hidden="true"
            />
            Regenerate
          </Button>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleViewChange}
            aria-label="Plan view"
            className="ml-auto"
          >
            <ToggleGroupItem
              value="today"
              aria-label="Show today's plan"
              className="px-3.5 py-2 text-xs font-semibold data-[state=on]:bg-brand-blue data-[state=on]:text-white"
            >
              Today
            </ToggleGroupItem>
            <ToggleGroupItem
              value="week"
              aria-label="Show the 7-day plan"
              className="px-3.5 py-2 text-xs font-semibold data-[state=on]:bg-brand-blue data-[state=on]:text-white"
            >
              7-day
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 pt-3.5">
          <p className="text-xs text-muted-foreground">
            Target:{' '}
            <span className="font-heading text-sm font-bold text-foreground">
              {Math.round(summary.energy.targetKcal).toLocaleString()} kcal
            </span>{' '}
            · {Math.round(summary.macros.protein)} g protein · {Math.round(summary.macros.carbs)} g
            carbs · {Math.round(summary.macros.fat)} g fat
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-white/10 bg-surface-raised/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {WEIGHT_GOAL_LABELS[goal]}
            </span>
            <span className="rounded-full border border-white/10 bg-surface-raised/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {DIET_PREFERENCE_LABELS[profile.dietPreference]}
            </span>
            {profile.excludedTags.length > 0 && (
              <span className="rounded-full border border-white/10 bg-surface-raised/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                No {profile.excludedTags.map((tag) => DIET_TAG_LABELS[tag]).join(', ')}
              </span>
            )}
          </div>
          {mealsHint && <p className="text-[11px] font-medium text-copper">{mealsHint}</p>}
        </div>
      </section>

      {plan === null ? (
        <div className="rounded-xl border border-dashed border-white/12 bg-surface/40 p-8 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-copper/30 bg-surface">
            <UtensilsCrossed className="h-5 w-5 text-copper" aria-hidden="true" />
          </span>
          <h3 className="font-heading text-base font-bold text-foreground">No plan yet</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Generate a day of meals tuned to your calorie and macro targets. Swap any meal, tune
            serving sizes, or add foods from the search dialog.
          </p>
          <Button
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="mt-4 bg-brand-blue text-white hover:bg-brand-blue/85"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {generating ? 'Generating…' : 'Generate plan'}
          </Button>
        </div>
      ) : view === 'today' ? (
        <TodayView plan={plan} onSwapSlot={handleSwapSlot} onOpenSearch={openSearch} />
      ) : plan.days.length >= 7 ? (
        <WeekPlanView plan={plan} />
      ) : (
        <div className="rounded-xl border border-dashed border-white/12 bg-surface/40 p-8 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-copper/30 bg-surface">
            <CalendarRange className="h-5 w-5 text-copper" aria-hidden="true" />
          </span>
          <h3 className="font-heading text-base font-bold text-foreground">
            Your plan covers {plan.days.length} {plan.days.length === 1 ? 'day' : 'days'}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            The 7-day view generates a fresh week-long plan tuned to the same targets. Regenerating
            replaces your current plan.
          </p>
          <Button
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="mt-4 bg-brand-blue text-white hover:bg-brand-blue/85"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {generating ? 'Generating…' : 'Generate 7-day plan'}
          </Button>
        </div>
      )}

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">{MEAL_PLAN_NOTE}</p>

      <FoodSearchDialog
        open={searchOpen}
        onOpenChange={(open) => {
          setSearchOpen(open)
          if (!open) setSearchTarget(null)
        }}
        onAdd={handleAddFood}
      />
    </div>
  )
}
