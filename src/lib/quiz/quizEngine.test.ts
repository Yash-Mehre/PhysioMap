import { describe, expect, it } from 'vitest'
import { REGIONS } from '@/config/regions'
import { QUIZ_QUESTION_COUNT, createQuiz, createRng, isCorrectAnswer, tallyScore } from '@/lib/quiz/quizEngine'

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 10; i += 1) {
      expect(a()).toBe(b())
    }
  })

  it('yields values in [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 100; i += 1) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('createQuiz', () => {
  it('creates the requested number of questions with sequential indexes', () => {
    const quiz = createQuiz(123, REGIONS)
    expect(quiz).toHaveLength(QUIZ_QUESTION_COUNT)
    quiz.forEach((question, index) => {
      expect(question.index).toBe(index)
      expect(['find-it', 'name-it']).toContain(question.kind)
    })
  })

  it('is deterministic for a given seed', () => {
    const a = createQuiz(99, REGIONS)
    const b = createQuiz(99, REGIONS)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('always includes the answer among the name-it options', () => {
    const quiz = createQuiz(5, REGIONS, 20)
    for (const question of quiz) {
      if (question.kind === 'name-it') {
        expect(question.options).toHaveLength(4)
        expect(question.options).toContain(question.answerRegionId)
      } else {
        expect(question.options.length).toBeGreaterThan(0)
      }
    }
  })

  it('respects a custom question count', () => {
    expect(createQuiz(1, REGIONS, 3)).toHaveLength(3)
  })
})

describe('grading', () => {
  it('grades answers and tallies the score', () => {
    const [first, second] = createQuiz(77, REGIONS, 2)
    expect(isCorrectAnswer(first, first.answerRegionId)).toBe(true)
    const wrongRegion = REGIONS.find((region) => region.id !== first.answerRegionId)!
    expect(isCorrectAnswer(first, wrongRegion.id)).toBe(false)
    expect(tallyScore([true, false])).toBe(1)
    expect(tallyScore([isCorrectAnswer(second, second.answerRegionId)])).toBe(1)
  })
})
