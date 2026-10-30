/**
 * Landing section 8 — future direction: dashed "Planned" cards. No dates,
 * no fake demos — just honest roadmap capabilities.
 */

import { Glasses, ScanFace, Watch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { FUTURE_BADGE_LABEL, FUTURE_CAPTION, FUTURE_INTRO, LANDING_FUTURE_ITEMS } from '@/config/landingContent'
import type { FutureItemId } from '@/config/landingContent'

const FUTURE_ICONS: Record<FutureItemId, LucideIcon> = {
  'ai-pose': ScanFace,
  ar: Glasses,
  wearables: Watch,
}

export function FutureSection() {
  return (
    <section id="future" aria-labelledby="future-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{FUTURE_INTRO.eyebrow}</p>
          <h2
            id="future-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {FUTURE_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {LANDING_FUTURE_ITEMS.map((item, index) => {
            const Icon = FUTURE_ICONS[item.id]
            return (
              <Reveal key={item.id} delay={index * 0.08} className="h-full">
                <article className="flex h-full flex-col gap-4 rounded-xl border border-dashed border-white/20 bg-surface/40 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-raised">
                      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-white/15 bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {FUTURE_BADGE_LABEL}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-xs text-muted-foreground">{FUTURE_CAPTION}</p>
        </Reveal>
      </div>
    </section>
  )
}
