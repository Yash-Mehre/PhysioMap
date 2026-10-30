'use client'

/**
 * Optional Open Food Facts search dialog: debounced query via TanStack Query,
 * per-result gram stepper (50 g steps, 50–500 g) and an Add action that hands
 * a ready-made PlannedFoodItem back to the parent. When the integration is
 * switched off the API answers `enabled: false` and we message that honestly.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Info, Minus, Plus, Search, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { nutritionService } from '@/services/nutritionService'
import type { FoodSearchResult, PlannedFoodItem } from '@/types/nutrition'

export interface FoodSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (item: PlannedFoodItem) => void
}

const DEBOUNCE_MS = 400
const MIN_QUERY_LENGTH = 2
const DEFAULT_GRAMS = 100
const GRAMS_MIN = 50
const GRAMS_MAX = 500
const GRAMS_STEP = 50

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function formatAmount(value: number): string {
  return String(Number(value.toFixed(1)))
}

export function FoodSearchDialog({ open, onOpenChange, onAdd }: FoodSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [gramsByFood, setGramsByFood] = useState<Record<string, number>>({})

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  const searchEnabled = open && debounced.length >= MIN_QUERY_LENGTH
  const { data, isPending, isError } = useQuery({
    queryKey: ['food-search', debounced],
    queryFn: () => nutritionService.searchFoods(debounced),
    enabled: searchEnabled,
    staleTime: 60_000,
  })

  const setGrams = (foodId: string, grams: number): void => {
    setGramsByFood((current) => ({ ...current, [foodId]: grams }))
  }

  const stepGrams = (result: FoodSearchResult, direction: 1 | -1): void => {
    const current = gramsByFood[result.id] ?? DEFAULT_GRAMS
    const next = Math.min(GRAMS_MAX, Math.max(GRAMS_MIN, current + direction * GRAMS_STEP))
    setGrams(result.id, next)
  }

  const handleAdd = (result: FoodSearchResult): void => {
    const grams = gramsByFood[result.id] ?? DEFAULT_GRAMS
    const servings = grams / 100
    const perServing = {
      kcal: result.kcalPer100g,
      protein: result.proteinPer100g,
      carbs: result.carbsPer100g,
      fat: result.fatPer100g,
    }
    onAdd({
      foodId: result.id,
      name: result.name,
      servingLabel: '100 g',
      servings,
      perServing,
      totals: {
        kcal: round1(perServing.kcal * servings),
        protein: round1(perServing.protein * servings),
        carbs: round1(perServing.carbs * servings),
        fat: round1(perServing.fat * servings),
      },
    })
  }

  const renderBody = (): ReactNode => {
    if (debounced.length < MIN_QUERY_LENGTH) {
      return (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">
          Type at least {MIN_QUERY_LENGTH} characters to search the Open Food Facts database.
        </p>
      )
    }

    if (searchEnabled && isPending) {
      return (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-16 bg-white/5" />
          <Skeleton className="h-16 bg-white/5" />
          <Skeleton className="h-16 bg-white/5" />
        </div>
      )
    }

    if (isError) {
      return (
        <p className="px-1 py-6 text-center text-sm text-mode-pain">
          Search is unavailable right now. Check your connection and try again.
        </p>
      )
    }

    if (data && !data.enabled) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Live food search is an optional integration and currently switched off. The meal planner
            works fully from the curated local food list.
          </p>
        </div>
      )
    }

    if (data && data.results.length === 0) {
      return (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">
          No matches found for &ldquo;{debounced}&rdquo;. Try a simpler search term.
        </p>
      )
    }

    if (data) {
      return (
        <ul className="max-h-96 space-y-2 overflow-y-auto pr-1 scroll-slim">
          {data.results.map((result) => {
            const grams = gramsByFood[result.id] ?? DEFAULT_GRAMS
            return (
              <li
                key={result.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-surface-raised/60 p-3"
              >
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt={result.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 shrink-0 rounded-lg border border-white/8 bg-white/5 object-cover"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-surface"
                    aria-hidden="true"
                  >
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                  </span>
                )}
                <div className="min-w-[140px] flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{result.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {result.brand ? `${result.brand} · ` : ''}
                    {formatAmount(result.kcalPer100g)} kcal ·{' '}
                    {formatAmount(result.proteinPer100g)} g protein ·{' '}
                    {formatAmount(result.carbsPer100g)} g carbs ·{' '}
                    {formatAmount(result.fatPer100g)} g fat
                  </p>
                </div>
                <div
                  className="flex items-center gap-1"
                  role="group"
                  aria-label={`Portion size for ${result.name}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Decrease grams for ${result.name}`}
                    disabled={grams <= GRAMS_MIN}
                    onClick={() => stepGrams(result, -1)}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span
                    className="w-11 text-center font-heading text-xs font-bold text-foreground"
                    aria-live="polite"
                  >
                    {grams} g
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Increase grams for ${result.name}`}
                    disabled={grams >= GRAMS_MAX}
                    onClick={() => stepGrams(result, 1)}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  aria-label={`Add ${result.name} to meal`}
                  onClick={() => handleAdd(result)}
                  className="h-8 bg-brand-blue text-white hover:bg-brand-blue/85"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
                </Button>
              </li>
            )
          })}
        </ul>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scroll-slim sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Search a food</DialogTitle>
          <DialogDescription className="text-xs">
            Find a packaged or branded food and add it with per-100 g nutrition data.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. paneer, oats, protein bar"
            aria-label="Search foods"
            className="border-white/10 bg-surface pl-9"
          />
        </div>

        {renderBody()}

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Nutrition data from Open Food Facts (per 100 g).
        </p>
      </DialogContent>
    </Dialog>
  )
}
