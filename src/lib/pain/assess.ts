/**
 * Pure pain assessment rule engine. Deterministic, side-effect free and fully
 * unit-testable. Rules (from the product brief):
 * - Any emergency flag (chest pressure/pain, bladder/bowel loss, cannot bear
 *   weight, calf swelling+redness+warmth) ⇒ 'urgent'.
 * - Severity ≥ 8, numbness/tingling with weakness, fever, night pain at rest,
 *   or a recent injury with strong accompanying signs ⇒ 'see-clinician'.
 * - Duration > 4 weeks or severity 6–7 ⇒ 'monitor' with a physiotherapist note.
 * - Otherwise ⇒ 'self-care'.
 */

import { buildGuidance } from '@/lib/pain/guidance'
import { getClinicianFlags, getEmergencyFlags } from '@/lib/pain/redFlags'
import type {
  PainAssociation,
  PainAssessmentInput,
  PainAssessmentResult,
  PainDuration,
  RedFlagKey,
  ScoredAssociation,
} from '@/types'

const SENSATION_WEIGHT = 2
const AGGRAVATOR_WEIGHT = 1
const MAX_ASSOCIATIONS = 3

/** Durations longer than 4 weeks nudge the result to 'monitor'. */
const CHRONIC_DURATIONS: readonly PainDuration[] = ['1-3-months', 'over-3-months']

function countMatches<T>(selected: readonly T[], match: readonly T[] | undefined): number {
  if (!match) return 0
  return match.reduce((total, item) => (selected.includes(item) ? total + 1 : total), 0)
}

/** Score associations by sensation/aggravator overlap and return the top 3. */
export function scoreAssociations(
  input: Pick<PainAssessmentInput, 'sensations' | 'aggravators'>,
  associations: readonly PainAssociation[],
): ScoredAssociation[] {
  const scored = associations.map((association) => {
    const matchedSensations = (association.match.sensations ?? []).filter((sensation) =>
      input.sensations.includes(sensation),
    )
    const matchedAggravators = (association.match.aggravators ?? []).filter((aggravator) =>
      input.aggravators.includes(aggravator),
    )
    return {
      title: association.title,
      explanation: association.explanation,
      score: matchedSensations.length * SENSATION_WEIGHT + matchedAggravators.length * AGGRAVATOR_WEIGHT,
      matchedSensations,
      matchedAggravators,
    }
  })
  const positive = scored.filter((item) => item.score > 0)
  if (positive.length === 0) return []
  return positive
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ASSOCIATIONS)
}

function resolveUrgency(input: PainAssessmentInput): PainAssessmentResult['urgency'] {
  const emergencyFlags = getEmergencyFlags(input.regionId, input.redFlags)
  if (emergencyFlags.length > 0) return 'urgent'

  const clinicianFlags = new Set(getClinicianFlags(input.regionId, input.redFlags))
  const has = (flag: RedFlagKey): boolean => clinicianFlags.has(flag)

  const injuryWithStrongSigns =
    has('recent-injury') && (input.severity >= 6 || has('swelling-redness-warmth') || has('numbness-weakness'))

  if (
    input.severity >= 8 ||
    has('numbness-weakness') ||
    has('fever') ||
    has('night-pain-rest') ||
    injuryWithStrongSigns
  ) {
    return 'see-clinician'
  }

  if (CHRONIC_DURATIONS.includes(input.duration) || (input.severity >= 6 && input.severity <= 7)) {
    return 'monitor'
  }

  return 'self-care'
}

/**
 * Run the full assessment. `associations` come from the region's content
 * (provider data) so this function stays pure and testable. The guidance is
 * composed from the region profile and the user's inputs.
 */
export function assessPain(
  input: PainAssessmentInput,
  associations: readonly PainAssociation[],
): PainAssessmentResult {
  const urgency = resolveUrgency(input)
  return {
    urgency,
    redFlags: [...input.redFlags],
    associations: scoreAssociations(input, associations),
    guidance: buildGuidance(input, urgency),
  }
}
