/**
 * Versioned localStorage keys. ALL persisted client data flows through these
 * keys and the storage helper in `src/lib/storage/storage.ts`.
 */

const PREFIX = 'physiomap:v1' as const

export const STORAGE_KEYS = {
  prefix: PREFIX,
  workout: `${PREFIX}:workout`,
  painLog: `${PREFIX}:pain-log`,
  profile: `${PREFIX}:profile`,
  disclaimerAck: `${PREFIX}:disclaimer-ack`,
  deskChecklist: `${PREFIX}:desk-checklist`,
  quizBest: `${PREFIX}:quiz-best`,
  hydration: `${PREFIX}:hydration`,
  mealPlan: `${PREFIX}:meal-plan`,
} as const
