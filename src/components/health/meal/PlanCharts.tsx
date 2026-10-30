'use client'

/**
 * Two Recharts visualizations for one plan day (lazy-loaded by the planner):
 * 1. a double donut — outer ring is the day's macro energy split, inner ring
 *    the target split — with a grams/target legend, and
 * 2. a calories-per-meal bar chart with a thin "Target" bar series.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MACRO_KCAL_PER_G } from '@/config/nutrition'
import type { MealPlan } from '@/types/nutrition'

export interface PlanChartsProps {
  plan: MealPlan
  dayIndex: number
}

const COLOR_PROTEIN = '#F26B4E'
const COLOR_CARBS = '#3B74F2'
const COLOR_FAT = '#F3B38A'
const COLOR_TARGET_BAR = 'rgba(255, 255, 255, 0.18)'
const GRID_STROKE = 'rgba(255, 255, 255, 0.06)'
const AXIS_TICK = { fill: '#9AA6BC', fontSize: 10 }
const DONUT_STROKE = '#0B0F17'

interface MacroSlice {
  key: 'protein' | 'carbs' | 'fat'
  label: string
  color: string
  grams: number
  targetGrams: number
  kcal: number
  targetKcal: number
}

interface TooltipEntry {
  name?: string | number
  value?: number | string
  color?: string
}

interface CaloriesTooltipProps {
  active?: boolean
  label?: string | number
  payload?: readonly TooltipEntry[]
}

/** Compact X-axis label: "Morning snack" → "AM snack", "Evening snack" → "PM snack". */
function shortSlotLabel(label: string): string {
  const lower = label.toLowerCase()
  if (lower.includes('morning')) return 'AM snack'
  if (lower.includes('evening')) return 'PM snack'
  return label
}

/** Dark tooltip used by the bar chart (kept in sync with the design tokens). */
function CaloriesTooltip({ active, payload, label }: CaloriesTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1A2233] px-3 py-2 text-xs shadow-lg">
      <p className="font-heading font-bold text-foreground">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          {entry.name}:{' '}
          <span className="font-semibold text-foreground">
            {Math.round(Number(entry.value ?? 0)).toLocaleString()} kcal
          </span>
        </p>
      ))}
    </div>
  )
}

export default function PlanCharts({ plan, dayIndex }: PlanChartsProps) {
  const day = plan.days[dayIndex] ?? plan.days[0]
  if (!day) return null

  const macroSlices: MacroSlice[] = [
    {
      key: 'protein',
      label: 'Protein',
      color: COLOR_PROTEIN,
      grams: day.totals.protein,
      targetGrams: plan.targets.protein,
      kcal: day.totals.protein * MACRO_KCAL_PER_G.protein,
      targetKcal: plan.targets.protein * MACRO_KCAL_PER_G.protein,
    },
    {
      key: 'carbs',
      label: 'Carbs',
      color: COLOR_CARBS,
      grams: day.totals.carbs,
      targetGrams: plan.targets.carbs,
      kcal: day.totals.carbs * MACRO_KCAL_PER_G.carbs,
      targetKcal: plan.targets.carbs * MACRO_KCAL_PER_G.carbs,
    },
    {
      key: 'fat',
      label: 'Fat',
      color: COLOR_FAT,
      grams: day.totals.fat,
      targetGrams: plan.targets.fat,
      kcal: day.totals.fat * MACRO_KCAL_PER_G.fat,
      targetKcal: plan.targets.fat * MACRO_KCAL_PER_G.fat,
    },
  ]

  const totalMacroKcal = macroSlices.reduce((sum, slice) => sum + slice.kcal, 0)
  const slotData = day.slots.map((slot) => ({
    name: shortSlotLabel(slot.label),
    Plan: Math.round(slot.totals.kcal),
    Target: Math.round(slot.targetKcal),
  }))

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="gap-4 border-white/8 bg-surface/60 py-5">
        <CardHeader className="px-5">
          <CardTitle className="font-heading text-sm font-bold text-foreground">Macro split</CardTitle>
          <CardDescription className="text-xs">
            Inner ring: target · outer ring: this day&apos;s plan
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <div
            className="relative h-60"
            role="img"
            aria-label="Donut chart comparing the plan's protein, carb and fat energy split against the target split"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroSlices}
                  dataKey="targetKcal"
                  nameKey="label"
                  innerRadius="38%"
                  outerRadius="56%"
                  cornerRadius={4}
                  paddingAngle={2}
                  stroke={DONUT_STROKE}
                  strokeWidth={2}
                >
                  {macroSlices.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
                <Pie
                  data={macroSlices}
                  dataKey="kcal"
                  nameKey="label"
                  innerRadius="64%"
                  outerRadius="86%"
                  cornerRadius={4}
                  paddingAngle={2}
                  stroke={DONUT_STROKE}
                  strokeWidth={2}
                >
                  {macroSlices.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-heading text-xl font-extrabold text-foreground">
                {Math.round(day.totals.kcal).toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                of {Math.round(plan.targets.kcal).toLocaleString()} kcal
              </p>
            </div>
          </div>

          <ul className="mt-3 space-y-1.5">
            {macroSlices.map((slice) => {
              const sharePct =
                totalMacroKcal > 0 ? Math.round((slice.kcal / totalMacroKcal) * 100) : 0
              return (
                <li key={slice.key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    {slice.label}
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-heading font-bold text-foreground">
                      {Math.round(slice.grams).toLocaleString()}
                    </span>{' '}
                    / {Math.round(slice.targetGrams).toLocaleString()} g
                    <span className="ml-1.5 text-[10px]">· {sharePct}% of energy</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="gap-4 border-white/8 bg-surface/60 py-5">
        <CardHeader className="px-5">
          <CardTitle className="font-heading text-sm font-bold text-foreground">
            Calories per meal
          </CardTitle>
          <CardDescription className="text-xs">
            Planned calories per meal against each slot&apos;s target
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <div
            className="h-60"
            role="img"
            aria-label="Bar chart of calories per meal with each meal's target for comparison"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slotData} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={AXIS_TICK}
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={<CaloriesTooltip />}
                />
                <Bar dataKey="Plan" fill={COLOR_CARBS} maxBarSize={26} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Target" fill={COLOR_TARGET_BAR} maxBarSize={12} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: COLOR_CARBS }}
                aria-hidden="true"
              />
              Plan
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: COLOR_TARGET_BAR, border: '1px solid rgba(255,255,255,0.2)' }}
                aria-hidden="true"
              />
              Target
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
