/** Duration-specific guidance for the "Next check-in" block. */

import type { PainDuration } from '@/types/pain'

export interface DurationGuidanceEntry {
  /** Short chip label (also used when quoting the user's duration). */
  label: string
  /** Follow-up tip. */
  tip: string
}

export const DURATION_GUIDANCE: Record<PainDuration, DurationGuidanceEntry> = {
  'under-1-week': {
    label: 'under 1 week',
    tip: 'Fresh pain in its first week mainly needs relative rest and gentle movement — most cases settle.',
  },
  '1-4-weeks': {
    label: '1–4 weeks',
    tip: 'A few weeks in, a structured plan matters — use the Relief tab exercises daily and note what flares it.',
  },
  '1-3-months': {
    label: '1–3 months',
    tip: 'Pain lasting over a month deserves a proper assessment and a progressive plan.',
  },
  'over-3-months': {
    label: 'over 3 months',
    tip: 'Pain lasting over three months benefits from a professional plan — persistent pain is treatable, and early guidance helps.',
  },
}
