'use client'

/**
 * Health & Nutrition Suite shell: URL-synced tabs (`?tab=`) plus the
 * persistent key-numbers card (BMI · daily calories · water goal) shown once
 * a profile exists. Each tab is a self-contained component reading its own
 * stores.
 */

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Flame, HeartPulse, Droplets } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_HEALTH_TAB, HEALTH_TABS, isHealthTabId } from '@/config/healthTabs'
import { buildNutritionSummary, isProfileComplete } from '@/lib/health/profileValidation'
import { formatMl } from '@/lib/health/units'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import { ProfileTab } from '@/components/health/ProfileTab'
import { CalculatorsTab } from '@/components/health/CalculatorsTab'
import { MealPlannerTab } from '@/components/health/meal/MealPlannerTab'
import { HydrationTab } from '@/components/health/hydration/HydrationTab'
import { SummaryTab } from '@/components/health/summary/SummaryTab'

export function HealthSuiteClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useHydrated()

  const profile = useProfileStore((state) => state.profile)
  const complete = isProfileComplete(profile)
  const summary = useMemo(() => (complete ? buildNutritionSummary(profile) : null), [complete, profile])

  const rawTab = searchParams.get('tab')
  const tab = isHealthTabId(rawTab) ? rawTab : DEFAULT_HEALTH_TAB

  const handleTabChange = (value: string): void => {
    router.replace(`/health?tab=${value}`, { scroll: false })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 space-y-3">
        <div>
          <p className="eyebrow">Health &amp; Nutrition Suite</p>
          <h1 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Your numbers, your plan, one page
          </h1>
        </div>
        <div className="copper-rule" aria-hidden="true" />
        <KeyNumbers hydrated={hydrated} complete={complete} summary={summary} />
      </header>

      <Tabs value={tab} onValueChange={handleTabChange} className="gap-6">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-white/8 bg-surface p-1.5 scroll-slim">
          {HEALTH_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="px-4 py-2 text-xs font-semibold data-[state=active]:bg-brand-blue data-[state=active]:text-white sm:text-sm"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="calculators" className="mt-0 focus-visible:outline-none">
          <CalculatorsTab />
        </TabsContent>
        <TabsContent value="planner" className="mt-0 focus-visible:outline-none">
          <MealPlannerTab />
        </TabsContent>
        <TabsContent value="hydration" className="mt-0 focus-visible:outline-none">
          <HydrationTab />
        </TabsContent>
        <TabsContent value="summary" className="mt-0 focus-visible:outline-none">
          <SummaryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Persistent card with the three key numbers (BMI · calories · water). */
function KeyNumbers({
  hydrated,
  complete,
  summary,
}: {
  hydrated: boolean
  complete: boolean
  summary: ReturnType<typeof buildNutritionSummary> | null
}) {
  const unitSystem = useProfileStore((state) => state.profile.unitSystem)

  if (!hydrated) {
    return (
      <div className="grid gap-3 sm:grid-cols-3" aria-busy="true">
        <Skeleton className="h-20 bg-white/5" />
        <Skeleton className="h-20 bg-white/5" />
        <Skeleton className="h-20 bg-white/5" />
      </div>
    )
  }

  if (!complete || !summary) {
    return (
      <p className="rounded-xl border border-white/8 bg-surface/60 px-4 py-3 text-sm text-muted-foreground">
        Complete your profile to unlock BMI, daily calorie and water targets across this suite.
      </p>
    )
  }

  const items = [
    {
      icon: HeartPulse,
      label: 'BMI',
      value: summary.bmi.value.toFixed(1),
      detail: summary.bmi.categoryLabel,
      tint: 'text-mode-pain',
    },
    {
      icon: Flame,
      label: 'Daily calories',
      value: `${summary.energy.targetKcal.toLocaleString()} kcal`,
      detail:
        summary.energy.floorApplied
          ? 'Safety floor applied'
          : `TDEE ${summary.energy.tdee.toLocaleString()} kcal`,
      tint: 'text-copper',
    },
    {
      icon: Droplets,
      label: 'Water goal',
      value: formatMl(summary.waterMl),
      detail: unitSystem === 'imperial' ? '≈ 35 ml per kg + activity' : '35 ml per kg + activity',
      tint: 'text-mode-build',
    },
  ] as const

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-surface/70 px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-raised">
            <item.icon className={`h-4.5 w-4.5 ${item.tint}`} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
            <p className="font-heading text-lg font-bold leading-tight text-foreground">{item.value}</p>
            <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
