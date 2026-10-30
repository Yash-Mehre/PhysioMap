/**
 * Landing section 7 — personas: four audience cards deep-linking into the
 * explorer with a relevant mode + region preselected.
 */

import Link from 'next/link'
import { ArrowRight, Dumbbell, HeartPulse, Laptop, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_PERSONAS, PERSONAS_CAPTION, PERSONAS_INTRO } from '@/config/landingContent'
import type { PersonaId } from '@/config/landingContent'

const PERSONA_ICONS: Record<PersonaId, LucideIcon> = {
  athletes: Zap,
  'desk-workers': Laptop,
  'fitness-enthusiasts': Dumbbell,
  'rehab-patients': HeartPulse,
}

export function PersonaSection() {
  return (
    <section id="personas" aria-labelledby="personas-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{PERSONAS_INTRO.eyebrow}</p>
          <h2
            id="personas-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {PERSONAS_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {LANDING_PERSONAS.map((persona, index) => {
            const Icon = PERSONA_ICONS[persona.id]
            return (
              <Reveal key={persona.id} delay={index * 0.07} className="h-full">
                <Link
                  href={persona.href}
                  className="group relative flex h-full flex-col rounded-xl border border-white/8 bg-surface-raised/60 p-6 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-copper/25 bg-copper/10">
                      <Icon className="h-5 w-5 text-copper" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{persona.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{persona.description}</p>
                </Link>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-sm text-muted-foreground">{PERSONAS_CAPTION}</p>
        </Reveal>
      </div>
    </section>
  )
}
