'use client'

/**
 * Temporary landing hero (Message 2 replaces this page): tagline, three-step
 * chips and a slowly rotating avatar.
 */

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Compass, Hand, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createNeutralRegionStyles } from '@/types'
import { MODES } from '@/config/theme'
import { SITE } from '@/config/site'
import { REGION_IDS } from '@/config/regions'

const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" role="status" aria-label="Loading 3D avatar">
      <Loader2 className="h-6 w-6 animate-spin text-copper" aria-hidden="true" />
    </div>
  ),
})

const STEP_ICONS = [Hand, Compass, Zap] as const

export function LandingHero() {
  const neutralStyles = useMemo(() => createNeutralRegionStyles(REGION_IDS), [])
  const noop = useMemo(() => (): void => undefined, [])

  return (
    <div className="bg-grid relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[140px]"
      />
      <section className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-4 lg:pb-24 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-xl space-y-6"
        >
          <p className="eyebrow">
            {SITE.team} · {SITE.event}
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            See Your Body.
            <br />
            <span className="bg-gradient-to-r from-copper via-warm-peach to-copper bg-clip-text text-transparent">
              Fix Your Body.
            </span>
          </h1>
          <div className="copper-rule" aria-hidden="true" />
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SITE.pitch} Tap a body part, switch between training, pain relief and anatomy — one 3D muscle map,
            three ways to act on it.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 bg-brand-blue px-7 text-base font-semibold text-white hover:bg-brand-blue/85">
              <Link href="/explore">
                Launch PhysioMap
                <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden="true" />
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">No sign-up · runs in your browser</span>
          </div>

          <ol className="flex flex-wrap gap-2.5 pt-1">
            {SITE.steps.map((step, index) => {
              const Icon = STEP_ICONS[index]
              return (
                <li
                  key={step.id}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/80 px-3.5 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
                  {step.label}
                  {index < SITE.steps.length - 1 ? (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />
                  ) : null}
                </li>
              )
            })}
          </ol>

          <ul className="flex flex-wrap gap-4 pt-2">
            {MODES.map((mode) => (
              <li key={mode.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: mode.color }} />
                <span className="font-semibold text-foreground/90">{mode.label}</span>
                <span className="hidden sm:inline">— {mode.tagline}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative h-[380px] sm:h-[460px] lg:h-[600px]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-6 top-8 rounded-[2.5rem] border border-white/8 bg-gradient-to-b from-surface/60 to-transparent"
          />
          <AvatarCanvas
            selectedRegionId={null}
            hoveredRegionId={null}
            regionStyles={neutralStyles}
            labelsVisible={false}
            silhouette={false}
            interactive={false}
            autoRotate={true}
            viewRequestView="front"
            viewRequestId={0}
            onSelect={noop}
            onHover={noop}
            onOpenRegions={noop}
          />
        </motion.div>
      </section>
    </div>
  )
}
