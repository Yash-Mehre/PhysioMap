/** Quiz engine types: seedable, pure — see `src/lib/quiz/quizEngine.ts`. */

import type { RegionId } from '@/config/regions'

export type QuizKind = 'find-it' | 'name-it'

export interface QuizQuestion {
  index: number
  kind: QuizKind
  answerRegionId: RegionId
  /** For `name-it`: four region options including the answer. */
  options: RegionId[]
}

export type QuizPhase = 'asking' | 'correct' | 'wrong'

export type QuizStatus = 'idle' | 'active' | 'done'
