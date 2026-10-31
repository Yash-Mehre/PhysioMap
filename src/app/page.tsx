import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { SolutionSection } from '@/components/landing/SolutionSection'
import { ModesSection } from '@/components/landing/ModesSection'
import { SuiteSection } from '@/components/landing/SuiteSection'
import { EngineSection } from '@/components/landing/EngineSection'
import { PersonaSection } from '@/components/landing/PersonaSection'
import { FutureSection } from '@/components/landing/FutureSection'
import { TeamSection } from '@/components/landing/TeamSection'
import { ClosingCta } from '@/components/landing/ClosingCta'
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
        <ProblemSection />
        <SolutionSection />
        <ModesSection />
        <SuiteSection />
        <EngineSection />
        <PersonaSection />
        <FutureSection />
        <TeamSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  )
}
