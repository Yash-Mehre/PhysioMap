/**
 * Landing section 4 — the three modes. Each card carries a small inline SVG
 * illustration (no WebGL here — the hero owns the only 3D canvas), tagline
 * bullets and a mode-colored "Try it" deep link.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { MODES } from '@/config/theme'
import {
  LANDING_MODE_CARDS,
  MODES_INTRO,
  MODES_PAIN_NOTE,
  MODES_TRY_LABEL,
} from '@/config/landingContent'
import type { AppMode } from '@/types'

/** Tiny inline SVG illustrations per mode (build = bars, pain = target, info = eye). */
function ModeIllustration({ modeId, color }: { modeId: AppMode; color: string }) {
  if (modeId === 'build') {
    return (
      <svg viewBox="0 0 64 48" className="h-12 w-16" aria-hidden="true">
        <rect x="6" y="28" width="12" height="16" rx="3" fill={color} opacity="0.45" />
        <rect x="26" y="18" width="12" height="26" rx="3" fill={color} opacity="0.7" />
        <rect x="46" y="6" width="12" height="38" rx="3" fill={color} />
      </svg>
    )
  }
  if (modeId === 'pain') {
    return (
      <svg viewBox="0 0 64 48" className="h-12 w-16" aria-hidden="true">
        <circle cx="32" cy="24" r="21" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
        <circle cx="32" cy="24" r="13" fill="none" stroke={color} strokeWidth="2" opacity="0.55" />
        <circle cx="32" cy="24" r="5" fill={color} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 48" className="h-12 w-16" aria-hidden="true">
      <path
        d="M4 24C10 13 20 8 32 8s22 5 28 16c-6 11-16 16-28 16S10 35 4 24Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        opacity="0.8"
      />
      <circle cx="32" cy="24" r="7" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="32" cy="24" r="2.5" fill={color} />
    </svg>
  )
}

export function ModesSection() {
  return (
    <section id="modes" aria-labelledby="modes-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{MODES_INTRO.eyebrow}</p>
          <h2
            id="modes-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {MODES_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {LANDING_MODE_CARDS.map((card, index) => {
            const mode = MODES.find((entry) => entry.id === card.id)
            const color = mode?.color ?? '#D9A066'
            return (
              <Reveal key={card.id} delay={index * 0.08} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/8 bg-surface-raised/60">
                  <div
                    aria-hidden="true"
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  />
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <ModeIllustration modeId={card.id} color={color} />
                    <h3 className="font-heading text-xl font-bold text-foreground">{card.name}</h3>
                    <ul className="space-y-2">
                      {card.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={card.href}
                      className="mt-auto flex h-11 items-center gap-1.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
                      style={{ color }}
                    >
                      {MODES_TRY_LABEL}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl rounded-lg border border-mode-pain/25 bg-mode-pain/8 px-4 py-3 text-center text-sm text-muted-foreground">
            {MODES_PAIN_NOTE}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
