/**
 * Quiz session state (NOT persisted). The avatar highlights the target region
 * during "name-it" questions and flashes green/red on answers. Best score is
 * persisted via the storage helper.
 */

import { create } from 'zustand'
import { readStoredValue, writeStoredValue } from '@/lib/storage/storage'
import { registerStoreReset } from '@/lib/storage/resetAll'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { isCorrectAnswer } from '@/lib/quiz/quizEngine'
import type { QuizPhase, QuizQuestion, QuizStatus, RegionId } from '@/types'

interface QuizState {
  status: QuizStatus
  questions: QuizQuestion[]
  index: number
  score: number
  streak: number
  bestStreak: number
  phase: QuizPhase
  pickedRegionId: RegionId | null
  bestScore: number
  start: (questions: QuizQuestion[]) => void
  answer: (pickedRegionId: RegionId) => boolean
  advance: () => void
  reset: () => void
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  status: 'idle',
  questions: [],
  index: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  phase: 'asking',
  pickedRegionId: null,
  bestScore: readStoredValue<number>(STORAGE_KEYS.quizBest, 0),

  start: (questions) =>
    set({
      status: 'active',
      questions,
      index: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      phase: 'asking',
      pickedRegionId: null,
    }),

  answer: (pickedRegionId) => {
    const { status, questions, index } = get()
    if (status !== 'active') return false
    const question = questions[index]
    if (!question) return false
    const correct = isCorrectAnswer(question, pickedRegionId)
    set((state) => {
      const streak = correct ? state.streak + 1 : 0
      return {
        phase: correct ? 'correct' : 'wrong',
        pickedRegionId,
        score: correct ? state.score + 1 : state.score,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
      }
    })
    return correct
  },

  advance: () => {
    const { index, questions, score, bestScore } = get()
    if (index + 1 >= questions.length) {
      const finalBest = Math.max(bestScore, score)
      writeStoredValue(STORAGE_KEYS.quizBest, finalBest)
      set({ status: 'done', phase: 'asking', pickedRegionId: null, bestScore: finalBest })
      return
    }
    set({ index: index + 1, phase: 'asking', pickedRegionId: null })
  },

  reset: () =>
    set({
      status: 'idle',
      questions: [],
      index: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      phase: 'asking',
      pickedRegionId: null,
    }),
}))

/** Selector: the currently active question (or null). */
export function selectActiveQuestion(state: QuizState): QuizQuestion | null {
  if (state.status !== 'active') return null
  return state.questions[state.index] ?? null
}

/** Log out clears the persisted best score and any running quiz session. */
registerStoreReset(() => {
  useQuizStore.getState().reset()
  useQuizStore.setState({ bestScore: 0 })
})
