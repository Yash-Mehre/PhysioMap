/** Severity-band guidance: 1–3, 4–5, 6–7, 8–10, each with a re-check rule. */

export interface SeverityBandGuidance {
  id: 'mild' | 'moderate' | 'firm' | 'severe'
  /** Human band label. */
  label: string
  /** Tip for the band. */
  tip: string
  /** Re-check rule quoted back to the user with their own numbers. */
  reCheck: string
}

const BANDS: readonly SeverityBandGuidance[] = [
  {
    id: 'mild',
    label: 'mild',
    tip: 'Mild pain like this rarely needs more than gentle load management.',
    reCheck: 'Re-rate it in 48 hours; if it has not dropped, review your recent loading.',
  },
  {
    id: 'moderate',
    label: 'moderate',
    tip: 'Moderate pain at this level is worth tracking closely against your activities.',
    reCheck: 'Re-rate it in 48 hours; if it has not dropped by at least 2 points, see a physiotherapist.',
  },
  {
    id: 'firm',
    label: 'noticeable',
    tip: 'Pain at this level usually warrants easing most training load while it settles.',
    reCheck: 'Re-rate it in 48 hours; if it has not dropped by at least 2 points, see a physiotherapist.',
  },
  {
    id: 'severe',
    label: 'severe',
    tip: 'Severe pain needs professional input — do not push through at this level.',
    reCheck: 'Re-rate it within 24 hours; if it stays this high, get it assessed.',
  },
]

/** Resolve the severity band (1–3, 4–5, 6–7, 8–10). */
export function getSeverityBand(severity: number): SeverityBandGuidance {
  if (severity <= 3) return BANDS[0]
  if (severity <= 5) return BANDS[1]
  if (severity <= 7) return BANDS[2]
  return BANDS[3]
}
