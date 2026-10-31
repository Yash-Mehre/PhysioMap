'use client'

/**
 * Calculators tab of the Health & Nutrition Suite. Everything is computed
 * client-side from the persisted profile (pure functions in `src/lib/health`)
 * — no requests, no keys. Each card carries a "How is this calculated?"
 * popover with the exact formula and source.
 */

import { useMemo, useState } from 'react'
import { Activity, Droplets, Flame, HeartPulse, PieChart, Target, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BmiGauge } from '@/components/health/BmiGauge'
import { HowCalculatedPopover } from '@/components/health/HowCalculatedPopover'
import { ProfileRequiredState } from '@/components/health/ProfileRequiredState'
import { ACTIVITY_LEVEL_LABELS, WEIGHT_GOAL_LABELS } from '@/config/labels'
import {
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_LEVEL_ORDER,
  BMI_CUTOFF_LABELS,
  FORMULA_SOURCES,
  KCAL_FLOOR,
} from '@/config/nutrition'
import { calculateBmiResult } from '@/lib/health/bmi'
import { buildNutritionSummary, isProfileComplete } from '@/lib/health/profileValidation'
import { formatMl, formatWeight } from '@/lib/health/units'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import type { BmiCategoryKey, BmiCutoffs, UserProfile } from '@/types'

/** Category color coding for the BMI value and label. */
const BMI_CATEGORY_COLORS: Record<BmiCategoryKey, string> = {
  underweight: 'text-mode-info',
  normal: 'text-[#58B584]',
  overweight: 'text-[#E8A94A]',
  obese: 'text-mode-pain',
}

/** Stacked-bar colors per macro (mode colors: pain / build / info). */
const MACRO_COLORS = {
  protein: '#F26B4E',
  carbs: '#3B74F2',
  fat: '#F3B38A',
} as const

export function CalculatorsTab() {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-72 w-full bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 bg-white/5" />
          <Skeleton className="h-44 bg-white/5" />
          <Skeleton className="h-64 w-full bg-white/5 sm:col-span-2" />
          <Skeleton className="h-44 bg-white/5" />
          <Skeleton className="h-44 bg-white/5" />
        </div>
      </div>
    )
  }

  if (!isProfileComplete(profile)) {
    return <ProfileRequiredState />
  }

  return <CalculatorsPanel profile={profile} />
}

/** Results grid — rendered once the profile is complete. */
function CalculatorsPanel({ profile }: { profile: UserProfile }) {
  const [cutoffs, setCutoffs] = useState<BmiCutoffs>('who')

  // `isProfileComplete` guaranteed these; fallbacks keep strict typing happy.
  const heightCm = profile.heightCm ?? 170
  const weightKg = profile.weightKg ?? 70
  const activityLevel = profile.activityLevel ?? 'moderate'
  const goal = profile.goal ?? 'maintain'

  const summary = useMemo(() => buildNutritionSummary(profile), [profile])
  const { energy, macros, waterMl } = summary

  const bmiResult = useMemo(
    () => calculateBmiResult(weightKg, heightCm, cutoffs),
    [weightKg, heightCm, cutoffs],
  )

  const handleCutoffsChange = (value: string): void => {
    if (value === 'who' || value === 'asia-pacific') setCutoffs(value)
  }

  const calorieDelta = energy.calorieDelta
  const deltaLine =
    calorieDelta < 0
      ? `−${Math.abs(calorieDelta).toLocaleString()} kcal/day planned deficit`
      : calorieDelta > 0
        ? `+${calorieDelta.toLocaleString()} kcal/day planned surplus`
        : 'Maintenance'

  const macroRows = [
    {
      key: 'protein',
      label: 'Protein',
      grams: macros.protein,
      kcal: macros.proteinKcal,
      share: macros.proteinShare,
      color: MACRO_COLORS.protein,
    },
    {
      key: 'carbs',
      label: 'Carbs',
      grams: macros.carbs,
      kcal: macros.carbsKcal,
      share: macros.carbsShare,
      color: MACRO_COLORS.carbs,
    },
    {
      key: 'fat',
      label: 'Fat',
      grams: macros.fat,
      kcal: macros.fatKcal,
      share: macros.fatShare,
      color: MACRO_COLORS.fat,
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* ------------------------------------------------------------ BMI */}
      <Card className="border-white/8 bg-surface/70 sm:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <HeartPulse className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
            Body mass index
          </CardTitle>
          <CardDescription>Weight relative to height, with healthy-range context.</CardDescription>
          <CardAction>
            <HowCalculatedPopover title="BMI" {...FORMULA_SOURCES.bmi} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,20rem)_1fr] sm:gap-8">
            <div className="mx-auto w-full max-w-[16rem]">
              <BmiGauge value={bmiResult.value} categoryKey={bmiResult.categoryKey} />
            </div>
            <div className="space-y-3">
              <Tabs value={cutoffs} onValueChange={handleCutoffsChange}>
                <TabsList
                  aria-label="BMI cut-off set"
                  className="h-auto border border-white/8 bg-surface-raised p-1"
                >
                  <TabsTrigger
                    value="who"
                    className="px-3 py-1.5 text-[11px] font-semibold data-[state=active]:bg-brand-blue data-[state=active]:text-white"
                  >
                    {BMI_CUTOFF_LABELS.who}
                  </TabsTrigger>
                  <TabsTrigger
                    value="asia-pacific"
                    className="px-3 py-1.5 text-[11px] font-semibold data-[state=active]:bg-brand-blue data-[state=active]:text-white"
                  >
                    {BMI_CUTOFF_LABELS['asia-pacific']}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p
                className={cn(
                  'font-heading text-4xl font-extrabold tracking-tight sm:text-5xl',
                  BMI_CATEGORY_COLORS[bmiResult.categoryKey],
                )}
              >
                {bmiResult.value.toFixed(1)}
              </p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  BMI_CATEGORY_COLORS[bmiResult.categoryKey],
                )}
              >
                {bmiResult.categoryLabel}
                <span className="font-normal text-muted-foreground">
                  {' '}
                  ({BMI_CUTOFF_LABELS[cutoffs]} cut-offs)
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Healthy weight for your height:{' '}
                <span className="font-semibold text-foreground">
                  {formatWeight(bmiResult.healthyMinKg, profile.unitSystem)}–
                  {formatWeight(bmiResult.healthyMaxKg, profile.unitSystem)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                BMI is a screening tool, not a diagnosis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------ BMR */}
      <Card className="border-white/8 bg-surface/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <Flame className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
            Basal metabolic rate
          </CardTitle>
          <CardDescription>Calories burned at complete rest.</CardDescription>
          <CardAction>
            <HowCalculatedPopover title="BMR" {...FORMULA_SOURCES.bmr} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            {energy.bmr.toLocaleString()}{' '}
            <span className="text-base font-semibold text-muted-foreground">kcal / day</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Mifflin-St Jeor estimate — the baseline every other number on this page builds on.
          </p>
        </CardContent>
      </Card>

      {/* --------------------------------------------- Daily calorie target */}
      <Card className="border-white/8 bg-surface/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <Target className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
            Daily calorie target
          </CardTitle>
          <CardDescription>
            Planned against your TDEE of {energy.tdee.toLocaleString()} kcal.
          </CardDescription>
          <CardAction>
            <HowCalculatedPopover title="Daily calorie target" {...FORMULA_SOURCES.calorieTarget} />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
              {energy.targetKcal.toLocaleString()}{' '}
              <span className="text-base font-semibold text-muted-foreground">kcal / day</span>
            </p>
            <Badge className="border-copper/30 bg-copper/10 text-copper">
              {WEIGHT_GOAL_LABELS[goal]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{deltaLine}</p>
          {energy.floorApplied && (
            <Alert className="border-[#E8A94A]/40 text-[#E8A94A]">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Safety floor applied</AlertTitle>
              <AlertDescription className="text-[#E8A94A]/85">
                This target was raised to the safety floor of {KCAL_FLOOR.male.toLocaleString()} kcal
                ({KCAL_FLOOR.female.toLocaleString()} kcal for female profiles). Very low calorie
                intakes should be supervised by a professional.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------- TDEE */}
      <Card className="border-white/8 bg-surface/70 sm:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <Activity className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
            Total daily energy expenditure
          </CardTitle>
          <CardDescription>
            Daily burn at every activity level — BMR × factor. Your current level is highlighted.
          </CardDescription>
          <CardAction>
            <HowCalculatedPopover title="TDEE" {...FORMULA_SOURCES.tdee} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Activity level
                </TableHead>
                <TableHead className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:table-cell">
                  Typical week
                </TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  kcal / day
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVITY_LEVEL_ORDER.map((level) => {
                const isCurrent = level === activityLevel
                return (
                  <TableRow
                    key={level}
                    className={cn(isCurrent && 'bg-brand-blue/10 hover:bg-brand-blue/10')}
                  >
                    <TableCell
                      className={cn(
                        'py-3.5 text-sm',
                        isCurrent
                          ? 'border-l-2 border-brand-blue font-bold text-foreground'
                          : 'text-foreground/80',
                      )}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        {ACTIVITY_LEVEL_LABELS[level]}
                        {isCurrent && <Badge>Your level</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3.5 text-xs text-muted-foreground sm:table-cell">
                      {ACTIVITY_DESCRIPTIONS[level]}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'py-3.5 text-right font-heading text-sm tabular-nums',
                        isCurrent ? 'font-bold text-foreground' : 'text-foreground/80',
                      )}
                    >
                      {energy.tdeeByLevel[level].toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------- Macros */}
      <Card className="border-white/8 bg-surface/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <PieChart className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
            Macro targets
          </CardTitle>
          <CardDescription>
            Split of your {energy.targetKcal.toLocaleString()} kcal daily target.
          </CardDescription>
          <CardAction>
            <HowCalculatedPopover title="Macro targets" {...FORMULA_SOURCES.macros} />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5"
            role="img"
            aria-label={`Energy split: protein ${Math.round(macros.proteinShare * 100)}%, carbs ${Math.round(
              macros.carbsShare * 100,
            )}%, fat ${Math.round(macros.fatShare * 100)}%`}
          >
            {macroRows.map((row) => (
              <div
                key={row.key}
                className="h-full basis-0"
                style={{ backgroundColor: row.color, flexGrow: row.share }}
              />
            ))}
          </div>
          <div className="space-y-2.5">
            {macroRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{row.grams} g</span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  {row.kcal.toLocaleString()} kcal
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-semibold text-foreground">
                    {Math.round(row.share * 100)}%
                  </span>
                </span>
              </div>
            ))}
          </div>
          <Separator className="bg-white/8" />
          <p className="text-xs text-muted-foreground">
            Fiber goal: <span className="font-semibold text-foreground">{macros.fiber} g/day</span>
          </p>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------- Water */}
      <Card className="border-white/8 bg-surface/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <Droplets className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
            Daily water target
          </CardTitle>
          <CardDescription>35 ml per kg + activity bonus.</CardDescription>
          <CardAction>
            <HowCalculatedPopover title="Water target" {...FORMULA_SOURCES.water} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            {formatMl(waterMl)}{' '}
            <span className="text-base font-semibold text-muted-foreground">/ day</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            ≈ {waterMl.toLocaleString()} ml — sip through the day rather than chugging it at once.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
