import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { ExploreWorkspace } from '@/components/explore/ExploreWorkspace'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SITE } from '@/config/site'

export const metadata: Metadata = {
  description: `${SITE.pitch} Tap any muscle or joint to train it, relieve pain or learn anatomy — plus a complete health and nutrition suite, all in the browser.`,
}

/** Landing page — the full pitch: hero, problem, solution, modes, suite, engine, personas, future, team and closing CTA. */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <ExploreWorkspace embedded />
      </main>
      <SiteFooter />
    </div>
  )
}
