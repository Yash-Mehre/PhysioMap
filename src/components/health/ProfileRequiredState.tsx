'use client'

/**
 * Friendly "Complete your profile" empty state shared by every Health Suite
 * tab that needs a complete profile. Opens the header profile sheet in edit
 * mode (no navigation).
 */

import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfilePanel } from '@/store/useProfilePanel'

export function ProfileRequiredState() {
  const openPanel = useProfilePanel((state) => state.openPanel)
  return (
    <div className="rounded-xl border border-dashed border-copper/30 bg-surface-raised/40 p-8 text-center">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-copper/30 bg-surface">
        <ClipboardList className="h-5 w-5 text-copper" aria-hidden="true" />
      </span>
      <h3 className="font-heading text-base font-bold text-foreground">Complete your profile</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Add your age, height, weight, activity level and goal once — every calculator, meal plan and
        water target on this page fills in automatically.
      </p>
      <Button
        onClick={() => openPanel('edit')}
        className="mt-4 bg-brand-blue text-white hover:bg-brand-blue/85"
      >
        Set up your profile
      </Button>
    </div>
  )
}
