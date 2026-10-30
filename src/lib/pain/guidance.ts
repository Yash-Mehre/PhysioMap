/**
 * Pure guidance composer for Pain Mode. Builds region- and input-specific
 * guidance (headline, do-now, avoid, watch-for, follow-up, based-on chips)
 * from the data files in `src/config/guidance/`. Urgency itself is resolved
 * by `resolveUrgency` in `assess.ts` and is never changed here.
 *
 * Composition order (then capped and de-duplicated):
 * 1. urgency headline naming the region's area and specialist,
 * 2. a specific line per reported red flag (most serious first),
 * 3. the top 2 aggravator tips for this region,
 * 4. one sensation tip and one onset/duration tip,
 * 5. a follow-up line quoting the user's own numbers,
 * 6. the region's avoid and safe-movement lines.
 *
 * Caps: 1–3 items per list, 5–9 lines across the four lists combined. The
 * allocator guarantees every list keeps at least one line.
 */

import { AGGRAVATOR_LABELS, SENSATION_LABELS } from '@/config/assessment'
import { AGGRAVATOR_GUIDANCE } from '@/config/guidance/aggravatorGuidance'
import { DURATION_GUIDANCE } from '@/config/guidance/durationGuidance'
import { ONSET_GUIDANCE } from '@/config/guidance/onsetGuidance'
import { RED_FLAG_GUIDANCE, RED_FLAG_SERIOUSNESS_ORDER } from '@/config/guidance/redFlagGuidance'
import { REGION_GUIDANCE_PROFILES } from '@/config/guidance/regionProfiles'
import { SENSATION_GUIDANCE } from '@/config/guidance/sensationGuidance'
import { getSeverityBand } from '@/config/guidance/severityGuidance'
import { getClinicianFlags, getEmergencyFlags } from '@/lib/pain/redFlags'
import type { PainAssessmentInput, PainGuidance, PainUrgency, RedFlagKey } from '@/types/pain'
import type { RegionId } from '@/config/regions'

const MAX_PER_LIST = 3
const MAX_TOTAL_LINES = 9

/** Headline templates per urgency — region area and specialist are spliced in. */
const HEADLINES: Record<PainUrgency, (areaName: string, specialist: string) => string> = {
  urgent: (areaName) =>
    `Your ${areaName} symptoms can be linked to a serious cause — get emergency care now rather than waiting to see if it settles.`,
  'see-clinician': (areaName, specialist) =>
    `Your ${areaName} symptoms should be looked at by a ${specialist} before you train through them.`,
  monitor: (areaName, specialist) =>
    `Your ${areaName} symptoms are worth monitoring closely for the next few days — a ${specialist} is the right next step if they persist.`,
  'self-care': (areaName) =>
    `Gentle self-care looks reasonable for your ${areaName} right now — keep moving within comfort and track how it responds.`,
}

/** Append to a candidate pool unless empty, duplicate, or the list is full. */
function collect(list: string[], line: string | undefined): void {
  if (line === undefined || line === '') return
  if (list.includes(line)) return
  if (list.length >= MAX_PER_LIST) return
  list.push(line)
}

/**
 * Allocate candidate lines against the global budget: the first item of every
 * list is always kept, then remaining items in list priority order
 * (do-now → avoid → watch-for → follow-up) until the budget is spent.
 */
function allocate(candidates: readonly (readonly string[])[]): string[][] {
  const budget = { left: MAX_TOTAL_LINES }
  const result = candidates.map((list) => {
    if (list.length === 0 || budget.left <= 0) return [] as string[]
    budget.left -= 1
    return [list[0]]
  })
  candidates.forEach((list, listIndex) => {
    for (let index = 1; index < list.length; index += 1) {
      if (budget.left <= 0) return
      result[listIndex].push(list[index])
      budget.left -= 1
    }
  })
  return result
}

/** Red flags ordered most serious first: emergencies, then clinician-level. */
function sortRedFlagsBySeriousness(regionId: RegionId, flags: readonly RedFlagKey[]): RedFlagKey[] {
  const ordered = [...getEmergencyFlags(regionId, flags), ...getClinicianFlags(regionId, flags)]
  return ordered.sort(
    (a, b) => RED_FLAG_SERIOUSNESS_ORDER.indexOf(a) - RED_FLAG_SERIOUSNESS_ORDER.indexOf(b),
  )
}

/** Region-aware line for a red flag (variant overrides the general line). */
function redFlagLine(flag: RedFlagKey, regionId: RegionId, key: 'doNow' | 'avoid' | 'watchFor'): string {
  const entry = RED_FLAG_GUIDANCE[flag]
  return entry.regionVariants?.[regionId]?.[key] ?? entry[key]
}

/** Aggravator tips for this input, region-specific variants first. */
function aggravatorTips(input: PainAssessmentInput): string[] {
  return input.aggravators
    .map((aggravator) => {
      const entry = AGGRAVATOR_GUIDANCE[aggravator]
      const variant = entry.regionVariants?.[input.regionId]
      return { tip: variant ?? entry.tip, specific: variant !== undefined }
    })
    .sort((a, b) => Number(b.specific) - Number(a.specific))
    .map((item) => item.tip)
}

/** Region-aware sensation tip for the first reported sensation. */
function sensationTip(input: PainAssessmentInput): string | undefined {
  const sensation = input.sensations[0]
  if (sensation === undefined) return undefined
  const entry = SENSATION_GUIDANCE[sensation]
  return entry.regionVariants?.[input.regionId] ?? entry.tip
}

/** Short chips summarising the user's inputs (e.g. "Sharp", "7/10", "Sudden onset"). */
function buildBasedOn(input: PainAssessmentInput): string[] {
  return [
    ...input.sensations.map((sensation) => SENSATION_LABELS[sensation]),
    `${input.severity}/10`,
    input.onset === 'sudden' ? 'Sudden onset' : 'Gradual onset',
    DURATION_GUIDANCE[input.duration].label,
    ...input.aggravators.map((aggravator) => AGGRAVATOR_LABELS[aggravator]),
  ]
}

/**
 * Compose the full guidance object for an assessment. Pure: identical input
 * and urgency always produce identical output.
 */
export function buildGuidance(input: PainAssessmentInput, urgency: PainUrgency): PainGuidance {
  const profile = REGION_GUIDANCE_PROFILES[input.regionId]
  const severityBand = getSeverityBand(input.severity)
  const flags = sortRedFlagsBySeriousness(input.regionId, input.redFlags)

  const doNowCandidates: string[] = []
  const avoidCandidates: string[] = []
  const watchForCandidates: string[] = []
  const followUpCandidates: string[] = []

  // 2. A specific line per red flag, most serious first.
  for (const flag of flags) {
    collect(doNowCandidates, redFlagLine(flag, input.regionId, 'doNow'))
    collect(avoidCandidates, redFlagLine(flag, input.regionId, 'avoid'))
    collect(watchForCandidates, redFlagLine(flag, input.regionId, 'watchFor'))
  }

  if (flags.length === 0) {
    // 3. Top aggravator tips for this region (or the region's usual loads),
    //    the region's safe-movement line, and the sensation tip when fewer
    //    than two aggravator tips apply.
    const tips = aggravatorTips(input)
    collect(doNowCandidates, tips[0] ?? profile.commonLoadingFactors)
    collect(doNowCandidates, profile.safeMovement)
    collect(doNowCandidates, tips[1] ?? sensationTip(input))
  } else {
    // 6. Keep the region's safe-movement line after the red-flag lines.
    collect(doNowCandidates, profile.safeMovement)
  }

  // 6. The region's avoid line and urgent signs; 4. one onset line.
  collect(avoidCandidates, profile.avoidMovement)
  collect(watchForCandidates, profile.urgentSigns)
  collect(watchForCandidates, ONSET_GUIDANCE[input.onset].watchFor)

  // 5. Follow-up quoting the user's own numbers.
  collect(
    followUpCandidates,
    `You rated this ${input.severity}/10 (${severityBand.label}) and it has lasted ${DURATION_GUIDANCE[input.duration].label}. ${severityBand.reCheck}`,
  )
  collect(followUpCandidates, DURATION_GUIDANCE[input.duration].tip)

  const [doNow, avoid, watchFor, followUp] = allocate([
    doNowCandidates,
    avoidCandidates,
    watchForCandidates,
    followUpCandidates,
  ])

  return {
    headline: HEADLINES[urgency](profile.areaName, profile.specialist),
    doNow,
    avoid,
    watchFor,
    followUp,
    basedOn: buildBasedOn(input),
  }
}
