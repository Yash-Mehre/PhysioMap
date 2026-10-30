'use client'

/** Symptom form: sensations, severity, onset, duration, aggravators, red flags. */

import { useState } from 'react'
import { AlertTriangle, Loader2, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { ApiError } from '@/services/regionService'
import {
  AGGRAVATOR_LABELS,
  DURATION_LABELS,
  ONSET_LABELS,
  RED_FLAG_DESCRIPTIONS,
  RED_FLAG_LABELS,
  SENSATION_LABELS,
} from '@/config/assessment'
import { AGGRAVATORS, DURATIONS, ONSETS, RED_FLAGS, SENSATIONS } from '@/config/painSchemas'
import { severityToHeat } from '@/lib/pain/heat'
import { HEAT_COLORS } from '@/config/theme'
import { cn } from '@/lib/utils'
import type {
  Aggravator,
  PainAssessmentResult,
  PainDuration,
  PainOnset,
  RedFlagKey,
  Sensation,
} from '@/types'

export interface SymptomFormValues {
  sensations: Sensation[]
  severity: number
  onset: PainOnset
  duration: PainDuration
  aggravators: Aggravator[]
  redFlags: RedFlagKey[]
}

export interface SymptomFormProps {
  regionLabel: string
  onSubmit: (values: SymptomFormValues) => Promise<PainAssessmentResult>
}

const SEVERITY_TONE: Record<string, string> = {
  mild: HEAT_COLORS.mild,
  moderate: HEAT_COLORS.moderate,
  severe: HEAT_COLORS.severe,
}

export function SymptomForm({ regionLabel, onSubmit }: SymptomFormProps) {
  const [sensations, setSensations] = useState<Sensation[]>([])
  const [severity, setSeverity] = useState(3)
  const [onset, setOnset] = useState<PainOnset>('gradual')
  const [duration, setDuration] = useState<PainDuration>('under-1-week')
  const [aggravators, setAggravators] = useState<Aggravator[]>([])
  const [redFlags, setRedFlags] = useState<RedFlagKey[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = <T,>(list: T[], item: T, setter: (next: T[]) => void): void => {
    setter(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item])
  }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ sensations, severity, onset, duration, aggravators, redFlags })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Something went wrong while assessing your symptoms. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const heat = severityToHeat(severity)

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          What does it feel like? <span className="normal-case text-muted-foreground">(select all that apply)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {SENSATIONS.map((sensation) => {
            const active = sensations.includes(sensation)
            return (
              <button
                key={sensation}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(sensations, sensation, setSensations)}
                className={cn(
                  'touch-target rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper',
                  active
                    ? 'border-mode-pain/60 bg-mode-pain/15 text-mode-pain'
                    : 'border-white/10 bg-surface-raised/60 text-muted-foreground hover:border-white/25 hover:text-foreground',
                )}
              >
                {SENSATION_LABELS[sensation]}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          How strong is it right now?
        </legend>
        <div className="flex items-center gap-4">
          <Slider
            value={[severity]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setSeverity(value)}
            aria-label="Pain severity from 1 to 10"
            className="flex-1"
          />
          <output
            className="flex h-10 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-raised font-heading text-lg font-bold"
            style={{ color: SEVERITY_TONE[heat] }}
          >
            {severity}
          </output>
        </div>
        <p className="text-[11px] text-muted-foreground">
          1–3 mild · 4–6 moderate · 7–10 severe — the body map will glow in these colors when you log it.
        </p>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset className="space-y-2.5">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">How did it start?</legend>
          <RadioGroup value={onset} onValueChange={(value) => setOnset(value as PainOnset)} className="gap-2">
            {ONSETS.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/8 bg-surface-raised/50 px-3 py-2 text-sm text-muted-foreground transition-colors has-[button[data-state=checked]]:border-mode-pain/50 has-[button[data-state=checked]]:text-foreground"
              >
                <RadioGroupItem value={option} id={`onset-${option}`} />
                {ONSET_LABELS[option]}
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-2.5">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
            How long has it lasted?
          </legend>
          <RadioGroup value={duration} onValueChange={(value) => setDuration(value as PainDuration)} className="gap-2">
            {DURATIONS.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/8 bg-surface-raised/50 px-3 py-2 text-sm text-muted-foreground transition-colors has-[button[data-state=checked]]:border-mode-pain/50 has-[button[data-state=checked]]:text-foreground"
              >
                <RadioGroupItem value={option} id={`duration-${option}`} />
                {DURATION_LABELS[option]}
              </label>
            ))}
          </RadioGroup>
        </fieldset>
      </div>

      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          What makes it worse? <span className="normal-case text-muted-foreground">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {AGGRAVATORS.map((aggravator) => {
            const active = aggravators.includes(aggravator)
            return (
              <button
                key={aggravator}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(aggravators, aggravator, setAggravators)}
                className={cn(
                  'touch-target rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper',
                  active
                    ? 'border-mode-pain/60 bg-mode-pain/15 text-mode-pain'
                    : 'border-white/10 bg-surface-raised/60 text-muted-foreground hover:border-white/25 hover:text-foreground',
                )}
              >
                {AGGRAVATOR_LABELS[aggravator]}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-mode-pain">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Are you also experiencing…?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {RED_FLAGS.map((flag) => (
            <label
              key={flag}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-white/8 bg-surface-raised/50 px-3 py-2.5 transition-colors hover:border-mode-pain/30"
            >
              <Checkbox
                checked={redFlags.includes(flag)}
                onCheckedChange={() => toggle(redFlags, flag, setRedFlags)}
                className="mt-0.5 data-[state=checked]:border-mode-pain data-[state=checked]:bg-mode-pain"
                aria-label={RED_FLAG_LABELS[flag]}
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-foreground">{RED_FLAG_LABELS[flag]}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {RED_FLAG_DESCRIPTIONS[flag]}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="rounded-lg border border-mode-pain/40 bg-mode-pain/10 p-3 text-xs text-mode-pain">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={submitting || sensations.length === 0}
          className="flex-1 bg-mode-pain text-white hover:bg-mode-pain/85"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> Assessing…
            </>
          ) : (
            <>
              <Send className="mr-1.5 h-4 w-4" aria-hidden="true" /> Get guidance for my {regionLabel.toLowerCase()}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSensations([])
            setSeverity(3)
            setOnset('gradual')
            setDuration('under-1-week')
            setAggravators([])
            setRedFlags([])
            setError(null)
          }}
          aria-label="Reset the form"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {sensations.length === 0 ? (
        <p className="text-center text-[11px] text-muted-foreground">Select at least one sensation to continue.</p>
      ) : (
        <Label className="sr-only">Sensations selected: {sensations.length}</Label>
      )}
    </form>
  )
}
