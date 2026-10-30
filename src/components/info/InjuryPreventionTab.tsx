'use client'

/** Injuries & Prevention tab: injuries, prevention tips + cross-mode shortcuts. */

import { Dumbbell, Flame, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExplorerStore } from '@/store/useExplorerStore'
import type { RegionContent } from '@/types'

export interface InjuryPreventionTabProps {
  content: RegionContent
}

export function InjuryPreventionTab({ content }: InjuryPreventionTabProps) {
  const { anatomy } = content
  const setMode = useExplorerStore((state) => state.setMode)

  return (
    <div className="space-y-5">
      <section aria-label="Common injuries" className="space-y-2.5">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-mode-info">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Common injuries
        </h2>
        <ul className="space-y-2.5">
          {anatomy.injuries.map((injury) => (
            <li key={injury.name} className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
              <p className="text-sm font-semibold text-foreground">{injury.name}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-mode-pain/90">Typical cause: </span>
                {injury.cause}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-mode-build/90">Prevention: </span>
                {injury.prevention}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Prevention tips" className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-mode-info">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Prevention playbook
        </h2>
        <ul className="space-y-2">
          {anatomy.preventionTips.map((tip, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-surface-raised/50 p-3 text-xs leading-relaxed text-muted-foreground"
            >
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mode-build" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Cross-mode shortcuts"
        className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-raised to-surface p-4"
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          See this region in other modes
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Same body part — three lenses. The selection stays put when you switch.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => setMode('build')}
            className="h-auto flex-col gap-1 border-mode-build/40 py-3 text-mode-build hover:bg-mode-build/10 hover:text-mode-build"
          >
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold">Train it in Build</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode('pain')}
            className="h-auto flex-col gap-1 border-mode-pain/40 py-3 text-mode-pain hover:bg-mode-pain/10 hover:text-mode-pain"
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold">Relieve it in Pain</span>
          </Button>
        </div>
      </section>
    </div>
  )
}
