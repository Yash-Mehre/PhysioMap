'use client'

/**
 * Profile tab of the Health & Nutrition Suite. Renders the shared ProfileForm
 * against the persisted store, a compact summary strip once complete, and the
 * reset affordance. Skeletons until hydration so persisted state can never
 * cause a render mismatch.
 */

import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import { Check, LockKeyhole, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/components/health/ProfileForm'
import { ACTIVITY_LEVEL_LABELS, SEX_LABELS, WEIGHT_GOAL_LABELS } from '@/config/labels'
import { isProfileComplete } from '@/lib/health/profileValidation'
import { formatHeight, formatWeight } from '@/lib/health/units'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import type { UserProfile } from '@/types'

export function ProfileTab() {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)
  const resetProfile = useProfileStore((state) => state.resetProfile)
  const [formKey, setFormKey] = useState(0)

  const handleSave = (draft: UserProfile): void => {
    setProfile(draft)
    toast.success('Profile saved')
  }

  const handleReset = (): void => {
    resetProfile()
    setFormKey((key) => key + 1)
    toast.success('Profile reset to defaults')
  }

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-16 w-full max-w-xl bg-white/5" />
        <Skeleton className="h-12 w-full bg-white/5" />
        <Skeleton className="h-96 w-full bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Your profile
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          One set of numbers powers every calculator, meal plan and water goal in this suite.
        </p>
      </div>

      {isProfileComplete(profile) && <SummaryStrip profile={profile} />}

      <div className="rounded-xl border border-white/8 bg-surface/60 p-4 sm:p-6">
        <ProfileForm key={formKey} initialProfile={profile} onSave={handleSave} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
          Your profile stays on this device — nothing is uploaded.
        </p>
        <Button
          variant="ghost"
          onClick={handleReset}
          className="min-h-11 w-fit text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset profile
        </Button>
      </div>
    </div>
  )
}

/** Compact "age · sex · height · weight · activity · goal" strip. */
function SummaryStrip({ profile }: { profile: UserProfile }) {
  const items: string[] = [
    profile.age !== undefined ? `${profile.age} yrs` : undefined,
    profile.sex !== undefined ? SEX_LABELS[profile.sex] : undefined,
    profile.heightCm !== undefined ? formatHeight(profile.heightCm, profile.unitSystem) : undefined,
    profile.weightKg !== undefined ? formatWeight(profile.weightKg, profile.unitSystem) : undefined,
    profile.activityLevel !== undefined ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : undefined,
    profile.goal !== undefined ? WEIGHT_GOAL_LABELS[profile.goal] : undefined,
  ].filter((item): item is string => item !== undefined)

  return (
    <div
      aria-label="Profile summary"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-white/8 bg-surface/70 px-4 py-3"
    >
      <Badge className="gap-1 border-transparent bg-[#58B584]/15 text-[#58B584] hover:bg-[#58B584]/15">
        <Check className="h-3 w-3" aria-hidden="true" />
        Complete
      </Badge>
      {items.map((item, index) => (
        <Fragment key={`${index}-${item}`}>
          {index > 0 && <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden="true" />}
          <span className="text-sm font-medium text-foreground">{item}</span>
        </Fragment>
      ))}
    </div>
  )
}
