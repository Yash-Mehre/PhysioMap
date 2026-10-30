/**
 * Computes the per-region visual state for the avatar from mode + selection +
 * exercise highlights + workout preview + pain-log heat + quiz state.
 * The avatar never knows about modes — it only renders `RegionVisualState`s.
 */

import { useMemo } from 'react'
import { REGION_IDS } from '@/config/regions'
import { HEAT_COLORS, MODE_COLORS } from '@/config/theme'
import { HEAT_EMISSIVE_INTENSITY, buildRegionHeat, severityToHeat } from '@/lib/pain/heat'
import { useExplorerStore } from '@/store/useExplorerStore'
import { usePainLogStore } from '@/store/usePainLogStore'
import { useQuizStore } from '@/store/useQuizStore'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import type { AppMode, RegionId, RegionVisualState } from '@/types'
import type { HeatTier } from '@/lib/pain/heat'

const QUIZ_TARGET_COLOR = '#F3B38A'
const QUIZ_CORRECT_COLOR = '#58B584'
const QUIZ_WRONG_COLOR = '#E5484D'
const ANTAGONIST_COLOR = '#E8A94A'
const SYNERGIST_COLOR = '#3B74F2'

function neutralState(): RegionVisualState {
  return { emissive: '#000000', emissiveIntensity: 0, opacity: 1 }
}

function heatState(tier: Exclude<HeatTier, 'none'>, base: RegionVisualState): RegionVisualState {
  const color =
    tier === 'mild' ? HEAT_COLORS.mild : tier === 'moderate' ? HEAT_COLORS.moderate : HEAT_COLORS.severe
  const intensity = HEAT_EMISSIVE_INTENSITY[tier]
  return {
    ...base,
    tint: color,
    emissive: color,
    emissiveIntensity: Math.max(base.emissiveIntensity, intensity),
    pulse: tier === 'severe' ? true : base.pulse,
  }
}

export function useRegionVisualState(mode: AppMode): Record<RegionId, RegionVisualState> {
  const selectedRegionId = useExplorerStore((state) => state.selectedRegionId)
  const hoveredRegionId = useExplorerStore((state) => state.hoveredRegionId)
  const exerciseHighlight = useExplorerStore((state) => state.exerciseHighlight)
  const workoutPreview = useExplorerStore((state) => state.workoutPreview)
  const isolate = useExplorerStore((state) => state.isolate)
  const workoutItems = useWorkoutStore((state) => state.items)
  const painEntries = usePainLogStore((state) => state.entries)
  const quizStatus = useQuizStore((state) => state.status)
  const quizPhase = useQuizStore((state) => state.phase)
  const quizQuestionIndex = useQuizStore((state) => state.index)
  const quizQuestions = useQuizStore((state) => state.questions)
  const quizPicked = useQuizStore((state) => state.pickedRegionId)

  return useMemo(() => {
    const styles = {} as Record<RegionId, RegionVisualState>
    const modeColor = MODE_COLORS[mode]
    const quizActive = quizStatus === 'active'
    const quizQuestion = quizActive ? (quizQuestions[quizQuestionIndex] ?? null) : null

    // Workout preview lights up every region in the plan.
    const previewRegions = new Set<RegionId>()
    if (workoutPreview) {
      for (const item of workoutItems) {
        previewRegions.add(item.regionId)
        for (const secondary of item.secondaryRegionIds) previewRegions.add(secondary)
      }
    }

    const heat = mode === 'pain' ? buildRegionHeat(painEntries) : {}
    const secondaryHighlight = new Set(exerciseHighlight.secondaryRegionIds)
    const antagonistHighlight = new Set(exerciseHighlight.antagonistRegionIds)

    for (const regionId of REGION_IDS) {
      const state = neutralState()

      // Base hover feedback (mode-tinted).
      if (regionId === hoveredRegionId && regionId !== selectedRegionId) {
        state.emissive = modeColor
        state.emissiveIntensity = 0.16
        state.tint = modeColor
      }

      // Exercise hover/preview highlights (Build mode affordances).
      if (regionId === exerciseHighlight.primaryRegionId) {
        state.emissive = SYNERGIST_COLOR
        state.emissiveIntensity = 0.45
        state.tint = SYNERGIST_COLOR
      } else if (secondaryHighlight.has(regionId)) {
        state.emissive = SYNERGIST_COLOR
        state.emissiveIntensity = 0.18
        state.tint = SYNERGIST_COLOR
      } else if (antagonistHighlight.has(regionId)) {
        state.emissive = ANTAGONIST_COLOR
        state.emissiveIntensity = 0.32
        state.tint = ANTAGONIST_COLOR
      } else if (previewRegions.has(regionId)) {
        state.emissive = SYNERGIST_COLOR
        state.emissiveIntensity = 0.3
        state.tint = SYNERGIST_COLOR
      }

      // Pain heat glows by logged severity (recent entries only).
      const regionHeat = heat[regionId]
      if (regionHeat !== undefined) {
        const tier = severityToHeat(regionHeat)
        if (tier !== 'none') Object.assign(state, heatState(tier, state))
      }

      // Selected region: mode-colored outline + glow (strongest visual).
      if (regionId === selectedRegionId) {
        state.tint = modeColor
        state.emissive = modeColor
        state.emissiveIntensity = Math.max(state.emissiveIntensity, 0.35)
        state.outline = true
      }

      // Info-mode isolate: fade every other region to 15% opacity.
      if (isolate && regionId !== selectedRegionId) {
        state.opacity = 0.15
      }

      // Quiz overrides (highest precedence while a quiz runs).
      if (quizQuestion) {
        if (quizPhase === 'asking') {
          if (quizQuestion.kind === 'name-it' && regionId === quizQuestion.answerRegionId) {
            state.tint = QUIZ_TARGET_COLOR
            state.emissive = QUIZ_TARGET_COLOR
            state.emissiveIntensity = 0.5
            state.pulse = true
          }
        } else if (quizPhase === 'correct') {
          if (regionId === quizQuestion.answerRegionId) {
            state.tint = QUIZ_CORRECT_COLOR
            state.emissive = QUIZ_CORRECT_COLOR
            state.emissiveIntensity = 0.65
          }
        } else if (quizPhase === 'wrong') {
          if (regionId === quizPicked) {
            state.tint = QUIZ_WRONG_COLOR
            state.emissive = QUIZ_WRONG_COLOR
            state.emissiveIntensity = 0.6
          } else if (regionId === quizQuestion.answerRegionId) {
            state.tint = QUIZ_CORRECT_COLOR
            state.emissive = QUIZ_CORRECT_COLOR
            state.emissiveIntensity = 0.45
            state.pulse = true
          }
        }
      }

      styles[regionId] = state
    }

    return styles
  }, [
    mode,
    selectedRegionId,
    hoveredRegionId,
    exerciseHighlight,
    workoutPreview,
    isolate,
    workoutItems,
    painEntries,
    quizStatus,
    quizPhase,
    quizQuestionIndex,
    quizQuestions,
    quizPicked,
  ])
}
