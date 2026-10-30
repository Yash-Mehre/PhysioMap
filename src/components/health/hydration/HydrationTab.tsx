'use client'

/**
 * Hydration tab — today's progress ring, quick add, today's log and the 7-day
 * history chart. Unlike the other suite tabs this works WITHOUT a complete
 * profile: the water goal falls back to 2,500 ml (with a subtle hint chip)
 * until the profile provides weight + activity level.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Droplets, Flame, Info, Plus, Sparkles, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HYDRATION_QUICK_ADDS, WATER_FALLBACK_ML } from '@/config/nutrition'
import { useHydrated } from '@/hooks/useHydrated'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { getWaterGoalMl, isProfileComplete } from '@/lib/health/profileValidation'
import { formatMl } from '@/lib/health/units'
import { hydrationDayTotal, hydrationPercent, hydrationStreak, toDateKey } from '@/lib/health/hydration'
import { useHydrationStore } from '@/store/useHydrationStore'
import { useProfileStore } from '@/store/useProfileStore'
import { HydrationRing } from '@/components/health/hydration/HydrationRing'

const HydrationHistory = dynamic(
  () => import('@/components/health/hydration/HydrationHistory').then((m) => m.HydrationHistory),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />,
  },
)

const CUSTOM_MIN_ML = 50
const CUSTOM_MAX_ML = 2000

export function HydrationTab() {
  const hydrated = useHydrated()
  const reducedMotion = usePrefersReducedMotion()
  const profile = useProfileStore((state) => state.profile)
  const log = useHydrationStore((state) => state.log)
  const addEntry = useHydrationStore((state) => state.addEntry)
  const undoLast = useHydrationStore((state) => state.undoLast)

  const [customAmount, setCustomAmount] = useState('')

  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const goalMl = useMemo(() => getWaterGoalMl(profile), [profile])
  const profileComplete = useMemo(() => isProfileComplete(profile), [profile])

  const todayEntries = log[todayKey]
  const todayTotal = hydrationDayTotal(todayEntries)
  const percent = hydrationPercent(todayTotal, goalMl)
  const goalReached = todayTotal >= goalMl
  const streak = hydrationStreak(log, goalMl)
  const hasTodayEntries = Boolean(todayEntries && todayEntries.length > 0)

  // Celebrate only when the total crosses from below the goal to at/above it
  // (a reload with the goal already met does not re-fire the toast). The chip
  // itself mounts/unmounts with `goalReached`, so its spring replays on every
  // crossing without extra state.
  const wasGoalReachedRef = useRef<boolean | null>(null)
  useEffect(() => {
    if (wasGoalReachedRef.current === false && goalReached) {
      toast.success('Hydration goal reached — great work!')
    }
    wasGoalReachedRef.current = goalReached
  }, [goalReached])

  const handleAdd = useCallback(
    (amountMl: number): void => {
      addEntry(amountMl)
      toast.success(`Added ${formatMl(amountMl)}`)
    },
    [addEntry],
  )

  const handleCustomAdd = useCallback((): void => {
    const parsed = Number(customAmount)
    if (
      customAmount.trim() === '' ||
      !Number.isFinite(parsed) ||
      parsed < CUSTOM_MIN_ML ||
      parsed > CUSTOM_MAX_ML
    ) {
      toast.error(`Enter an amount between ${CUSTOM_MIN_ML} and ${CUSTOM_MAX_ML.toLocaleString()} ml`)
      return
    }
    handleAdd(Math.round(parsed))
    setCustomAmount('')
  }, [customAmount, handleAdd])

  const handleUndo = useCallback((): void => {
    undoLast()
    toast.success('Removed the last entry')
  }, [undoLast])

  if (!hydrated) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-busy="true">
        <div className="space-y-4">
          <div className="h-80 animate-pulse rounded-xl bg-white/5" />
          <div className="h-96 animate-pulse rounded-xl bg-white/5" />
        </div>
        <div className="h-[35rem] animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!profileComplete && (
        <div className="flex items-start gap-2.5 rounded-xl border border-mode-info/20 bg-mode-info/10 px-4 py-3 text-xs leading-relaxed text-mode-info">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>
            Using a default {WATER_FALLBACK_ML.toLocaleString()} ml goal —{' '}
            <Link
              href="/health?tab=profile"
              className="font-semibold underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              complete your profile
            </Link>{' '}
            for a personalized target.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left: today's ring + quick add */}
        <div className="min-w-0 space-y-4">
          <Card className="items-center gap-4 border-white/8 bg-surface/70">
            <CardHeader className="px-6">
              <CardTitle className="font-heading text-base font-bold text-foreground">
                Today&apos;s hydration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Water logged today vs your goal
              </CardDescription>
            </CardHeader>
            <CardContent className="flex w-full flex-col items-center">
              <HydrationRing totalMl={todayTotal} goalMl={goalMl} />
              {goalReached && <GoalReachedChip animated={!reducedMotion} />}
              <p className="mt-3 font-heading text-lg font-bold text-foreground">
                {todayTotal.toLocaleString()} ml{' '}
                <span className="font-normal text-muted-foreground">of {goalMl.toLocaleString()} ml</span>
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-white/10 bg-surface-raised px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {Math.round(percent)}% of goal
                </span>
                {streak > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-[#E8A94A]/25 bg-[#E8A94A]/10 px-2.5 py-1 text-[11px] font-semibold text-[#E8A94A]">
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                    {streak}-day streak
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 border-white/8 bg-surface/70">
            <CardHeader>
              <CardTitle className="font-heading text-base font-bold text-foreground">Quick add</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Log water as you drink it — entries are saved on this device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {HYDRATION_QUICK_ADDS.map((amountMl) => (
                  <Button
                    key={amountMl}
                    type="button"
                    variant="outline"
                    onClick={() => handleAdd(amountMl)}
                    aria-label={`Add ${formatMl(amountMl)} of water`}
                    className="h-11 border-white/12 bg-surface text-xs font-semibold text-foreground hover:bg-surface-raised hover:text-foreground"
                  >
                    <Droplets className="h-4 w-4 text-mode-build" aria-hidden="true" />
                    {formatMl(amountMl)}
                  </Button>
                ))}
              </div>

              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleCustomAdd()
                }}
              >
                <Label htmlFor="custom-amount" className="text-xs text-muted-foreground">
                  Custom amount
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-amount"
                    type="number"
                    inputMode="numeric"
                    min={CUSTOM_MIN_ML}
                    max={CUSTOM_MAX_ML}
                    step={50}
                    placeholder={`${CUSTOM_MIN_ML}–${CUSTOM_MAX_ML.toLocaleString()} ml`}
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    className="h-11 border-white/12 bg-surface"
                  />
                  <Button
                    type="submit"
                    className="h-11 shrink-0 bg-brand-blue px-4 text-white hover:bg-brand-blue/85"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add
                  </Button>
                </div>
              </form>

              <Button
                type="button"
                variant="ghost"
                onClick={handleUndo}
                disabled={!hasTodayEntries}
                className="h-11 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                Undo last
              </Button>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Today&apos;s log
                  </p>
                  {hasTodayEntries && (
                    <p className="text-[11px] text-muted-foreground">
                      {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}
                    </p>
                  )}
                </div>
                {hasTodayEntries ? (
                  <ul
                    className="max-h-72 space-y-1.5 overflow-y-auto scroll-slim pr-1"
                    aria-label="Water logged today, newest first"
                  >
                    {todayEntries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-surface-raised/60 px-3 py-2.5"
                      >
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mode-build/80" aria-hidden="true" />
                          {format(new Date(entry.timestamp), 'h:mm a')}
                        </span>
                        <span className="font-heading text-sm font-semibold text-foreground">
                          {entry.amountMl.toLocaleString()} ml
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-dashed border-white/12 px-3 py-4 text-center text-xs text-muted-foreground">
                    Nothing logged yet today.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: 7-day history */}
        <div className="min-w-0">
          <HydrationHistory log={log} goalMl={goalMl} />
        </div>
      </div>
    </div>
  )
}

/** "Goal reached!" celebration chip — springs in whenever it mounts. */
function GoalReachedChip({ animated }: { animated: boolean }) {
  const className =
    'mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#58B584]/30 bg-[#58B584]/10 px-3.5 py-1.5 text-xs font-semibold text-[#58B584]'

  if (!animated) {
    return (
      <span className={className}>
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Goal reached!
      </span>
    )
  }

  return (
    <motion.span
      initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      className={className}
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      Goal reached!
    </motion.span>
  )
}
