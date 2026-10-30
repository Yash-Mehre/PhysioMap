'use client'

/** Remedies tab: evidence-aligned self-care with "when to use" / "when to stop". */

import { Ban, Clock, Thermometer } from 'lucide-react'
import type { RegionContent } from '@/types'
import { SaveActionButton } from '@/components/pain/SaveActionButton'

export interface RemediesTabProps {
  content: RegionContent
}

export function RemediesTab({ content }: RemediesTabProps) {
  return (
    <div className="space-y-3">
      <p className="flex items-start gap-1.5 px-0.5 text-[11px] leading-relaxed text-muted-foreground">
        <Thermometer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
        Evidence-aligned self-care only — PhysioMap never recommends medicines or doses.
      </p>
      <ul className="space-y-2.5">
        {content.pain.remedies.map((remedy) => (
          <li key={remedy.title} className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
            <p className="text-sm font-semibold text-foreground">{remedy.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{remedy.detail}</p>
            <div className="mt-2.5 space-y-1.5">
              <p className="flex items-start gap-1.5 rounded-lg border border-mode-build/25 bg-mode-build/8 p-2 text-[11px] leading-relaxed text-muted-foreground">
                <Clock className="mt-0.5 h-3 w-3 shrink-0 text-mode-build" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-mode-build">When to use: </span>
                  {remedy.whenToUse}
                </span>
              </p>
              <p className="flex items-start gap-1.5 rounded-lg border border-mode-pain/25 bg-mode-pain/8 p-2 text-[11px] leading-relaxed text-muted-foreground">
                <Ban className="mt-0.5 h-3 w-3 shrink-0 text-mode-pain" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-mode-pain">When to stop / seek care: </span>
                  {remedy.stopWhen}
                </span>
              </p>
            </div>
            <div className="mt-3">
              <SaveActionButton
                action="remedy"
                regionId={content.region.id}
                title={remedy.title}
                details={remedy.detail}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
