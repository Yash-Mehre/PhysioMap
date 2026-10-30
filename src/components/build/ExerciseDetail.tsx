'use client'

/** Exercise detail dialog: steps, cues, mistakes, biomechanics, add to workout. */

import { AlertCircle, BookMarked, CheckCircle2, Dumbbell, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { REGION_BY_ID } from '@/config/regions'
import { EQUIPMENT_LABELS, LEVEL_LABELS, TRAINING_GOAL_LABELS } from '@/config/labels'
import { LEVEL_COLORS } from '@/config/theme'
import { getSetScheme } from '@/lib/build/setSchemes'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import type { Exercise, TrainingGoal } from '@/types'

export interface ExerciseDetailProps {
  exercise: Exercise
  goal: TrainingGoal
  children: React.ReactNode
}

export function ExerciseDetail({ exercise, goal, children }: ExerciseDetailProps) {
  const addItem = useWorkoutStore((state) => state.addItem)
  const scheme = getSetScheme(goal)

  const handleAdd = (): void => {
    addItem(exercise, goal)
    toast.success(`Added “${exercise.name}” to your workout`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] border-white/10 bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading pr-6">{exercise.name}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2 text-xs">
            <span className="font-semibold" style={{ color: LEVEL_COLORS[exercise.level] }}>
              {LEVEL_LABELS[exercise.level]}
            </span>
            <span aria-hidden="true">·</span>
            <span>{EQUIPMENT_LABELS[exercise.equipment]}</span>
            <span aria-hidden="true">·</span>
            <span className="text-mode-build">
              {REGION_BY_ID[exercise.regionId].label} · {TRAINING_GOAL_LABELS[goal]}: {scheme.setsRange} ×{' '}
              {scheme.repsRange}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[52vh] pr-3">
          <div className="space-y-5">
            <section aria-label="Steps">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                <Dumbbell className="h-3.5 w-3.5" aria-hidden="true" /> How to do it
              </h3>
              <ol className="space-y-2">
                {exercise.steps.map((step, index) => (
                  <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section aria-label="Form cues">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Form cues
              </h3>
              <ul className="space-y-1.5">
                {exercise.cues.map((cue, index) => (
                  <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mode-build" aria-hidden="true" />
                    {cue}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Common mistakes">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Common mistakes
              </h3>
              <ul className="space-y-1.5">
                {exercise.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mode-pain" aria-hidden="true" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Biomechanics" className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
              <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                <BookMarked className="h-3.5 w-3.5" aria-hidden="true" /> Biomechanics
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{exercise.biomechanics}</p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={handleAdd} className="bg-mode-build text-white hover:bg-mode-build/85">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Add to my workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
