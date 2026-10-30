'use client'

/** Build mode panel: Exercises / Muscle Science / My Workout tabs. */

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BuildFilters, type BuildFilterState } from '@/components/build/BuildFilters'
import { ExerciseCard } from '@/components/build/ExerciseCard'
import { MuscleScienceTab } from '@/components/build/MuscleScienceTab'
import { WorkoutPlanTab } from '@/components/build/WorkoutPlanTab'
import { getSetScheme } from '@/lib/build/setSchemes'
import { useProfileStore } from '@/store/useProfileStore'
import type { Exercise, RegionContent } from '@/types'

export interface BuildPanelProps {
  content: RegionContent
}

export function BuildPanel({ content }: BuildPanelProps) {
  const profile = useProfileStore((state) => state.profile)
  const [filters, setFilters] = useState<BuildFilterState>({
    level: 'any',
    equipment: profile.equipment,
    goal: profile.trainingGoal,
  })

  const scheme = getSetScheme(filters.goal)

  const visibleExercises = useMemo(
    () =>
      content.build.exercises.filter(
        (exercise) =>
          (filters.level === 'any' || exercise.level === filters.level) &&
          (filters.equipment.length === 0 || filters.equipment.includes(exercise.equipment)),
      ),
    [content.build.exercises, filters],
  )

  return (
    <Tabs defaultValue="exercises" className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      <TabsList className="grid w-full grid-cols-3 bg-surface-raised/80">
        <TabsTrigger value="exercises" className="text-xs data-[state=active]:text-foreground">
          Exercises
        </TabsTrigger>
        <TabsTrigger value="science" className="text-xs data-[state=active]:text-foreground">
          Muscle Science
        </TabsTrigger>
        <TabsTrigger value="workout" className="text-xs data-[state=active]:text-foreground">
          My Workout
        </TabsTrigger>
      </TabsList>

      <TabsContent value="exercises" className="mt-0 space-y-3 focus-visible:outline-none">
        <BuildFilters value={filters} onChange={setFilters} />
        <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Scheme for your goal — {scheme.setsRange} × {scheme.repsRange}, {scheme.restSeconds}s rest. Hover an
          exercise to light up its muscles on the body.
        </p>
        <ExerciseList exercises={visibleExercises} goal={filters.goal} totalCount={content.build.exercises.length} />
      </TabsContent>

      <TabsContent value="science" className="mt-0 focus-visible:outline-none">
        <MuscleScienceTab content={content} />
      </TabsContent>

      <TabsContent value="workout" className="mt-0 focus-visible:outline-none">
        <WorkoutPlanTab />
      </TabsContent>
    </Tabs>
  )
}

function ExerciseList({
  exercises,
  goal,
  totalCount,
}: {
  exercises: Exercise[]
  goal: BuildFilterState['goal']
  totalCount: number
}) {
  if (exercises.length === 0) {
    return (
      <p className="rounded-xl border border-white/8 bg-surface-raised/50 p-4 text-center text-sm text-muted-foreground">
        No exercises match your filters ({totalCount} available). Loosen the level or equipment filter.
      </p>
    )
  }
  return (
    <ul className="space-y-2.5">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <ExerciseCard exercise={exercise} goal={goal} />
        </li>
      ))}
    </ul>
  )
}
