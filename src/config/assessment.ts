/**
 * Pain assessment form catalogs. The `Record<Union, string>` pattern makes
 * TypeScript enforce that every enum member has a label — labels can never
 * drift from the union types in `src/types/pain.ts`.
 */

import type {
  Aggravator,
  PainDuration,
  PainOnset,
  RedFlagKey,
  Sensation,
} from '@/types/pain'

export const SENSATION_LABELS: Record<Sensation, string> = {
  'dull-ache': 'Dull ache',
  sharp: 'Sharp',
  burning: 'Burning',
  'tingling-numbness': 'Tingling / numbness',
  stiffness: 'Stiffness',
  throbbing: 'Throbbing',
}

export const AGGRAVATOR_LABELS: Record<Aggravator, string> = {
  'prolonged-sitting': 'Prolonged sitting',
  lifting: 'Lifting',
  exercise: 'Exercise',
  bending: 'Bending',
  'sleeping-position': 'Sleeping position',
  'typing-phone-use': 'Typing / phone use',
  stairs: 'Stairs',
  morning: 'Mornings',
}

export const ONSET_LABELS: Record<PainOnset, string> = {
  sudden: 'Sudden (minutes to hours)',
  gradual: 'Gradual (over days)',
}

export const DURATION_LABELS: Record<PainDuration, string> = {
  'under-1-week': 'Less than 1 week',
  '1-4-weeks': '1–4 weeks',
  '1-3-months': '1–3 months',
  'over-3-months': 'Over 3 months',
}

export const RED_FLAG_LABELS: Record<RedFlagKey, string> = {
  'numbness-weakness': 'Numbness or tingling with weakness',
  'recent-injury': 'Recent fall or injury',
  fever: 'Fever',
  'swelling-redness-warmth': 'Swelling with redness and warmth',
  'chest-pressure': 'Chest pressure or pain',
  'bladder-bowel': 'Loss of bladder/bowel control',
  'night-pain-rest': 'Night pain at rest',
  'cannot-bear-weight': 'Cannot bear weight',
}

export const RED_FLAG_DESCRIPTIONS: Record<RedFlagKey, string> = {
  'numbness-weakness': 'Nerve-type symptoms together with noticeable weakness.',
  'recent-injury': 'A significant fall, impact or strain in the last few days.',
  fever: 'Raised temperature alongside the pain.',
  'swelling-redness-warmth': 'A joint or limb that is visibly swollen, red and warm.',
  'chest-pressure': 'Any chest pressure, tightness or pain — treat as an emergency.',
  'bladder-bowel': 'New loss of bladder or bowel control — treat as an emergency.',
  'night-pain-rest': 'Pain that wakes you or persists even at complete rest.',
  'cannot-bear-weight': 'Being unable to put weight on the limb — treat as an emergency.',
}
