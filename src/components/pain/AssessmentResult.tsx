'use client'

/** Assessment result: urgency banner, red flags, associations, next steps + save. */

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, BookmarkPlus, CheckCircle2, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RedFlagBanner } from '@/components/pain/RedFlagBanner'
import { AGGRAVATOR_LABELS, RED_FLAG_LABELS, SENSATION_LABELS } from '@/config/assessment'
import { usePainLogStore } from '@/store/usePainLogStore'
import type { PainAssessmentResult, RegionId } from '@/types'
import type { SymptomFormValues } from '@/components/pain/SymptomForm'

export interface AssessmentResultProps {
  result: PainAssessmentResult
  input: SymptomFormValues
  regionId: RegionId
  regionLabel: string
  onRestart: () => void
}

export function AssessmentResult({ result, input, regionId, regionLabel, onRestart }: AssessmentResultProps) {
  const addEntry = usePainLogStore((state) => state.addEntry)
  const [saved, setSaved] = useState(false)

  const handleSave = (): void => {
    addEntry({
      regionId,
      severity: input.severity,
      sensations: input.sensations,
      urgency: result.urgency,
    })
    setSaved(true)
    toast.success('Pain entry saved to your log')
  }

  return (
    <div className="space-y-5">
      <RedFlagBanner urgency={result.urgency} />

      {result.redFlags.length > 0 ? (
        <section aria-label="Reported warning signs" className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-mode-pain">
            Warning signs you reported
          </h2>
          <ul className="space-y-1.5">
            {result.redFlags.map((flag) => (
              <li
                key={flag}
                className="flex items-start gap-2 rounded-lg border border-mode-pain/25 bg-mode-pain/8 p-2.5 text-xs text-foreground/90"
              >
                <span aria-hidden="true" className="mt-0.5 text-mode-pain">▲</span>
                {RED_FLAG_LABELS[flag]}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Common patterns" className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          Commonly associated with your {regionLabel.toLowerCase()}
        </h2>
        {result.associations.length === 0 ? (
          <p className="rounded-xl border border-white/8 bg-surface-raised/50 p-4 text-xs leading-relaxed text-muted-foreground">
            Your symptom combination did not match a specific pattern from this region’s library — that does not
            mean anything is wrong. Follow the general next steps below and the Relief tab, and track how you
            feel over the next few days.
          </p>
        ) : (
          <ul className="space-y-2">
            {result.associations.map((association) => (
              <li key={association.title} className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
                <p className="text-sm font-semibold text-foreground">{association.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{association.explanation}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {association.matchedSensations.map((sensation) => (
                    <span
                      key={sensation}
                      className="rounded-full border border-mode-pain/30 bg-mode-pain/10 px-2 py-0.5 text-[10px] font-medium text-mode-pain"
                    >
                      {SENSATION_LABELS[sensation]}
                    </span>
                  ))}
                  {association.matchedAggravators.map((aggravator) => (
                    <span
                      key={aggravator}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {AGGRAVATOR_LABELS[aggravator]}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Suggested next steps" className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Suggested next steps
        </h2>
        <ul className="space-y-1.5">
          {result.nextSteps.map((step, index) => (
            <li key={index} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mode-build" aria-hidden="true" />
              {step}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleSave}
          disabled={saved}
          className="bg-mode-pain text-white hover:bg-mode-pain/85"
        >
          <BookmarkPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {saved ? 'Saved to Pain Log' : 'Save to Pain Log'}
        </Button>
        <Button variant="outline" onClick={onRestart} className="border-white/15 text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" /> Start over
        </Button>
      </div>
    </div>
  )
}
