'use client'

/**
 * Hydration history — 7-day bar chart vs goal (oldest → today). Lazy-loaded
 * client-only by `HydrationTab` via `next/dynamic`; exported as a NAMED export.
 * Today's bar is highlighted green and the goal is a dashed copper line.
 */

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { hydrationWeekSeries } from '@/lib/health/hydration'
import { formatMl } from '@/lib/health/units'
import type { HydrationDayPoint, HydrationLog } from '@/types/nutrition'

export interface HydrationHistoryProps {
  log: HydrationLog
  goalMl: number
}

const BAR_FILL = '#3B74F2'
const TODAY_FILL = '#58B584'
const GOAL_STROKE = '#D9A066'
const TICK_FILL = '#9AA6BC'

/** Minimal dark tooltip: "Mon: 1,450 ml / 2,950 ml". */
function HistoryTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
}) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]?.payload
  if (!isHydrationDayPoint(point)) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1A2233] px-3 py-2 shadow-xl">
      <p className="font-heading text-xs font-semibold text-foreground">
        {point.label}: {point.amountMl.toLocaleString()} ml / {point.goalMl.toLocaleString()} ml
      </p>
    </div>
  )
}

function isHydrationDayPoint(value: unknown): value is HydrationDayPoint {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<HydrationDayPoint>
  return (
    typeof candidate.dateKey === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.amountMl === 'number' &&
    typeof candidate.goalMl === 'number'
  )
}

export function HydrationHistory({ log, goalMl }: HydrationHistoryProps) {
  const reducedMotion = usePrefersReducedMotion()

  const series = useMemo(() => hydrationWeekSeries(log, goalMl), [log, goalMl])
  const yMax = useMemo(() => {
    const maxAmount = Math.max(goalMl, ...series.map((point) => point.amountMl))
    return Math.ceil(maxAmount / 500) * 500
  }, [series, goalMl])
  const todayIndex = series.length - 1

  return (
    <Card className="gap-4 border-white/8 bg-surface/70">
      <CardHeader>
        <CardTitle className="font-heading text-base font-bold text-foreground">Hydration history</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Last 7 days vs goal</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="h-60 w-full"
          role="img"
          aria-label={`Bar chart of daily water intake for the last 7 days against a goal of ${goalMl.toLocaleString()} ml`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                tick={{ fill: TICK_FILL, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: TICK_FILL, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(value: number) => formatMl(value)}
              />
              <ReferenceLine
                y={goalMl}
                stroke={GOAL_STROKE}
                strokeDasharray="6 6"
                label={{ value: 'Goal', position: 'insideTopRight', fill: GOAL_STROKE, fontSize: 11 }}
              />
              <Tooltip content={<HistoryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar
                dataKey="amountMl"
                radius={[6, 6, 0, 0]}
                isAnimationActive={!reducedMotion}
                animationDuration={450}
              >
                {series.map((point, index) => (
                  <Cell key={point.dateKey} fill={index === todayIndex ? TODAY_FILL : BAR_FILL} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Bars show your daily total; the copper line is your goal.
        </p>
      </CardContent>
    </Card>
  )
}
