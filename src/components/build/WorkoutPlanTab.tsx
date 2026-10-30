'use client'

/** My Workout tab: editable plan across regions with duration estimate + preview. */

import { toast } from 'sonner'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { REGION_BY_ID } from '@/config/regions'
import { estimateWorkoutSeconds, formatDuration } from '@/lib/build/workoutEstimate'
import { useExplorerStore } from '@/store/useExplorerStore'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import { useWorkoutStore } from '@/store/useWorkoutStore'

export function WorkoutPlanTab() {
  const hydrated = useHydrated()
  const items = useWorkoutStore((state) => state.items)
  const updateItem = useWorkoutStore((state) => state.updateItem)
  const moveItem = useWorkoutStore((state) => state.moveItem)
  const removeItem = useWorkoutStore((state) => state.removeItem)
  const clearAll = useWorkoutStore((state) => state.clearAll)
  const goal = useProfileStore((state) => state.profile.trainingGoal)
  const workoutPreview = useExplorerStore((state) => state.workoutPreview)
  const setWorkoutPreview = useExplorerStore((state) => state.setWorkoutPreview)

  if (!hydrated) {
    return <div className="h-24 animate-pulse rounded-xl bg-white/5" aria-busy="true" />
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/12 p-6 text-center">
        <p className="text-sm font-medium text-foreground">Your workout plan is empty</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Browse any region in Build mode and tap the “+” on an exercise to add it here. Your plan is saved on
          this device.
        </p>
      </div>
    )
  }

  const totalSets = items.reduce((sum, item) => sum + item.sets, 0)
  const completed = items.filter((item) => item.completed).length
  const estimate = estimateWorkoutSeconds({ totalSets, goal })

  const handleClear = (): void => {
    clearAll()
    setWorkoutPreview(false)
    toast.success('Workout cleared')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-heading text-lg font-bold text-foreground">{items.length}</span> exercises
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
            ≈ {formatDuration(estimate)}
          </span>
          <span className="hidden sm:inline">
            {completed}/{items.length} done
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="preview-muscles"
              checked={workoutPreview}
              onCheckedChange={setWorkoutPreview}
              aria-label="Preview muscles worked on the body"
            />
            <Label htmlFor="preview-muscles" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {workoutPreview ? (
                <Eye className="h-3.5 w-3.5 text-mode-build" aria-hidden="true" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Preview muscles
            </Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 text-xs text-mode-pain hover:bg-mode-pain/10 hover:text-mode-pain"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Clear all
          </Button>
        </div>
      </div>

      <ol className="space-y-2.5">
        {items.map((item, index) => (
          <li
            key={item.exerciseId}
            className={`rounded-xl border p-3.5 transition-colors duration-150 ${
              item.completed
                ? 'border-mode-build/25 bg-mode-build/8'
                : 'border-white/8 bg-surface-raised/60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${
                    item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {REGION_BY_ID[item.regionId].label}
                  {item.secondaryRegionIds.length > 0
                    ? ` + ${item.secondaryRegionIds.map((id) => REGION_BY_ID[id].label).join(', ')}`
                    : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${item.name} up`}
                  disabled={index === 0}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => moveItem(item.exerciseId, -1)}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${item.name} down`}
                  disabled={index === items.length - 1}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => moveItem(item.exerciseId, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.name}`}
                  className="h-7 w-7 rounded-full text-mode-pain hover:bg-mode-pain/10"
                  onClick={() => removeItem(item.exerciseId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <Stepper
                label="Sets"
                value={item.sets}
                onDecrement={() => updateItem(item.exerciseId, { sets: Math.max(1, item.sets - 1) })}
                onIncrement={() => updateItem(item.exerciseId, { sets: Math.min(12, item.sets + 1) })}
              />
              <Stepper
                label="Reps"
                value={item.reps}
                onDecrement={() => updateItem(item.exerciseId, { reps: Math.max(1, item.reps - 1) })}
                onIncrement={() => updateItem(item.exerciseId, { reps: Math.min(50, item.reps + 1) })}
              />
              <button
                type="button"
                onClick={() => updateItem(item.exerciseId, { completed: !item.completed })}
                aria-pressed={item.completed}
                className="ml-auto flex touch-target items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
              >
                {item.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-mode-build" aria-hidden="true" />
                ) : (
                  <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {item.completed ? 'Done' : 'Mark done'}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Stepper({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string
  value: number
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`${label} for exercise`}>
      <span className="w-8 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Decrease ${label}`}
        className="h-7 w-7 border-white/10 bg-surface"
        onClick={onDecrement}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-7 text-center font-heading text-sm font-bold text-foreground" aria-live="polite">
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Increase ${label}`}
        className="h-7 w-7 border-white/10 bg-surface"
        onClick={onIncrement}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
