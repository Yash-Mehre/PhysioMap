'use client'

/** Build mode panel: Exercises / Muscle Science / My Workout tabs. */

import { useMemo, useState } from 'react'
import { HeartPulse, Sparkles } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BuildFilters, type BuildFilterState } from '@/components/build/BuildFilters'
import { ExerciseCard } from '@/components/build/ExerciseCard'
import { MuscleScienceTab } from '@/components/build/MuscleScienceTab'
import { WorkoutPlanTab } from '@/components/build/WorkoutPlanTab'
import { getSetScheme } from '@/lib/build/setSchemes'
import { getTrainingCautions } from '@/lib/pain/conditionNotes'
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
  const [suggestionsOnly, setSuggestionsOnly] = useState(false)

  const scheme = getSetScheme(filters.goal)
  const trainingCautions = useMemo(
    () => getTrainingCautions(profile.medicalConditions),
    [profile.medicalConditions],
  )

  const visibleExercises = useMemo(
    () =>
      content.build.exercises.filter(
        (exercise) =>
          (filters.level === 'any' || exercise.level === filters.level) &&
          (filters.equipment.length === 0 || filters.equipment.includes(exercise.equipment)),
      ),
    [content.build.exercises, filters],
  )
  const suggestedExercises = useMemo(
    () =>
      visibleExercises
        .filter((exercise) => filters.equipment.length === 0 || filters.equipment.includes(exercise.equipment))
        .slice(0, 3),
    [filters.equipment, visibleExercises],
  )
  const exercisesToRender = suggestionsOnly ? suggestedExercises : visibleExercises

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
        <button
          type="button"
          onClick={() => setSuggestionsOnly((value) => !value)}
          aria-pressed={suggestionsOnly}
          className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
            suggestionsOnly
              ? 'border-mode-build/50 bg-mode-build/10'
              : 'border-white/8 bg-surface-raised/50 hover:border-mode-build/30'
          }`}
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-mode-build" aria-hidden="true" />
          <span>
            <span className="block text-xs font-semibold text-foreground">Suggestion mode</span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
              {suggestionsOnly
                ? 'Showing the first three exercises that match your level and equipment.'
                : 'Use your profile goals, equipment and safety notes to narrow the library.'}
            </span>
          </span>
        </button>
        {trainingCautions.length > 0 ? (
          <div className="space-y-1 rounded-xl border border-mode-info/25 bg-mode-info/8 px-3.5 py-2.5">
            {trainingCautions.map((caution) => (
              <p
                key={caution}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-mode-info"
              >
                <HeartPulse className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                {caution}
              </p>
            ))}
          </div>
        ) : null}
        <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Scheme for your goal — {scheme.setsRange} × {scheme.repsRange}, {scheme.restSeconds}s rest. Hover an
          exercise to light up its muscles on the body.
        </p>
        <ExerciseList exercises={exercisesToRender} goal={filters.goal} totalCount={content.build.exercises.length} />
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
