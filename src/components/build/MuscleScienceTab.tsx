'use client'

/** Muscle Science tab: hypertrophy guide, biomechanics, synergists/antagonists. */

import { useCallback } from 'react'
import { Activity, Clock, Layers, Repeat, TrendingUp, Waves } from 'lucide-react'
import { REGION_BY_ID } from '@/config/regions'
import { useExplorerStore } from '@/store/useExplorerStore'
import type { RegionContent, RegionId } from '@/types'

export interface MuscleScienceTabProps {
  content: RegionContent
}

const SYNERGIST_COLOR = '#3B74F2'
const ANTAGONIST_COLOR = '#E8A94A'

export function MuscleScienceTab({ content }: MuscleScienceTabProps) {
  const { build, anatomy } = content
  const guide = build.hypertrophyGuide

  const setExerciseHighlight = useExplorerStore((state) => state.setExerciseHighlight)
  const clearExerciseHighlight = useExplorerStore((state) => state.clearExerciseHighlight)
  const selectRegion = useExplorerStore((state) => state.selectRegion)

  const highlightSynergists = useCallback(
    () =>
      setExerciseHighlight({
        exerciseId: null,
        primaryRegionId: null,
        secondaryRegionIds: anatomy.synergistIds,
        antagonistRegionIds: anatomy.antagonistIds,
      }),
    [setExerciseHighlight, anatomy.synergistIds, anatomy.antagonistIds],
  )

  const guideStats = [
    { icon: Layers, label: 'Weekly sets', value: guide.weeklySets },
    { icon: Repeat, label: 'Rep range', value: guide.repRange },
    { icon: Clock, label: 'Rest', value: `${guide.restSeconds}s` },
    { icon: Activity, label: 'Frequency', value: `${guide.frequencyPerWeek}× / week` },
    { icon: Waves, label: 'Tempo', value: guide.tempo },
  ]

  return (
    <div className="space-y-5">
      <section aria-label="Hypertrophy guide" className="rounded-xl border border-white/8 bg-surface-raised/60 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-mode-build">
          Hypertrophy guide
        </h2>
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {guideStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/8 bg-surface p-2.5">
              <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <stat.icon className="h-3 w-3 text-copper" aria-hidden="true" />
                {stat.label}
              </dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex gap-2 rounded-lg border border-copper/20 bg-copper/8 p-3 text-xs leading-relaxed text-muted-foreground">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
          <span>
            <span className="font-semibold text-copper">Progression:</span> {guide.progressionTip}
          </span>
        </p>
      </section>

      <section aria-label="Biomechanics notes">
        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-mode-build">
          Biomechanics
        </h2>
        <ul className="space-y-2">
          {build.biomechanicsNotes.map((note, index) => (
            <li
              key={index}
              className="rounded-lg border border-white/8 bg-surface-raised/50 p-3 text-sm leading-relaxed text-muted-foreground"
            >
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Synergists and antagonists"
        onMouseEnter={highlightSynergists}
        onMouseLeave={clearExerciseHighlight}
        onFocus={highlightSynergists}
        onBlur={clearExerciseHighlight}
      >
        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-mode-build">
          Working together
        </h2>
        <div className="space-y-2.5">
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">
              Synergists — muscles that help this region perform
            </p>
            <div className="flex flex-wrap gap-1.5">
              {anatomy.synergistIds.length === 0 ? (
                <span className="text-xs text-muted-foreground/70">—</span>
              ) : (
                anatomy.synergistIds.map((regionId) => (
                  <ChipButton
                    key={regionId}
                    regionId={regionId}
                    color={SYNERGIST_COLOR}
                    onSelect={selectRegion}
                  />
                ))
              )}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">
              Antagonists — muscles that oppose this region
            </p>
            <div className="flex flex-wrap gap-1.5">
              {anatomy.antagonistIds.length === 0 ? (
                <span className="text-xs text-muted-foreground/70">—</span>
              ) : (
                anatomy.antagonistIds.map((regionId) => (
                  <ChipButton
                    key={regionId}
                    regionId={regionId}
                    color={ANTAGONIST_COLOR}
                    onSelect={selectRegion}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/80">
          Hover to highlight on the body · click a chip to jump to that region.
        </p>
      </section>
    </div>
  )
}

function ChipButton({
  regionId,
  color,
  onSelect,
}: {
  regionId: RegionId
  color: string
  onSelect: (regionId: RegionId | null) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(regionId)}
      className="touch-target rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
      style={{ borderColor: `${color}55`, backgroundColor: `${color}18`, color }}
    >
      {REGION_BY_ID[regionId].label}
    </button>
  )
}
