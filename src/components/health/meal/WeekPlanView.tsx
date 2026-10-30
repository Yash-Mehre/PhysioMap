'use client'

/**
 * Compact 7-day overview: a day-selector chip row (kcal + on-target dot per
 * day), a summary line for the selected day, and that day's meal cards with
 * working swap / servings / add-food actions. Rows are delegated to MealCard.
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CalendarCheck, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MealCard } from '@/components/health/meal/MealCard'
import { FoodSearchDialog } from '@/components/health/meal/FoodSearchDialog'
import { useMealPlanStore } from '@/store/useMealPlanStore'
import { isWithinTarget, regenerateMealSlot } from '@/lib/nutrition/mealPlanner'
import type { MealPlan, MealSlotId, PlannedFoodItem } from '@/types/nutrition'

export interface WeekPlanViewProps {
  plan: MealPlan
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function WeekPlanView({ plan }: WeekPlanViewProps) {
  const setPlan = useMealPlanStore((state) => state.setPlan)
  const addCustomItem = useMealPlanStore((state) => state.addCustomItem)
  const [selectedDay, setSelectedDay] = useState(0)
  const [searchTarget, setSearchTarget] = useState<MealSlotId | null>(null)

  const dayIndex = Math.min(selectedDay, plan.days.length - 1)
  const day = plan.days[dayIndex]
  if (!day) return null

  const handleSwap = (slotId: MealSlotId): void => {
    setPlan(regenerateMealSlot(plan, dayIndex, slotId, randomSeed()))
  }

  const handleAddFood = (item: PlannedFoodItem): void => {
    if (!searchTarget) return
    const slot = day.slots.find((entry) => entry.slotId === searchTarget)
    addCustomItem(dayIndex, searchTarget, item)
    toast.success(`Added ${item.name} to ${slot?.label ?? 'meal'}`)
    setSearchTarget(null)
  }

  return (
    <div className="space-y-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1 scroll-slim"
        role="group"
        aria-label="Choose a plan day"
      >
        {plan.days.map((entry, index) => {
          const active = index === dayIndex
          return (
            <button
              key={entry.index}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedDay(index)}
              className={`flex min-h-[44px] shrink-0 flex-col items-start gap-0.5 rounded-xl border px-3.5 py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper ${
                active
                  ? 'border-brand-blue/50 bg-brand-blue/15 text-foreground'
                  : 'border-white/8 bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="font-heading text-xs font-bold">Day {index + 1}</span>
              <span className="flex items-center gap-1.5 text-[10px]">
                {Math.round(entry.totals.kcal).toLocaleString()} kcal
                {isWithinTarget(plan, index) && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#58B584]"
                    title="Within ±5% of target"
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <CalendarCheck className="h-3.5 w-3.5 text-[#58B584]" aria-hidden="true" />
        No identical main dish on consecutive days.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-surface/60 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-heading text-sm font-bold text-foreground">Day {dayIndex + 1}</span>
          {' · '}
          <span
            className={
              isWithinTarget(plan, dayIndex)
                ? 'font-heading font-bold text-[#58B584]'
                : 'font-heading font-bold text-foreground'
            }
          >
            {Math.round(day.totals.kcal).toLocaleString()} /{' '}
            {Math.round(plan.targets.kcal).toLocaleString()} kcal
          </span>
          {' · '}
          {Math.round(day.totals.protein)} g protein · {Math.round(day.totals.carbs)} g carbs ·{' '}
          {Math.round(day.totals.fat)} g fat
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchTarget('lunch')}
          className="h-8 border-white/10 bg-transparent text-xs"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search a food
        </Button>
      </div>

      <motion.div
        key={dayIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {day.slots.map((slot) => (
          <MealCard
            key={slot.slotId}
            dayIndex={dayIndex}
            slot={slot}
            onSwap={() => handleSwap(slot.slotId)}
            onAddCustom={() => setSearchTarget(slot.slotId)}
          />
        ))}
      </motion.div>

      <FoodSearchDialog
        open={searchTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSearchTarget(null)
        }}
        onAdd={handleAddFood}
      />
    </div>
  )
}
