/**
 * Pure matching logic for the medical-history notes: which condition-note
 * rules fire for a pain assessment (informational only — never changes
 * urgency or targets) and which Build-mode training cautions apply.
 * Processed client-side only; the medical history is never sent to an API.
 */

import { MEDICAL_CONDITION_BY_ID } from '@/config/medicalConditions'
import type { MedicalConditionId } from '@/config/medicalConditions'
import {
  CONDITION_NOTE_RULES,
  TRAINING_CAUTION_CONDITIONS,
} from '@/config/conditionNotes'
import type { ConditionNoteAllOf, ConditionNoteAnyOf } from '@/config/conditionNotes'
import type { RegionId } from '@/config/regions'
import type { PainAssessmentInput } from '@/types/pain'

const MAX_NOTES = 3

function matchesAllOf(gate: ConditionNoteAllOf | undefined, regionId: RegionId, input: PainAssessmentInput): boolean {
  if (gate === undefined) return true
  if (gate.regions !== undefined && !gate.regions.includes(regionId)) return false
  if (gate.durations !== undefined && !gate.durations.includes(input.duration)) return false
  if (gate.minSeverity !== undefined && input.severity < gate.minSeverity) return false
  if (gate.redFlags !== undefined && !gate.redFlags.every((flag) => input.redFlags.includes(flag))) return false
  return true
}

function matchesAnyOf(gate: ConditionNoteAnyOf | undefined, regionId: RegionId, input: PainAssessmentInput): boolean {
  if (gate === undefined) return true
  const regionMatch = gate.regions?.includes(regionId) ?? false
  const sensationMatch = gate.sensations?.some((sensation) => input.sensations.includes(sensation)) ?? false
  const redFlagMatch = gate.redFlags?.some((flag) => input.redFlags.includes(flag)) ?? false
  const aggravatorMatch = gate.aggravators?.some((aggravator) => input.aggravators.includes(aggravator)) ?? false
  const onsetMatch = gate.onsets?.includes(input.onset) ?? false
  return regionMatch || sensationMatch || redFlagMatch || aggravatorMatch || onsetMatch
}

/**
 * Up to 3 short, informational notes for the Pain Assess result, derived
 * from the user's saved medical history and the current assessment input.
 */
export function getConditionNotes(
  conditions: readonly MedicalConditionId[],
  regionId: RegionId,
  input: PainAssessmentInput,
): string[] {
  const notes: string[] = []
  for (const rule of CONDITION_NOTE_RULES) {
    if (notes.length >= MAX_NOTES) break
    const triggered = rule.conditions.some((condition) => conditions.includes(condition))
    if (!triggered) continue
    if (!matchesAllOf(rule.allOf, regionId, input)) continue
    if (!matchesAnyOf(rule.anyOf, regionId, input)) continue
    if (!notes.includes(rule.note)) notes.push(rule.note)
  }
  return notes
}

/** Build-mode caution lines, e.g. "You listed Pregnancy. Check with your doctor before starting intense training." */
export function getTrainingCautions(conditions: readonly MedicalConditionId[]): string[] {
  return TRAINING_CAUTION_CONDITIONS.filter(
    (condition) => conditions.includes(condition) && MEDICAL_CONDITION_BY_ID[condition] !== undefined,
  ).map(
    (condition) =>
      `You listed ${MEDICAL_CONDITION_BY_ID[condition].label}. Check with your doctor before starting intense training.`,
  )
}
