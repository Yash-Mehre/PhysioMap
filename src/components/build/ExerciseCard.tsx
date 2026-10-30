'use client'

/** Exercise card with goal-based set scheme, muscle chips and hover highlights. */

import { Info, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExerciseDetail } from '@/components/build/ExerciseDetail'
import { REGION_BY_ID } from '@/config/regions'
import { EQUIPMENT_LABELS, LEVEL_LABELS } from '@/config/labels'
import { LEVEL_COLORS } from '@/config/theme'
import { getSetScheme } from '@/lib/build/setSchemes'
import { useExplorerStore } from '@/store/useExplorerStore'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import type { Exercise, TrainingGoal } from '@/types'

export interface ExerciseCardProps {
  exercise: Exercise
  goal: TrainingGoal
}

export function ExerciseCard({ exercise, goal }: ExerciseCardProps) {
  const setExerciseHighlight = useExplorerStore((state) => state.setExerciseHighlight)
  const clearExerciseHighlight = useExplorerStore((state) => state.clearExerciseHighlight)
  const addItem = useWorkoutStore((state) => state.addItem)
  const scheme = getSetScheme(goal)

  const highlight = (): void =>
    setExerciseHighlight({
      exerciseId: exercise.id,
      primaryRegionId: exercise.regionId,
      secondaryRegionIds: exercise.secondaryRegionIds,
      antagonistRegionIds: [],
    })

  const handleAdd = (): void => {
    addItem(exercise, goal)
    toast.success(`Added “${exercise.name}” to your workout`)
  }

  return (
    <article
      className="group rounded-xl border border-white/8 bg-surface-raised/60 p-3.5 transition-all duration-200 hover:border-mode-build/40 hover:bg-surface-raised"
      onMouseEnter={highlight}
      onFocus={highlight}
      onMouseLeave={clearExerciseHighlight}
      onBlur={clearExerciseHighlight}
      tabIndex={0}
      aria-label={`${exercise.name} exercise`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{exercise.name}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            <span
              className="font-semibold"
              style={{ color: LEVEL_COLORS[exercise.level] }}
            >
              {LEVEL_LABELS[exercise.level]}
            </span>
            <span aria-hidden="true">·</span>
            <span>{EQUIPMENT_LABELS[exercise.equipment]}</span>
            <span aria-hidden="true">·</span>
            <span className="text-mode-build">
              {scheme.setsRange} × {scheme.repsRange}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ExerciseDetail exercise={exercise} goal={goal}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Details for ${exercise.name}`}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Info className="h-4 w-4" />
            </Button>
          </ExerciseDetail>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Add ${exercise.name} to workout`}
            className="h-8 w-8 rounded-full text-mode-build hover:bg-mode-build/15"
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className="border-mode-build/40 bg-mode-build/10 px-2 py-0 text-[10px] font-medium text-mode-build"
        >
          {REGION_BY_ID[exercise.regionId].label}
        </Badge>
        {exercise.secondaryRegionIds.map((regionId) => (
          <Badge
            key={regionId}
            variant="outline"
            className="border-white/10 bg-white/5 px-2 py-0 text-[10px] font-medium text-muted-foreground"
          >
            + {REGION_BY_ID[regionId].label}
          </Badge>
        ))}
      </div>
    </article>
  )
}
