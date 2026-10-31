/**
 * Tuple arrays backing the zod schemas for POST /api/pain/assess.
 * Keeping them here (next to labels in `assessment.ts`) means the API schema
 * and the TS unions in `@/types/pain` can never drift apart.
 */

import type {
  Aggravator,
  PainDuration,
  PainOnset,
  RedFlagKey,
  Sensation,
} from '@/types/pain'

export const SENSATIONS = [
  'dull-ache',
  'sharp',
  'burning',
  'tingling-numbness',
  'stiffness',
  'throbbing',
] as const satisfies readonly Sensation[]

export const AGGRAVATORS = [
  'prolonged-sitting',
  'lifting',
  'exercise',
  'bending',
  'sleeping-position',
  'typing-phone-use',
  'stairs',
  'morning',
] as const satisfies readonly Aggravator[]

export const ONSETS = ['sudden', 'gradual'] as const satisfies readonly PainOnset[]

export const DURATIONS = [
  'under-1-week',
  '1-4-weeks',
  '1-3-months',
  'over-3-months',
] as const satisfies readonly PainDuration[]

export const RED_FLAGS = [
  'numbness-weakness',
  'recent-injury',
  'fever',
  'swelling-redness-warmth',
  'chest-pressure',
  'bladder-bowel',
  'night-pain-rest',
  'cannot-bear-weight',
] as const satisfies readonly RedFlagKey[]
