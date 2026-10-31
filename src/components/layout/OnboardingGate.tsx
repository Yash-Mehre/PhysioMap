'use client'

/**
 * Onboarding gate — mounted once in the root layout. Until the persisted
 * profile says `onboarded: true`, every route except /welcome is replaced
 * with the welcome wizard. Pre-hydration (and while the redirect is in
 * flight) a branded splash renders instead of the page, so protected pages
 * never flash. API routes, static assets and /welcome itself are unaffected.
 */

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BrandedSplash } from '@/components/layout/BrandedSplash'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'

const WELCOME_PATH = '/welcome'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const pathname = usePathname()
  const router = useRouter()
  const onboarded = useProfileStore((state) => state.profile.onboarded)

  const onWelcome = pathname === WELCOME_PATH
  const blocked = !onboarded && !onWelcome

  useEffect(() => {
    if (!hydrated || !blocked) return
    router.replace(WELCOME_PATH)
  }, [hydrated, blocked, router])

  if (!hydrated || blocked) {
    return <BrandedSplash />
  }
  return <>{children}</>
}
