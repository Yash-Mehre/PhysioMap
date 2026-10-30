'use client'

/**
 * Profile & preferences dialog — the header trigger that opens the shared
 * ProfileForm (the same form the Health Suite Profile tab uses, one source of
 * truth). The form is a child that mounts fresh when the dialog opens (no
 * state-sync effects), and renders a stable skeleton until the app is
 * hydrated so persisted state can never cause a mismatch.
 */

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/components/health/ProfileForm'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import type { UserProfile } from '@/types'

export function ProfileDialog({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)
  const [open, setOpen] = useState(false)

  const handleSave = (draft: UserProfile): void => {
    setProfile(draft)
    toast.success('Preferences saved')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-surface scroll-slim sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Profile &amp; preferences</DialogTitle>
          <DialogDescription>
            The Health &amp; Nutrition Suite builds its BMI, calorie, macro and water numbers on
            these values. Training preferences pre-fill Build mode.
          </DialogDescription>
        </DialogHeader>

        {hydrated ? (
          <ProfileForm
            key="profile-form"
            initialProfile={profile}
            onSave={handleSave}
            onCancel={() => setOpen(false)}
          />
        ) : (
          <div className="space-y-3 py-6" aria-busy="true">
            <Skeleton className="h-9 w-full bg-white/8" />
            <Skeleton className="h-9 w-full bg-white/8" />
            <Skeleton className="h-20 w-full bg-white/8" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
