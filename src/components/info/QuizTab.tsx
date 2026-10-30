'use client'

/**
 * Quiz tab: "Find it" (tap the named region on the body) and "Name it" (a
 * region glows — pick from 4 options). 10 questions, score, streak, best
 * score persisted. Correct = green flash; wrong = shake + reveal.
 */

import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, CheckCircle2, Play, RotateCcw, Target, Trophy, XCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REGION_BY_ID } from '@/config/regions'
import { createQuiz } from '@/lib/quiz/quizEngine'
import { useHydrated } from '@/hooks/useHydrated'
import { useRegions } from '@/hooks/useRegionContent'
import { useQuizStore } from '@/store/useQuizStore'
import { useExplorerStore } from '@/store/useExplorerStore'
import { cn } from '@/lib/utils'

const FEEDBACK_DELAY_MS = 1500

export function QuizTab() {
  const hydrated = useHydrated()
  const { data: regions } = useRegions()

  const status = useQuizStore((state) => state.status)
  const questions = useQuizStore((state) => state.questions)
  const index = useQuizStore((state) => state.index)
  const score = useQuizStore((state) => state.score)
  const streak = useQuizStore((state) => state.streak)
  const bestStreak = useQuizStore((state) => state.bestStreak)
  const bestScore = useQuizStore((state) => state.bestScore)
  const phase = useQuizStore((state) => state.phase)
  const start = useQuizStore((state) => state.start)
  const answer = useQuizStore((state) => state.answer)
  const advance = useQuizStore((state) => state.advance)
  const reset = useQuizStore((state) => state.reset)
  const selectRegion = useExplorerStore((state) => state.selectRegion)

  const question = status === 'active' ? (questions[index] ?? null) : null

  const handleStart = useCallback((): void => {
    if (!regions) return
    selectRegion(null)
    start(createQuiz(Date.now() % 100000, regions))
  }, [regions, start, selectRegion])

  // Auto-advance after feedback.
  useEffect(() => {
    if (status !== 'active' || phase === 'asking') return
    const timer = window.setTimeout(() => advance(), FEEDBACK_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [status, phase, advance])

  const optionLabels = useMemo(() => {
    if (!question) return []
    return question.options.map((regionId) => REGION_BY_ID[regionId].label)
  }, [question])

  if (!hydrated || !regions) {
    return <div className="h-24 animate-pulse rounded-xl bg-white/5" aria-busy="true" />
  }

  if (status === 'idle') {
    return (
      <div className="space-y-4 rounded-xl border border-white/8 bg-surface-raised/60 p-5 text-center">
        <Target className="mx-auto h-8 w-8 text-mode-info" aria-hidden="true" />
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">Anatomy quiz</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Two kinds of questions — <span className="text-mode-info">Find it</span> (a name appears; tap the right
            region on the body) and <span className="text-mode-info">Name it</span> (a region glows; pick from 4
            options). 10 questions.
          </p>
        </div>
        <Button onClick={handleStart} className="bg-mode-info text-[#1A1208] hover:bg-mode-info/85">
          <Play className="mr-1.5 h-4 w-4" aria-hidden="true" /> Start quiz
        </Button>
        {bestScore > 0 ? (
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
            Best score: <span className="font-semibold text-copper">{bestScore}/10</span>
          </p>
        ) : null}
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="space-y-4 rounded-xl border border-white/8 bg-surface-raised/60 p-5 text-center">
        <Award className="mx-auto h-8 w-8 text-copper" aria-hidden="true" />
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {score >= 8 ? 'Anatomy master!' : score >= 5 ? 'Solid knowledge!' : 'Good warm-up!'}
          </h2>
          <p className="mt-1 font-heading text-3xl font-bold text-mode-info">
            {score}
            <span className="text-base text-muted-foreground">/10</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Best streak this round: {bestStreak} · Personal best: {Math.max(bestScore, score)}/10
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={handleStart} className="bg-mode-info text-[#1A1208] hover:bg-mode-info/85">
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" /> Play again
          </Button>
          <Button variant="outline" onClick={reset} className="border-white/15 text-muted-foreground">
            Close quiz
          </Button>
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-[0.16em] text-mode-info">
          Q{index + 1}/{questions.length}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-mode-build" aria-hidden="true" />
            {score}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
            streak {streak}
          </span>
        </span>
      </header>

      <div className="grid grid-cols-10 gap-1" aria-hidden="true">
        {questions.map((_, questionIndex) => (
          <span
            key={questionIndex}
            className={cn(
              'h-1 rounded-full',
              questionIndex < index
                ? 'bg-mode-build/60'
                : questionIndex === index
                  ? 'bg-mode-info'
                  : 'bg-white/10',
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${index}-${phase}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div
            className={cn(
              'rounded-xl border p-4 text-center',
              phase === 'correct' && 'border-mode-build/50 bg-mode-build/10',
              phase === 'wrong' && 'border-mode-pain/50 bg-mode-pain/10',
              phase === 'asking' && 'border-mode-info/30 bg-surface-raised/60',
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mode-info">
              {question.kind === 'find-it' ? 'Find it — tap the body' : 'Name it — pick the glowing region'}
            </p>
            <motion.p
              className="mt-2 font-heading text-xl font-bold text-foreground"
              animate={phase === 'wrong' ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {question.kind === 'find-it'
                ? `Tap: ${REGION_BY_ID[question.answerRegionId].label}`
                : 'Which region is highlighted?'}
            </motion.p>
            {phase !== 'asking' ? (
              <p
                className={cn(
                  'mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold',
                  phase === 'correct' ? 'text-mode-build' : 'text-mode-pain',
                )}
                role="status"
              >
                {phase === 'correct' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" aria-hidden="true" /> It’s the{' '}
                    {REGION_BY_ID[question.answerRegionId].label}
                  </>
                )}
              </p>
            ) : null}
          </div>

          {question.kind === 'name-it' ? (
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((regionId, optionIndex) => (
                <Button
                  key={regionId}
                  variant="outline"
                  disabled={phase !== 'asking'}
                  onClick={() => answer(regionId)}
                  className={cn(
                    'h-auto whitespace-normal border-white/12 py-3 text-xs font-medium text-muted-foreground hover:text-foreground',
                    phase !== 'asking' &&
                      regionId === question.answerRegionId &&
                      'border-mode-build/60 bg-mode-build/15 text-mode-build',
                    phase === 'wrong' &&
                      regionId !== question.answerRegionId &&
                      'opacity-50',
                  )}
                >
                  {optionLabels[optionIndex]}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center text-[11px] text-muted-foreground">
              The body map on the left is live — tap the region directly on the 3D avatar or use the region list.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
