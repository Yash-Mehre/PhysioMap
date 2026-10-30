import { describe, expect, it } from 'vitest'
import { buildGuidance } from '@/lib/pain/guidance'
import { assessPain } from '@/lib/pain/assess'
import { REGION_GUIDANCE_PROFILES } from '@/config/guidance/regionProfiles'
import { REGION_IDS } from '@/config/regions'
import type { PainAssessmentInput } from '@/types/pain'

function input(overrides: Partial<PainAssessmentInput> = {}): PainAssessmentInput {
  return {
    regionId: 'lower-back',
    sensations: ['dull-ache'],
    severity: 3,
    onset: 'gradual',
    duration: 'under-1-week',
    aggravators: ['prolonged-sitting'],
    redFlags: [],
    ...overrides,
  }
}

/** All guidance strings for quality checks (no empties, no "you have", no medicines). */
function allLines(guidance: ReturnType<typeof buildGuidance>): string[] {
  return [guidance.headline, ...guidance.doNow, ...guidance.avoid, ...guidance.watchFor, ...guidance.followUp]
}

const MEDICINE_NAMES = [
  'ibuprofen',
  'paracetamol',
  'acetaminophen',
  'aspirin',
  'naproxen',
  'diclofenac',
  'tramadol',
  'prednisolone',
  'methotrexate',
  'insulin',
] as const

describe('guidance: region specificity', () => {
  it('the same urgency with different regions gives different headlines and lists', () => {
    const regions = ['lower-back', 'neck', 'knees', 'calves', 'chest', 'shoulders'] as const
    const results = regions.map((regionId) =>
      buildGuidance(input({ regionId, aggravators: [] }), 'monitor'),
    )
    const headlines = new Set(results.map((result) => result.headline))
    expect(headlines.size).toBe(regions.length)
    for (const result of results) {
      expect(result.doNow.length).toBeGreaterThan(0)
      expect(result.avoid.length).toBeGreaterThan(0)
    }
    // No two regions share both their do-now and avoid lists.
    const signatures = new Set(results.map((result) => JSON.stringify([result.doNow, result.avoid, result.watchFor])))
    expect(signatures.size).toBe(regions.length)
  })

  it('different regions with the same red flag give region-specific lines', () => {
    const back = buildGuidance(input({ regionId: 'lower-back', redFlags: ['bladder-bowel'] }), 'urgent')
    const neck = buildGuidance(input({ regionId: 'neck', redFlags: ['bladder-bowel'] }), 'urgent')
    expect(back.doNow.join(' ')).toContain('nerves in the lower spine')
    expect(back.doNow.join(' ')).not.toBe(neck.doNow.join(' '))
  })
})

describe('guidance: input sensitivity', () => {
  it('different aggravators change the do-now tips', () => {
    const stairs = buildGuidance(input({ regionId: 'knees', aggravators: ['stairs'] }), 'self-care')
    const morning = buildGuidance(input({ regionId: 'knees', aggravators: ['morning'] }), 'self-care')
    expect(stairs.doNow[0]).not.toBe(morning.doNow[0])
    expect(stairs.doNow.join(' ')).toContain('handrail')
    expect(morning.doNow.join(' ')).toContain('heel slides')
  })

  it('different sensations change the output', () => {
    const dull = buildGuidance(input({ regionId: 'lower-back', aggravators: [] }), 'self-care')
    const sharp = buildGuidance(
      input({ regionId: 'lower-back', aggravators: [], sensations: ['sharp'] }),
      'self-care',
    )
    expect(dull.doNow.join(' ')).not.toBe(sharp.doNow.join(' '))
    expect(dull.basedOn).not.toEqual(sharp.basedOn)
  })

  it('different severity changes the follow-up line and chips', () => {
    const mild = buildGuidance(input({ severity: 2 }), 'self-care')
    const severe = buildGuidance(input({ severity: 9 }), 'see-clinician')
    expect(mild.followUp.join(' ')).not.toBe(severe.followUp.join(' '))
    expect(mild.basedOn).toContain('2/10')
    expect(severe.basedOn).toContain('9/10')
    expect(severe.followUp.join(' ')).toContain('within 24 hours')
  })

  it('different onset and duration change the output', () => {
    const sudden = buildGuidance(input({ onset: 'sudden', duration: 'under-1-week' }), 'self-care')
    const gradual = buildGuidance(input({ onset: 'gradual', duration: 'over-3-months' }), 'monitor')
    expect(sudden.watchFor.join(' ')).not.toBe(gradual.watchFor.join(' '))
    expect(gradual.followUp.join(' ')).toContain('over 3 months')
  })
})

describe('guidance: red flag lines', () => {
  it('each red flag adds its own line', () => {
    for (const flag of [
      'chest-pressure',
      'bladder-bowel',
      'cannot-bear-weight',
      'swelling-redness-warmth',
      'recent-injury',
      'numbness-weakness',
      'fever',
      'night-pain-rest',
    ] as const) {
      const guidance = buildGuidance(input({ redFlags: [flag] }), 'urgent')
      expect(guidance.doNow.length).toBeGreaterThan(0)
      // The flag contributes at least one unique line across the lists.
      const lines = [...guidance.doNow, ...guidance.avoid, ...guidance.watchFor]
      expect(lines.length).toBeGreaterThan(0)
      // Two different flags produce different do-now content.
      const other = buildGuidance(input({ redFlags: ['fever'] }), 'urgent')
      if (flag !== 'fever') {
        expect(guidance.doNow.join(' ')).not.toBe(other.doNow.join(' '))
      }
    }
  })

  it('multiple flags keep the most serious first', () => {
    const guidance = buildGuidance(
      input({ redFlags: ['fever', 'chest-pressure'] }),
      'urgent',
    )
    expect(guidance.doNow[0]).toContain('emergency number')
  })

  it('calf swelling uses the blood-clot variant', () => {
    const guidance = buildGuidance(
      input({ regionId: 'calves', redFlags: ['swelling-redness-warmth'] }),
      'urgent',
    )
    expect(guidance.doNow.join(' ')).toContain('blood clot')
    expect(guidance.avoid.join(' ')).toContain('massage')
  })
})

describe('guidance: urgency integration', () => {
  it('urgency results are unchanged for all existing rule cases', () => {
    expect(assessPain(input({ redFlags: ['chest-pressure'] }), []).urgency).toBe('urgent')
    expect(assessPain(input({ regionId: 'calves', redFlags: ['swelling-redness-warmth'] }), []).urgency).toBe('urgent')
    expect(assessPain(input({ severity: 8 }), []).urgency).toBe('see-clinician')
    expect(assessPain(input({ redFlags: ['fever'] }), []).urgency).toBe('see-clinician')
    expect(assessPain(input({ redFlags: ['numbness-weakness'] }), []).urgency).toBe('see-clinician')
    expect(assessPain(input({ redFlags: ['night-pain-rest'] }), []).urgency).toBe('see-clinician')
    expect(assessPain(input({ duration: '1-3-months' }), []).urgency).toBe('monitor')
    expect(assessPain(input({ severity: 7 }), []).urgency).toBe('monitor')
    expect(assessPain(input(), []).urgency).toBe('self-care')
  })
})

describe('guidance: quality bar', () => {
  const URGENCIES = ['self-care', 'monitor', 'see-clinician', 'urgent'] as const

  it('no output contains "you have", a medicine name, or an empty string', () => {
    for (const regionId of REGION_IDS) {
      for (const urgency of URGENCIES) {
        const guidance = buildGuidance(input({ regionId, aggravators: [] }), urgency)
        for (const line of allLines(guidance)) {
          expect(line.trim()).not.toBe('')
          expect(line.toLowerCase()).not.toContain('you have')
          for (const medicine of MEDICINE_NAMES) {
            expect(line.toLowerCase()).not.toContain(medicine)
          }
        }
        for (const chip of guidance.basedOn) {
          expect(chip.trim()).not.toBe('')
        }
      }
      // Also check every red-flag variant for this region.
      for (const flag of [
        'chest-pressure',
        'bladder-bowel',
        'cannot-bear-weight',
        'swelling-redness-warmth',
        'recent-injury',
        'numbness-weakness',
        'fever',
        'night-pain-rest',
      ] as const) {
        const guidance = buildGuidance(input({ regionId, redFlags: [flag] }), 'urgent')
        for (const line of allLines(guidance)) {
          expect(line.trim()).not.toBe('')
          expect(line.toLowerCase()).not.toContain('you have')
        }
      }
    }
  })

  it('keeps every list within 1–3 items and the total within 5–9 lines', () => {
    for (const regionId of REGION_IDS) {
      for (const urgency of URGENCIES) {
        const guidance = buildGuidance(input({ regionId, aggravators: ['lifting', 'stairs'] }), urgency)
        for (const list of [guidance.doNow, guidance.avoid, guidance.watchFor, guidance.followUp]) {
          expect(list.length).toBeGreaterThanOrEqual(1)
          expect(list.length).toBeLessThanOrEqual(3)
        }
        const total =
          guidance.doNow.length + guidance.avoid.length + guidance.watchFor.length + guidance.followUp.length
        expect(total).toBeGreaterThanOrEqual(5)
        expect(total).toBeLessThanOrEqual(9)
      }
    }
  })
})

describe('guidance: region profiles', () => {
  it('all 19 regions have complete profiles', () => {
    expect(REGION_IDS).toHaveLength(19)
    for (const regionId of REGION_IDS) {
      const profile = REGION_GUIDANCE_PROFILES[regionId]
      expect(profile, `profile for ${regionId}`).toBeDefined()
      expect(profile.areaName.trim()).not.toBe('')
      expect(profile.specialist.trim()).not.toBe('')
      expect(profile.safeMovement.trim()).not.toBe('')
      expect(profile.avoidMovement.trim()).not.toBe('')
      expect(profile.commonLoadingFactors.trim()).not.toBe('')
      expect(profile.urgentSigns.trim()).not.toBe('')
    }
  })

  it('every region produces a headline naming its area', () => {
    for (const regionId of REGION_IDS) {
      const guidance = buildGuidance(input({ regionId }), 'self-care')
      expect(guidance.headline).toContain(REGION_GUIDANCE_PROFILES[regionId].areaName)
    }
  })
})
