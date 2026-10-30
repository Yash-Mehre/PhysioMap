'use client'

/**
 * ReliefPlayer: full-screen guided session with a big countdown ring,
 * pause/resume, previous/next and progress dots.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RELIEF_KIND_LABELS } from '@/config/labels'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ReliefExercise } from '@/types'

const REP_SECONDS = 4
const RING_RADIUS = 78
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export interface ReliefPlayerProps {
  exercise: ReliefExercise
  children: React.ReactNode
}

/** Seconds for a step: holds use their duration, reps get ~4s each, else manual. */
function stepDuration(exercise: ReliefExercise): number {
  if (exercise.holdSeconds) return exercise.holdSeconds
  if (exercise.reps) return exercise.reps * REP_SECONDS
  return 0
}

export function ReliefPlayer({ exercise, children }: ReliefPlayerProps) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const duration = useMemo(() => stepDuration(exercise), [exercise])
  const steps = exercise.steps
  const isLast = stepIndex === steps.length - 1
  const finished = isLast && duration > 0 && elapsed >= duration

  const reset = useCallback((): void => {
    setStepIndex(0)
    setElapsed(0)
    setPaused(false)
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  useEffect(() => {
    if (!open || paused || duration === 0 || finished) return
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [open, paused, duration, finished])

  const goNext = useCallback((): void => {
    setElapsed(0)
    setStepIndex((index) => Math.min(index + 1, steps.length - 1))
  }, [steps.length])

  const goPrevious = useCallback((): void => {
    setElapsed(0)
    setStepIndex((index) => Math.max(index - 1, 0))
  }, [])

  // Auto-advance when a timed step completes.
  useEffect(() => {
    if (!open || duration === 0 || paused) return
    if (elapsed >= duration && !isLast) goNext()
  }, [elapsed, duration, isLast, open, paused, goNext])

  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0
  const remaining = duration > 0 ? Math.max(duration - elapsed, 0) : 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset()
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-h-[92dvh] border-white/10 bg-surface sm:max-w-md"
        aria-describedby={`player-${exercise.id}`}
      >
          <DialogHeader>
            <DialogTitle className="font-heading pr-6">{exercise.name}</DialogTitle>
            <DialogDescription id={`player-${exercise.id}`}>
              {RELIEF_KIND_LABELS[exercise.kind]} · {exercise.sets} set{exercise.sets > 1 ? 's' : ''}
              {exercise.holdSeconds ? ` · ${exercise.holdSeconds}s holds` : ''}
              {exercise.reps ? ` · ${exercise.reps} reps` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 pb-2">
            <div className="relative" role="timer" aria-label={duration > 0 ? `${remaining} seconds remaining` : 'Manual step'}>
              <svg width="196" height="196" viewBox="0 0 196 196" aria-hidden="true">
                <circle cx="98" cy="98" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <motion.circle
                  cx="98"
                  cy="98"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#F26B4E"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress) }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
                  transform="rotate(-90 98 98)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {finished ? (
                  <span className="font-heading text-2xl font-bold text-mode-build">Done!</span>
                ) : duration > 0 ? (
                  <>
                    <span className="font-heading text-5xl font-bold tabular-nums text-foreground">
                      {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {paused ? 'Paused' : 'Remaining'}
                    </span>
                  </>
                ) : (
                  <span className="px-8 text-center text-xs text-muted-foreground">
                    Take your time, then tap next
                  </span>
                )}
              </div>
            </div>

            <p className="min-h-10 max-w-sm px-2 text-center text-sm leading-relaxed text-foreground/90">
              <span className="mr-1.5 font-bold text-mode-pain">Step {stepIndex + 1}.</span>
              {steps[stepIndex]}
            </p>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Step progress">
              {steps.map((step, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === stepIndex}
                  aria-label={`Go to step ${index + 1}`}
                  onClick={() => {
                    setStepIndex(index)
                    setElapsed(0)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    index === stepIndex ? 'w-6 bg-mode-pain' : index < stepIndex ? 'w-1.5 bg-mode-pain/50' : 'w-1.5 bg-white/15'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous step"
                disabled={stepIndex === 0}
                className="h-11 w-11 rounded-full border-white/15"
                onClick={goPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                aria-label={paused ? 'Resume' : 'Pause'}
                disabled={duration === 0 || finished}
                className="h-14 w-14 rounded-full bg-mode-pain text-white hover:bg-mode-pain/85"
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={isLast ? 'Finish session' : 'Next step'}
                className="h-11 w-11 rounded-full border-white/15"
                onClick={() => (isLast ? setOpen(false) : goNext())}
              >
                {isLast ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            </div>

            {exercise.cautions.length > 0 ? (
              <p className="max-w-sm rounded-lg border border-mode-pain/25 bg-mode-pain/8 px-3 py-2 text-center text-[11px] leading-relaxed text-mode-pain">
                {exercise.cautions.join(' ')}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
  )
}
