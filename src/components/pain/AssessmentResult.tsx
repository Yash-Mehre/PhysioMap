'use client'

/**
 * Assessment result: urgency banner with the region-specific headline, the
 * reported warning signs, common associations, the four guidance blocks
 * (Do now · Avoid · Watch for · Next check-in), "Based on" chips, the
 * medical-history notes (processed client-side only) and save-to-log.
 */

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Ban,
  BookmarkPlus,
  CalendarClock,
  CheckCircle2,
  Eye,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RedFlagBanner } from '@/components/pain/RedFlagBanner'
import { AGGRAVATOR_LABELS, RED_FLAG_LABELS, SENSATION_LABELS } from '@/config/assessment'
import { getConditionNotes } from '@/lib/pain/conditionNotes'
import { usePainLogStore } from '@/store/usePainLogStore'
import { useProfileStore } from '@/store/useProfileStore'
import type { PainAssessmentResult, RegionId } from '@/types'
import type { SymptomFormValues } from '@/components/pain/SymptomForm'

const GUIDANCE_BLOCKS = [
  { key: 'doNow', label: 'Do now', icon: CheckCircle2, tint: 'text-mode-build' },
  { key: 'avoid', label: 'Avoid', icon: Ban, tint: 'text-mode-pain' },
  { key: 'watchFor', label: 'Watch for', icon: Eye, tint: 'text-mode-info' },
  { key: 'followUp', label: 'Next check-in', icon: CalendarClock, tint: 'text-copper' },
] as const

export interface AssessmentResultProps {
  result: PainAssessmentResult
  input: SymptomFormValues
  regionId: RegionId
  regionLabel: string
  onRestart: () => void
}

export function AssessmentResult({ result, input, regionId, regionLabel, onRestart }: AssessmentResultProps) {
  const addEntry = usePainLogStore((state) => state.addEntry)
  const medicalConditions = useProfileStore((state) => state.profile.medicalConditions)
  const [saved, setSaved] = useState(false)

  const conditionNotes = useMemo(
    () => getConditionNotes(medicalConditions, regionId, { ...input, regionId }),
    [medicalConditions, regionId, input],
  )

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
      <RedFlagBanner urgency={result.urgency} headline={result.guidance.headline} />

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
            mean anything is wrong. Follow the guidance below and the Relief tab, and track how you
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

      <section aria-label="Your guidance" className="grid gap-2.5 sm:grid-cols-2">
        {GUIDANCE_BLOCKS.map(({ key, label, icon: Icon, tint }) => (
          <div key={key} className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
            <h3 className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${tint}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {result.guidance[key].map((line, index) => (
                <li key={index} className="text-xs leading-relaxed text-foreground/90">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-label="Based on your answers" className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Based on</h2>
        <ul className="flex flex-wrap gap-1.5">
          {result.guidance.basedOn.map((chip, index) => (
            <li
              key={`${index}-${chip}`}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {chip}
            </li>
          ))}
        </ul>
      </section>

      {conditionNotes.length > 0 ? (
        <section aria-label="Because of your medical history" className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-mode-info">
            <History className="h-3.5 w-3.5" aria-hidden="true" /> Because of your medical history
          </h2>
          <ul className="space-y-1.5 rounded-xl border border-mode-info/25 bg-mode-info/8 p-3.5">
            {conditionNotes.map((note, index) => (
              <li key={index} className="text-xs leading-relaxed text-foreground/90">
                {note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
