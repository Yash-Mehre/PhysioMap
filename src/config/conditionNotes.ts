/**
 * Data for the "Because of your medical history" notes in the Pain Assess
 * result, plus the Build-mode training cautions. Purely informational — these
 * notes never change urgency, calculators or targets. The matching logic
 * lives in `src/lib/pain/conditionNotes.ts`.
 */

import type { MedicalConditionId } from '@/config/medicalConditions'
import type { RegionId } from '@/config/regions'
import type { Aggravator, PainDuration, PainOnset, RedFlagKey, Sensation } from '@/types/pain'

/** AND gate — every listed criterion must match for the rule to fire. */
export interface ConditionNoteAllOf {
  regions?: readonly RegionId[]
  durations?: readonly PainDuration[]
  minSeverity?: number
  redFlags?: readonly RedFlagKey[]
}

/** OR gate on top of `allOf` — at least one listed criterion must match. */
export interface ConditionNoteAnyOf {
  regions?: readonly RegionId[]
  sensations?: readonly Sensation[]
  redFlags?: readonly RedFlagKey[]
  aggravators?: readonly Aggravator[]
  onsets?: readonly PainOnset[]
}

export interface ConditionNoteRule {
  id: string
  /** User conditions that trigger this rule (any match). */
  conditions: readonly MedicalConditionId[]
  note: string
  allOf?: ConditionNoteAllOf
  anyOf?: ConditionNoteAnyOf
}

/** Rules in relevance order (most serious first); the lib caps at 3 notes. */
export const CONDITION_NOTE_RULES: readonly ConditionNoteRule[] = [
  {
    id: 'dvt-calf-urgency',
    conditions: ['blood-clot-dvt-history'],
    anyOf: { regions: ['calves', 'ankles-feet'], redFlags: ['swelling-redness-warmth'] },
    note: 'You listed a history of blood clots — pain with swelling, redness or warmth in a calf is worth treating as urgent; get seen today.',
  },
  {
    id: 'heart-related-pain',
    conditions: [
      'high-blood-pressure',
      'coronary-artery-disease',
      'previous-heart-attack',
      'heart-failure',
      'arrhythmia',
      'congenital-heart-condition',
    ],
    allOf: { regions: ['chest', 'shoulders', 'neck', 'biceps'] },
    note: 'Arm, neck or jaw pain can sometimes be heart-related with a listed heart or blood-pressure condition — call your local emergency number if it comes with breathlessness or sweating.',
  },
  {
    id: 'cancer-bone-pain',
    conditions: [
      'cancer-in-treatment',
      'cancer-in-remission',
      'breast-cancer',
      'prostate-cancer',
      'lung-cancer',
      'colorectal-cancer',
      'oral-cancer',
      'cervical-cancer',
      'blood-cancer',
      'thyroid-cancer',
      'skin-cancer',
      'other-cancer',
    ],
    anyOf: {
      redFlags: ['night-pain-rest'],
      regions: ['lower-back', 'upper-back'],
    },
    note: 'New, persistent or night-time bone or back pain with a cancer history is worth telling your oncology team about — don’t wait for the next scheduled visit.',
  },
  {
    id: 'osteoporosis-fracture-check',
    conditions: ['osteoporosis-osteopenia'],
    allOf: { regions: ['lower-back', 'upper-back', 'hips', 'forearms'] },
    anyOf: { onsets: ['sudden'], redFlags: ['recent-injury'], aggravators: ['lifting'] },
    note: 'Sudden pain in the spine, hip or wrist after a minor fall or lifting can signal a small fracture when bones are weakened — get assessed before exercising.',
  },
  {
    id: 'pregnancy-pelvic-care',
    conditions: ['pregnant', 'postpartum'],
    allOf: { regions: ['lower-back', 'hips', 'abs'] },
    note: 'Check with your obstetrician or a pelvic-health physiotherapist before training through this — avoid heavy lifting and deep twisting for now.',
  },
  {
    id: 'recent-surgery-site',
    conditions: ['recent-surgery'],
    note: 'You listed recent surgery — if this pain is near the surgical site, contact your surgeon before exercising.',
  },
  {
    id: 'kidney-stone-colicky-pain',
    conditions: ['kidney-stones'],
    allOf: { regions: ['lower-back', 'obliques'], minSeverity: 6 },
    anyOf: { onsets: ['sudden'] },
    note: 'Sudden, severe one-sided pain here can be linked to a kidney stone when you have a history of stones — seek care if it comes with nausea, fever or blood in urine.',
  },
  {
    id: 'neuro-neck-assessment',
    conditions: ['epilepsy', 'vertigo-dizziness', 'previous-head-injury'],
    allOf: { regions: ['neck'] },
    note: 'Neck pain together with dizziness or headache after a head or nerve condition needs assessment — mention both symptoms.',
  },
  {
    id: 'inflammatory-morning-stiffness',
    conditions: ['rheumatoid-arthritis', 'ankylosing-spondylitis'],
    anyOf: { aggravators: ['morning'] },
    note: 'Morning stiffness lasting more than an hour is worth reporting to your rheumatologist — it can be linked to inflammatory arthritis.',
  },
  {
    id: 'pacemaker-loading',
    conditions: ['pacemaker-implanted-device'],
    allOf: { regions: ['chest', 'shoulders'] },
    note: 'Avoid heavy chest or shoulder loading until your cardiologist has cleared it.',
  },
  {
    id: 'joint-replacement-review',
    conditions: ['joint-replacement'],
    allOf: { regions: ['knees', 'hips'] },
    note: 'New pain in a replaced joint is worth reporting to your orthopaedic surgeon.',
  },
  {
    id: 'asthma-chest-tightness',
    conditions: ['asthma', 'copd', 'chronic-bronchitis'],
    allOf: { regions: ['chest', 'upper-back'] },
    note: 'Breathing-related tightness is different from muscle pain — use your prescribed plan and seek care if it gets worse.',
  },
  {
    id: 'diabetes-foot-check',
    conditions: ['type-1-diabetes', 'type-2-diabetes', 'prediabetes-insulin-resistance'],
    anyOf: { sensations: ['tingling-numbness'], regions: ['ankles-feet'] },
    note: 'Numbness or tingling with diabetes is worth a check-up soon — look over your feet daily.',
  },
  {
    id: 'blood-disorder-bruising',
    conditions: ['anaemia', 'bleeding-clotting-disorder', 'thalassemia-sickle-cell'],
    allOf: { redFlags: ['recent-injury', 'swelling-redness-warmth'] },
    note: 'Sudden swelling or bruising after an injury is worth getting checked sooner with a listed blood condition.',
  },
]

/** Conditions that warrant the Build-mode training caution line. */
export const TRAINING_CAUTION_CONDITIONS: readonly MedicalConditionId[] = [
  'high-blood-pressure',
  'coronary-artery-disease',
  'previous-heart-attack',
  'heart-failure',
  'arrhythmia',
  'congenital-heart-condition',
  'pregnant',
  'recent-surgery',
  'osteoporosis-osteopenia',
]
