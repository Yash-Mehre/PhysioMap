'use client'

/**
 * Welcome page client: the onboarding wizard for new users, or a
 * "Welcome back" card for profiles that already completed onboarding
 * (both data-driven decisions happen after hydration — the layout-level
 * OnboardingGate guarantees this page only renders once hydrated).
 */

import { useRouter } from 'next/navigation'
import { ArrowRight, LogOut, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clearAllUserData } from '@/lib/storage/resetAll'
import { useProfileStore } from '@/store/useProfileStore'
import { BrandPanel } from '@/components/welcome/BrandPanel'
import { OnboardingWizard } from '@/components/welcome/OnboardingWizard'
/** Card for an already-onboarded profile: continue or start over. */
function WelcomeBackCard() {
  const router = useRouter()
  const name = useProfileStore((state) => state.profile.name)
  const displayName = name !== undefined && name.trim() !== '' ? name.trim() : null

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-white/8 bg-surface p-6 text-center shadow-xl sm:p-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-copper/30 bg-surface-raised">
        <UserRound className="h-6 w-6 text-copper" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
          {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your profile, plans and logs are saved on this device — ready when you are.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <Button
          onClick={() => router.replace('/')}
          className="h-11 w-full bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/85"
        >
          Continue to PhysioMap
          <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => clearAllUserData()}
          className="h-10 w-full text-muted-foreground hover:text-mode-pain"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Log out &amp; start over
        </Button>
      </div>
    </div>
  )
}

export function WelcomeClient() {
  const onboarded = useProfileStore((state) => state.profile.onboarded)

  return (
    <div className="bg-grid relative flex h-dvh flex-col overflow-hidden bg-background">
      {/* Soft animated gradient backdrop (CSS only, reduced-motion safe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] animate-pulse rounded-full bg-brand-blue/10 blur-[120px] motion-reduce:animate-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] animate-pulse rounded-full bg-copper/10 blur-[120px] motion-reduce:animate-none"
      />

      {/* Mobile: compact brand header + card filling the rest (internal
          scroll). Desktop: two centered columns; the card caps its height. */}
      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-10 xl:gap-16">
        <BrandPanel />
        <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-none">
          {onboarded ? <WelcomeBackCard /> : <OnboardingWizard />}
        </div>
      </div>
    </div>
  )
}
