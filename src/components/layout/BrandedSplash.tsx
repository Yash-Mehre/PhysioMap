/**
 * Full-screen branded splash shown while the onboarding state is still being
 * read (pre-hydration) or while the OnboardingGate redirects to /welcome, so
 * protected pages never flash. Pure CSS animation (respects reduced motion).
 */

import { Activity } from 'lucide-react'
import { SITE } from '@/config/site'

export function BrandedSplash() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-background"
      role="status"
      aria-label="Loading PhysioMap"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-copper/30 bg-surface-raised motion-reduce:animate-none">
          <Activity className="h-6 w-6 text-copper" aria-hidden="true" />
        </span>
        <span className="font-heading text-lg font-bold tracking-tight text-foreground">
          {SITE.name}
        </span>
      </div>
    </div>
  )
}
