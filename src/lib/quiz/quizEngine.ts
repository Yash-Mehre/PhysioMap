/**
 * Pure, seedable quiz engine. Two question kinds:
 * - `find-it`: a name is shown, the user taps the correct region on the avatar.
 * - `name-it`: a region glows on the avatar, the user picks from 4 options.
 * Deterministic for a given seed (mulberry32 PRNG).
 */

import type { Region, RegionId } from '@/types'
import type { QuizQuestion } from '@/types'

export const QUIZ_QUESTION_COUNT = 10
export const NAME_IT_OPTION_COUNT = 4

/** Mulberry32 — tiny deterministic PRNG. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickRandom<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Generate a quiz. Alternates randomly between `find-it` and `name-it`;
 * `name-it` questions include 4 shuffled options containing the answer.
 */
export function createQuiz(
  seed: number,
  regions: readonly Region[],
  count: number = QUIZ_QUESTION_COUNT,
): QuizQuestion[] {
  const rng = createRng(seed)
  const pool = shuffle(regions, rng)
  const questions: QuizQuestion[] = []

  for (let index = 0; index < count; index += 1) {
    const answer = pool[index % pool.length]
    const kind = rng() < 0.5 ? 'find-it' : 'name-it'
    const distractors = shuffle(
      regions.filter((region) => region.id !== answer.id),
      rng,
    ).slice(0, NAME_IT_OPTION_COUNT - 1)
    questions.push({
      index,
      kind,
      answerRegionId: answer.id,
      options: shuffle([answer.id, ...distractors.map((region) => region.id)], rng),
    })
  }
  return questions
}

/** Grade an answer. */
export function isCorrectAnswer(question: QuizQuestion, pickedRegionId: RegionId): boolean {
  return pickedRegionId === question.answerRegionId
}

/** Current score after a session (correct count). */
export function tallyScore(answers: readonly boolean[]): number {
  return answers.filter(Boolean).length
}
