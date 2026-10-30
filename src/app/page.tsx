import { LandingHero } from '@/components/landing/LandingHero'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

/** Temporary landing page — Message 2 replaces it with the full experience. */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LandingHero />
      </main>
      <SiteFooter />
    </div>
  )
}
