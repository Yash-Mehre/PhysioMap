/**
 * Read-only formatting helpers for the saved medical history, shared by the
 * profile sheet (grouped chips) and the health-summary PDF/print preview.
 */

import {
  MEDICAL_CONDITION_BY_ID,
  MEDICAL_CONDITION_GROUPS,
  MEDICAL_CONDITION_GROUP_LABELS,
} from '@/config/medicalConditions'
import type { MedicalCondition, MedicalConditionGroup, MedicalConditionId } from '@/config/medicalConditions'

export const MEDICAL_HISTORY_NONE_LABEL = 'None reported'

export interface GroupedMedicalConditions {
  group: MedicalConditionGroup | 'other'
  label: string
  conditions: readonly MedicalCondition[]
}

/** Group selected conditions for chip display, preserving the config order. */
export function groupMedicalConditions(
  conditions: readonly MedicalConditionId[],
): GroupedMedicalConditions[] {
  const grouped: GroupedMedicalConditions[] = []
  for (const group of MEDICAL_CONDITION_GROUPS) {
    const matched = conditions
      .filter((id) => MEDICAL_CONDITION_BY_ID[id]?.group === group)
      .map((id) => MEDICAL_CONDITION_BY_ID[id])
    if (matched.length > 0) {
      grouped.push({ group, label: MEDICAL_CONDITION_GROUP_LABELS[group], conditions: matched })
    }
  }
  return grouped
}

/** Flat, human-readable list for the PDF profile snapshot line. */
export function formatMedicalHistory(
  conditions: readonly MedicalConditionId[],
  otherConditions: readonly string[],
): string {
  const labels = conditions.map((id) => MEDICAL_CONDITION_BY_ID[id]?.label ?? id)
  const others = otherConditions.map((item) => `Other: ${item}`)
  const all = [...labels, ...others]
  return all.length > 0 ? all.join(', ') : MEDICAL_HISTORY_NONE_LABEL
}
