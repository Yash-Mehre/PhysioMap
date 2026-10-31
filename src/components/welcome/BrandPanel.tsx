'use client'

/**
 * Left brand panel of the welcome page: logo, headline, one-liner and three
 * benefit rows. Desktop shows the full panel; mobile collapses it to a
 * compact header above the form card (benefits hidden).
 */

import { Activity, Dumbbell, HeartPulse, UtensilsCrossed } from 'lucide-react'
import { SITE } from '@/config/site'

const BENEFITS = [
  { icon: Dumbbell, label: 'Personalised workouts' },
  { icon: UtensilsCrossed, label: 'Meals built around your health' },
  { icon: HeartPulse, label: 'Safe guidance for your body' },
] as const

export function BrandPanel() {
  return (
    <section aria-label="About PhysioMap" className="flex flex-col justify-center gap-6 lg:gap-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-copper/30 bg-surface-raised">
          <Activity className="h-5 w-5 text-copper" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            {SITE.name}
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Interactive body map
          </span>
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h1 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          See Your Body.
          <br />
          <span className="bg-gradient-to-r from-copper via-warm-peach to-copper bg-clip-text text-transparent">
            Fix Your Body.
          </span>
        </h1>
        <div className="copper-rule" aria-hidden="true" />
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Create your profile so PhysioMap can personalise your training, nutrition and recovery.
        </p>
      </div>

      <ul className="hidden flex-col gap-3.5 lg:flex" aria-label="What you get">
        {BENEFITS.map((benefit) => (
          <li key={benefit.label} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-surface-raised">
              <benefit.icon className="h-4.5 w-4.5 text-copper" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">{benefit.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
