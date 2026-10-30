/**
 * Red-flag classification for the pain rule engine.
 * `emergency` flags map to urgency 'urgent'; `clinician` flags map to
 * 'see-clinician' unless an emergency flag is also present.
 */

import type { RegionId } from '@/config/regions'
import type { RedFlagKey } from '@/types'

export type RedFlagLevel = 'emergency' | 'clinician'

export const RED_FLAG_LEVELS: Record<RedFlagKey, RedFlagLevel> = {
  'chest-pressure': 'emergency',
  'bladder-bowel': 'emergency',
  'cannot-bear-weight': 'emergency',
  'swelling-redness-warmth': 'clinician', // escalates to emergency in calf regions
  'recent-injury': 'clinician',
  'numbness-weakness': 'clinician',
  fever: 'clinician',
  'night-pain-rest': 'clinician',
}

/** Regions where "swelling with redness and warmth" suggests a deep-calf issue (DVT caution). */
const CALF_REGIONS: readonly RegionId[] = ['calves', 'ankles-feet']

/** True when the swelling red-flag should be treated as an emergency (calf region). */
export function isCalfEmergency(regionId: RegionId, flags: readonly RedFlagKey[]): boolean {
  return flags.includes('swelling-redness-warmth') && CALF_REGIONS.includes(regionId)
}

/** Emergency-level flags active for this input (always-emergency + contextual calf rule). */
export function getEmergencyFlags(regionId: RegionId, flags: readonly RedFlagKey[]): RedFlagKey[] {
  return flags.filter((flag) => RED_FLAG_LEVELS[flag] === 'emergency' || (flag === 'swelling-redness-warmth' && isCalfEmergency(regionId, flags)))
}

/** Clinician-level flags (excluding any already counted as emergencies). */
export function getClinicianFlags(regionId: RegionId, flags: readonly RedFlagKey[]): RedFlagKey[] {
  const emergencies = new Set(getEmergencyFlags(regionId, flags))
  return flags.filter((flag) => RED_FLAG_LEVELS[flag] === 'clinician' && !emergencies.has(flag))
}
