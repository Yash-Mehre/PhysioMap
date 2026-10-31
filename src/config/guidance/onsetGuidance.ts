/** Onset-specific guidance: sudden vs gradual. */

import type { PainOnset } from '@/types/pain'

export interface OnsetGuidanceEntry {
  /** Line for "Do now" when relevant. */
  tip: string
  /** Line for "Watch for". */
  watchFor: string
}

export const ONSET_GUIDANCE: Record<PainOnset, OnsetGuidanceEntry> = {
  sudden: {
    tip: 'Sudden-onset pain deserves respect: offload it today and let the first 24–48 hours show how it behaves.',
    watchFor: 'Rapid worsening, spreading symptoms or new night pain over the next 24–48 hours.',
  },
  gradual: {
    tip: 'Gradual-onset pain usually reflects accumulated load — small daily routine changes matter more than one big fix.',
    watchFor: 'Flares that keep getting more frequent or longer.',
  },
}
