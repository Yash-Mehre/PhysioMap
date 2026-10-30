import { describe, expect, it } from 'vitest'
import { assessPain, scoreAssociations } from '@/lib/pain/assess'
import { getEmergencyFlags, getClinicianFlags, isCalfEmergency } from '@/lib/pain/redFlags'
import type { PainAssociation, PainAssessmentInput } from '@/types/pain'

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

const ASSOCIATIONS: readonly PainAssociation[] = [
  {
    title: 'Muscle strain',
    explanation: 'Overloaded back muscles.',
    match: { sensations: ['dull-ache', 'stiffness'], aggravators: ['lifting'] },
  },
  {
    title: 'Disc irritation',
    explanation: 'Sitting-sensitive issue.',
    match: { sensations: ['sharp', 'tingling-numbness'], aggravators: ['prolonged-sitting', 'bending'] },
  },
]

describe('red flag classification', () => {
  it('marks every always-emergency flag as urgent', () => {
    for (const flag of ['chest-pressure', 'bladder-bowel', 'cannot-bear-weight'] as const) {
      expect(getEmergencyFlags('chest', [flag])).toEqual([flag])
    }
  })

  it('escalates calf swelling + redness + warmth to emergency (DVT caution)', () => {
    expect(isCalfEmergency('calves', ['swelling-redness-warmth'])).toBe(true)
    expect(isCalfEmergency('ankles-feet', ['swelling-redness-warmth'])).toBe(true)
    expect(isCalfEmergency('lower-back', ['swelling-redness-warmth'])).toBe(false)
    expect(getEmergencyFlags('calves', ['swelling-redness-warmth'])).toEqual(['swelling-redness-warmth'])
    // Outside the calf the same flag stays clinician-level.
    expect(getClinicianFlags('lower-back', ['swelling-redness-warmth'])).toEqual(['swelling-redness-warmth'])
  })
})

describe('assessPain urgency ladder', () => {
  it('any emergency flag forces urgent', () => {
    for (const flag of ['chest-pressure', 'bladder-bowel', 'cannot-bear-weight'] as const) {
      expect(assessPain(input({ redFlags: [flag] }), ASSOCIATIONS).urgency).toBe('urgent')
    }
  })

  it('calf swelling with redness and warmth is urgent', () => {
    const result = assessPain(
      input({ regionId: 'calves', redFlags: ['swelling-redness-warmth'] }),
      ASSOCIATIONS,
    )
    expect(result.urgency).toBe('urgent')
  })

  it('severity ≥ 8 escalates to see-clinician', () => {
    expect(assessPain(input({ severity: 8 }), ASSOCIATIONS).urgency).toBe('see-clinician')
  })

  it('numbness-weakness, fever and night-pain-rest escalate to see-clinician', () => {
    for (const flag of ['numbness-weakness', 'fever', 'night-pain-rest'] as const) {
      expect(assessPain(input({ redFlags: [flag] }), ASSOCIATIONS).urgency).toBe('see-clinician')
    }
  })

  it('recent injury with strong accompanying signs escalates', () => {
    const result = assessPain(
      input({ redFlags: ['recent-injury', 'swelling-redness-warmth'] }),
      ASSOCIATIONS,
    )
    expect(result.urgency).toBe('see-clinician')
  })

  it('chronic duration or severity 6–7 lands on monitor', () => {
    expect(assessPain(input({ duration: '1-3-months' }), ASSOCIATIONS).urgency).toBe('monitor')
    expect(assessPain(input({ duration: 'over-3-months' }), ASSOCIATIONS).urgency).toBe('monitor')
    expect(assessPain(input({ severity: 7 }), ASSOCIATIONS).urgency).toBe('monitor')
  })

  it('a mild, fresh, flag-free case is self-care', () => {
    const result = assessPain(input(), ASSOCIATIONS)
    expect(result.urgency).toBe('self-care')
    expect(result.guidance.doNow.length).toBeGreaterThan(0)
    expect(result.guidance.headline).toContain('lower back')
  })

  it('echoes the reported red flags', () => {
    const result = assessPain(input({ redFlags: ['fever'] }), ASSOCIATIONS)
    expect(result.redFlags).toEqual(['fever'])
  })
})

describe('scoreAssociations', () => {
  it('scores sensations double and returns the top matches', () => {
    const scored = scoreAssociations(
      input({ sensations: ['dull-ache', 'stiffness'], aggravators: ['lifting'] }),
      ASSOCIATIONS,
    )
    expect(scored[0].title).toBe('Muscle strain')
    expect(scored[0].score).toBe(5) // 2 sensations × 2 + 1 aggravator × 1
    expect(scored).toHaveLength(1)
  })

  it('returns nothing when nothing matches', () => {
    expect(scoreAssociations(input({ sensations: ['burning'], aggravators: [] }), ASSOCIATIONS)).toEqual([])
  })
})
