/**
 * Landing section 5 — the health & nutrition suite: four deep-link cards with
 * a brand-blue top bar; the meal planner card carries the sample macro donut.
 */

import Link from 'next/link'
import { ArrowRight, Calculator, Droplets, FileDown, UtensilsCrossed } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { MiniMacroDonut } from '@/components/landing/MiniMacroDonut'
import { SUITE_CARDS, SUITE_INTRO, SUITE_SAMPLE_CHIP } from '@/config/landingContent'
import type { SuiteCardId } from '@/config/landingContent'

const SUITE_ICONS: Record<SuiteCardId, LucideIcon> = {
  calculators: Calculator,
  planner: UtensilsCrossed,
  hydration: Droplets,
  summary: FileDown,
}

export function SuiteSection() {
  return (
    <section id="suite" aria-labelledby="suite-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{SUITE_INTRO.eyebrow}</p>
          <h2
            id="suite-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {SUITE_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {SUITE_CARDS.map((card, index) => {
            const Icon = SUITE_ICONS[card.id]
            return (
              <Reveal key={card.id} delay={index * 0.07} className="h-full">
                <Link
                  href={card.href}
                  className="group relative flex h-full flex-col rounded-xl border border-white/8 border-t-2 border-t-brand-blue bg-surface-raised/60 p-6 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-blue/30 bg-brand-blue/12">
                      <Icon className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                  {card.withDonut ? (
                    <div className="mt-4 flex items-center gap-4 rounded-lg border border-white/8 bg-surface/70 p-3">
                      <MiniMacroDonut />
                      <span className="rounded-full border border-white/10 bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {SUITE_SAMPLE_CHIP}
                      </span>
                    </div>
                  ) : null}
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
