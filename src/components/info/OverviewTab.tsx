'use client'

/** Overview tab: anatomical name, location, actions, origin→insertion, innervation, fun facts. */

import { ArrowRight, Brain, Lightbulb, MapPin, Move3d, Sparkles } from 'lucide-react'
import { REGION_BY_ID } from '@/config/regions'
import { useExplorerStore } from '@/store/useExplorerStore'
import type { RegionContent, RegionId } from '@/types'

export interface OverviewTabProps {
  content: RegionContent
}

export function OverviewTab({ content }: OverviewTabProps) {
  const { anatomy } = content
  const selectRegion = useExplorerStore((state) => state.selectRegion)

  const relatedRegions = Array.from(new Set([...anatomy.synergistIds, ...anatomy.antagonistIds]))

  return (
    <div className="space-y-5">
      <section aria-label="Location and actions" className="space-y-3">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mode-info" aria-hidden="true" />
          {anatomy.location}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {anatomy.actions.map((action) => (
            <span
              key={action}
              className="flex items-center gap-1 rounded-full border border-mode-info/30 bg-mode-info/10 px-2.5 py-1 text-[11px] font-medium text-mode-info"
            >
              <Move3d className="h-3 w-3" aria-hidden="true" />
              {action}
            </span>
          ))}
        </div>
      </section>

      <section aria-label="Attachments" className="grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-surface-raised/60 p-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Origin</h2>
          <p className="mt-1 text-xs leading-relaxed text-foreground/90">{anatomy.origin}</p>
        </div>
        <div className="flex flex-col rounded-xl border border-white/8 bg-surface-raised/60 p-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Insertion</h2>
          <p className="mt-1 text-xs leading-relaxed text-foreground/90">{anatomy.insertion}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-surface-raised/60 p-3 sm:col-span-2">
          <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Brain className="h-3 w-3" aria-hidden="true" /> Innervation
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-foreground/90">{anatomy.innervation}</p>
        </div>
      </section>

      <section aria-label="Fun facts" className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-mode-info">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Fun facts
        </h2>
        <ul className="space-y-2">
          {anatomy.funFacts.map((fact, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-surface-raised/50 p-3 text-xs leading-relaxed text-muted-foreground"
            >
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
              {fact}
            </li>
          ))}
        </ul>
      </section>

      {relatedRegions.length > 0 ? (
        <section aria-label="Related regions" className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-mode-info">Related regions</h2>
          <div className="flex flex-wrap gap-1.5">
            {relatedRegions.map((regionId) => (
              <button
                key={regionId}
                type="button"
                onClick={() => selectRegion(regionId)}
                className="touch-target flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:border-mode-info/50 hover:text-mode-info focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
              >
                {REGION_BY_ID[regionId].label}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
