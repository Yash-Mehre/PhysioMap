/**
 * Landing section 3 — the solution: a connected Tap → Explore → Act stepper
 * ending in the "one avatar" closing line.
 */

import { Fragment } from 'react'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { SOLUTION_CLOSING_LINE, SOLUTION_INTRO, SOLUTION_STEPS } from '@/config/landingContent'

export function SolutionSection() {
  return (
    <section id="solution" aria-labelledby="solution-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{SOLUTION_INTRO.eyebrow}</p>
          <h2
            id="solution-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {SOLUTION_INTRO.heading}
          </h2>
          {SOLUTION_INTRO.sub ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{SOLUTION_INTRO.sub}</p>
          ) : null}
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch sm:gap-3">
          {SOLUTION_STEPS.map((step, index) => (
            <Fragment key={step.id}>
              <Reveal delay={index * 0.1} className="h-full">
                <article className="flex h-full flex-col gap-3 rounded-xl border border-white/8 bg-surface-raised/60 p-6">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-copper/15 font-heading text-base font-bold text-copper"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{step.label}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </article>
              </Reveal>
              {index < SOLUTION_STEPS.length - 1 ? (
                <span className="hidden items-center justify-center sm:flex" aria-hidden="true">
                  <ArrowRight className="h-5 w-5 text-copper/60" />
                </span>
              ) : null}
            </Fragment>
          ))}
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-10 max-w-2xl text-center font-heading text-lg font-semibold text-foreground sm:text-xl">
            {SOLUTION_CLOSING_LINE}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
