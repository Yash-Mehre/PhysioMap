/** Pain-mode types: symptom catalogs, associations, assessment and logging. */

import type { RegionId } from '@/config/regions'
import type { ReliefExercise } from '@/types/exercise'

export type Sensation =
  | 'dull-ache'
  | 'sharp'
  | 'burning'
  | 'tingling-numbness'
  | 'stiffness'
  | 'throbbing'

export type Aggravator =
  | 'prolonged-sitting'
  | 'lifting'
  | 'exercise'
  | 'bending'
  | 'sleeping-position'
  | 'typing-phone-use'
  | 'stairs'
  | 'morning'

export type PainOnset = 'sudden' | 'gradual'

export type PainDuration = 'under-1-week' | '1-4-weeks' | '1-3-months' | 'over-3-months'

export type RedFlagKey =
  | 'numbness-weakness'
  | 'recent-injury'
  | 'fever'
  | 'swelling-redness-warmth'
  | 'chest-pressure'
  | 'bladder-bowel'
  | 'night-pain-rest'
  | 'cannot-bear-weight'

export interface PainAssociation {
  title: string
  explanation: string
  match: { sensations?: Sensation[]; aggravators?: Aggravator[] }
}

export interface ErgonomicTip {
  title: string
  detail: string
}

export interface Remedy {
  title: string
  detail: string
  whenToUse: string
  stopWhen: string
}

export interface PainInfo {
  associations: PainAssociation[]
  relief: ReliefExercise[]
  ergonomics: ErgonomicTip[]
  remedies: Remedy[]
  redFlagNotes: string[]
}

/** Input accepted by the pure rule engine and POST /api/pain/assess. */
export interface PainAssessmentInput {
  regionId: RegionId
  sensations: Sensation[]
  severity: number
  onset: PainOnset
  duration: PainDuration
  aggravators: Aggravator[]
  redFlags: RedFlagKey[]
}

export type PainUrgency = 'self-care' | 'monitor' | 'see-clinician' | 'urgent'

export interface ScoredAssociation {
  title: string
  explanation: string
  score: number
  matchedSensations: Sensation[]
  matchedAggravators: Aggravator[]
}

/** Region- and input-specific guidance produced by the guidance composer. */
export interface PainGuidance {
  /** One urgency headline naming the region and its specialist. */
  headline: string
  /** Immediate actions (1–3 lines). */
  doNow: string[]
  /** Things to avoid (1–3 lines). */
  avoid: string[]
  /** Symptoms that would make it worse (1–3 lines). */
  watchFor: string[]
  /** Follow-up plan quoting the user's own numbers (1–3 lines). */
  followUp: string[]
  /** Short chips summarising the user's inputs. */
  basedOn: string[]
}

export interface PainAssessmentResult {
  urgency: PainUrgency
  redFlags: RedFlagKey[]
  associations: ScoredAssociation[]
  guidance: PainGuidance
}

export interface PainLogEntry {
  id: string
  date: string
  regionId: RegionId
  severity: number
  sensations: Sensation[]
  urgency: PainUrgency | null
}
