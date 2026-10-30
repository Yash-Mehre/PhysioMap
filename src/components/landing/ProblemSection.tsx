/**
 * Landing section 2 — the problem: three friction cards (posture, flat
 * fitness progress, hard-to-explain pain).
 */

import { LineChart, MessageCircleWarning, PersonStanding } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_PROBLEMS, PROBLEM_INTRO } from '@/config/landingContent'
import type { ProblemId } from '@/config/landingContent'

const PROBLEM_ICONS: Record<ProblemId, LucideIcon> = {
  posture: PersonStanding,
  progress: LineChart,
  'explain-pain': MessageCircleWarning,
}

export function ProblemSection() {
  return (
    <section id="problem" aria-labelledby="problem-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{PROBLEM_INTRO.eyebrow}</p>
          <h2
            id="problem-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {PROBLEM_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {LANDING_PROBLEMS.map((problem, index) => {
            const Icon = PROBLEM_ICONS[problem.id]
            return (
              <Reveal key={problem.id} delay={index * 0.08} className="h-full">
                <article className="h-full rounded-xl border border-white/8 bg-surface-raised/60 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-copper/25 bg-copper/10">
                    <Icon className="h-5 w-5 text-copper" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{problem.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{problem.description}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
