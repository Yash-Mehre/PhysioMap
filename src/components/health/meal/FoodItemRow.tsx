'use client'

/**
 * One food line inside a meal card: name, serving text, macro totals and a
 * servings stepper (0.5–2.5 for planner items; 50 g steps in grams for
 * custom Open Food Facts items) plus a remove action.
 */

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SERVING_MAX, SERVING_MIN } from '@/config/nutrition'
import type { PlannedFoodItem } from '@/types/nutrition'

export interface FoodItemRowProps {
  item: PlannedFoodItem
  onServingsChange: (servings: number) => void
  onRemove: () => void
}

/** Custom items come from Open Food Facts and carry an `off:`-prefixed id. */
const CUSTOM_PREFIX = 'off:'
const STEP = 0.5
const CUSTOM_MAX_SERVINGS = 10

function isCustomItem(item: PlannedFoodItem): boolean {
  return item.foodId.startsWith(CUSTOM_PREFIX)
}

/** Trim FP noise: 1 → "1", 1.5 → "1.5", 22.25 → "22.3". */
function formatAmount(value: number): string {
  return String(Number(value.toFixed(1)))
}

export function FoodItemRow({ item, onServingsChange, onRemove }: FoodItemRowProps) {
  const custom = isCustomItem(item)
  const max = custom ? CUSTOM_MAX_SERVINGS : SERVING_MAX

  const stepServings = (direction: 1 | -1): void => {
    const next = Math.min(
      max,
      Math.max(SERVING_MIN, Math.round((item.servings + direction * STEP) * 10) / 10),
    )
    onServingsChange(next)
  }

  const servingText =
    item.servings === 1 ? item.servingLabel : `${formatAmount(item.servings)} × ${item.servingLabel}`

  const decreaseLabel = custom
    ? `Decrease grams of ${item.name}`
    : `Decrease servings of ${item.name}`
  const increaseLabel = custom
    ? `Increase grams of ${item.name}`
    : `Increase servings of ${item.name}`

  return (
    <div className="flex items-start justify-between gap-2.5 rounded-lg bg-surface/70 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">{item.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{servingText}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {formatAmount(item.totals.kcal)} kcal · {formatAmount(item.totals.protein)} g protein ·{' '}
          {formatAmount(item.totals.carbs)} g carbs · {formatAmount(item.totals.fat)} g fat
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 pt-0.5">
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label={custom ? `Grams of ${item.name}` : `Servings of ${item.name}`}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label={decreaseLabel}
            disabled={item.servings <= SERVING_MIN}
            onClick={() => stepServings(-1)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span
            className="w-12 text-center font-heading text-xs font-bold text-foreground"
            aria-live="polite"
          >
            {custom ? `${Math.round(item.servings * 100)} g` : `×${formatAmount(item.servings)}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={increaseLabel}
            disabled={item.servings >= max}
            onClick={() => stepServings(1)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
          className="h-7 w-7 rounded-full text-mode-pain hover:bg-mode-pain/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
