'use client'

/**
 * Card for a single meal slot: label, kcal vs target (green when within the
 * ±5 % tolerance), a Swap action, the food rows (servings steppers wired to
 * the meal-plan store) and an "Add food" entry point for the search dialog.
 */

import { motion } from 'framer-motion'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FoodItemRow } from '@/components/health/meal/FoodItemRow'
import { useMealPlanStore } from '@/store/useMealPlanStore'
import { TARGET_TOLERANCE } from '@/config/nutrition'
import type { MealSlotPlan } from '@/types/nutrition'

export interface MealCardProps {
  dayIndex: number
  slot: MealSlotPlan
  onSwap: () => void
  onAddCustom: () => void
}

export function MealCard({ dayIndex, slot, onSwap, onAddCustom }: MealCardProps) {
  const updateItemServings = useMealPlanStore((state) => state.updateItemServings)
  const removeItem = useMealPlanStore((state) => state.removeItem)

  const withinTolerance =
    slot.targetKcal > 0 &&
    Math.abs(slot.totals.kcal - slot.targetKcal) / slot.targetKcal <= TARGET_TOLERANCE

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col rounded-xl border border-white/8 bg-surface-raised/60 p-4"
      aria-label={`${slot.label} meal`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-heading text-sm font-bold text-foreground">{slot.label}</h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            <span
              className={`font-heading text-sm font-bold ${
                withinTolerance ? 'text-[#58B584]' : 'text-muted-foreground'
              }`}
            >
              {Math.round(slot.totals.kcal).toLocaleString()}
            </span>{' '}
            / {Math.round(slot.targetKcal).toLocaleString()} kcal
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Swap ${slot.label}`}
          onClick={onSwap}
          className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </header>

      <div className="mt-3 flex-1 space-y-2">
        {slot.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/12 px-3 py-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            No matching foods — try relaxing your diet or exclusions.
          </p>
        ) : (
          slot.items.map((item) => (
            <FoodItemRow
              key={item.foodId}
              item={item}
              onServingsChange={(servings) =>
                updateItemServings(dayIndex, slot.slotId, item.foodId, servings)
              }
              onRemove={() => removeItem(dayIndex, slot.slotId, item.foodId)}
            />
          ))
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        aria-label={`Add food to ${slot.label}`}
        onClick={onAddCustom}
        className="mt-3 h-8 justify-start px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add food
      </Button>
    </motion.article>
  )
}
