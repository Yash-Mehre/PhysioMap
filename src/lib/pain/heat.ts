/**
 * Pure pain-heat mapping and severity trend helpers used by the avatar
 * overlay and the Pain Log tab. Severity bands: 1–3 amber (mild),
 * 4–6 orange (moderate), 7–10 red (severe, pulsing).
 */

import type { PainLogEntry, RegionId } from '@/types'

export type HeatTier = 'none' | 'mild' | 'moderate' | 'severe'

/** Days a pain log entry stays "recent" on the avatar heat map. */
export const HEAT_RECENCY_DAYS = 7

export const HEAT_EMISSIVE_INTENSITY: Record<Exclude<HeatTier, 'none'>, number> = {
  mild: 0.22,
  moderate: 0.38,
  severe: 0.55,
}

/** Map a 1–10 severity to a heat tier. */
export function severityToHeat(severity: number): HeatTier {
  if (severity >= 7) return 'severe'
  if (severity >= 4) return 'moderate'
  if (severity >= 1) return 'mild'
  return 'none'
}

function isRecent(entry: PainLogEntry, now: Date): boolean {
  const entryDate = new Date(entry.date)
  const diffMs = now.getTime() - entryDate.getTime()
  return diffMs >= 0 && diffMs <= HEAT_RECENCY_DAYS * 24 * 60 * 60 * 1000
}

/** Max recent (≤ 7 days) severity per region — drives the Pain-mode avatar glow. */
export function buildRegionHeat(
  entries: readonly PainLogEntry[],
  now: Date = new Date(),
): Record<string, number> {
  const heat: Record<string, number> = {}
  for (const entry of entries) {
    if (!isRecent(entry, now)) continue
    heat[entry.regionId] = Math.max(heat[entry.regionId] ?? 0, entry.severity)
  }
  return heat
}

/** Severity history (oldest → newest, capped) for one region. */
export function regionSeverityTrend(
  entries: readonly PainLogEntry[],
  regionId: RegionId,
  limit = 8,
): number[] {
  return [...entries]
    .filter((entry) => entry.regionId === regionId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-limit)
    .map((entry) => entry.severity)
}

/** Build an SVG polyline points string for a severity trend (100×28 viewbox). */
export function severityTrendPoints(trend: readonly number[]): string {
  if (trend.length === 0) return ''
  if (trend.length === 1) {
    const y = 24 - ((trend[0] - 1) / 9) * 20
    return `${(100 / 2).toFixed(1)},${y.toFixed(1)}`
  }
  return trend
    .map((severity, index) => {
      const x = (index / (trend.length - 1)) * 100
      const y = 24 - ((severity - 1) / 9) * 20
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
