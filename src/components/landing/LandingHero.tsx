'use client'

/**
 * Landing hero: pitch copy on the left, the live 3D avatar on the right.
 * The hero canvas is the only WebGL canvas on the page — hover highlights the
 * region under the pointer and clicking navigates to the explorer.
 */

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Hand, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createNeutralRegionStyles } from '@/types'
import { REGION_IDS } from '@/config/regions'
import { HERO_CONTENT } from '@/config/landingContent'
import type { RegionId, RegionVisualState } from '@/types'

const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" role="status" aria-label="Loading 3D avatar">
      <Loader2 className="h-6 w-6 animate-spin text-copper" aria-hidden="true" />
    </div>
  ),
})

/** Warm-peach glow applied to the region currently under the pointer. */
const HOVER_REGION_STATE: RegionVisualState = {
  tint: '#F3B38A',
  emissive: '#F3B38A',
  emissiveIntensity: 0.35,
  opacity: 1,
}

export function LandingHero() {
  const router = useRouter()
  const neutralStyles = useMemo(() => createNeutralRegionStyles(REGION_IDS), [])
  const [hoveredRegionId, setHoveredRegionId] = useState<RegionId | null>(null)

  const regionStyles = useMemo<Record<RegionId, RegionVisualState>>(
    () =>
      hoveredRegionId
        ? { ...neutralStyles, [hoveredRegionId]: HOVER_REGION_STATE }
        : neutralStyles,
    [neutralStyles, hoveredRegionId],
  )

  const handleSelect = useCallback(
    (regionId: RegionId | null): void => {
      if (regionId) router.push(`/explore?mode=info&region=${regionId}`)
    },
    [router],
  )

  const handleHover = useCallback((regionId: RegionId | null): void => {
    setHoveredRegionId(regionId)
  }, [])

  const handleOpenRegions = useCallback((): void => {
    router.push('/explore')
  }, [router])

  const handleSecondaryCtaClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault()
    const element = document.getElementById(HERO_CONTENT.secondaryCtaHref.slice(1))
    if (!element) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    window.history.replaceState(null, '', HERO_CONTENT.secondaryCtaHref)
  }, [])

  return (
    <div className="bg-grid relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[140px]"
      />
      <section
        id="top"
        aria-labelledby="hero-heading"
        className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-4 lg:pb-24 lg:pt-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-xl space-y-6"
        >
          <p className="eyebrow">{HERO_CONTENT.eyebrow}</p>
          <h1
            id="hero-heading"
            className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {HERO_CONTENT.titleLine1}
            <br />
            <span className="bg-gradient-to-r from-copper via-warm-peach to-copper bg-clip-text text-transparent">
              {HERO_CONTENT.titleLine2}
            </span>
          </h1>
          <div className="copper-rule" aria-hidden="true" />
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{HERO_CONTENT.subtitle}</p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              asChild
              size="lg"
              className="h-12 bg-brand-blue px-7 text-base font-semibold text-white hover:bg-brand-blue/85"
            >
              <Link href={HERO_CONTENT.primaryCtaHref}>
                {HERO_CONTENT.primaryCta}
                <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-white/15 px-7 text-base">
              <a href={HERO_CONTENT.secondaryCtaHref} onClick={handleSecondaryCtaClick}>
                {HERO_CONTENT.secondaryCta}
              </a>
            </Button>
          </div>
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
            hoveredRegionId={hoveredRegionId}
            regionStyles={regionStyles}
            labelsVisible={false}
            silhouette={false}
            interactive={true}
            autoRotate={true}
            viewRequestView="front"
            viewRequestId={0}
            onSelect={handleSelect}
            onHover={handleHover}
            onOpenRegions={handleOpenRegions}
          />
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Hand className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
              {HERO_CONTENT.hint}
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
