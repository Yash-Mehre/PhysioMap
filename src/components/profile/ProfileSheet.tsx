'use client'

/**
 * The ONE profile UI of the app: a right-side sheet (full width on mobile,
 * ~440px on desktop) opened from the header user icon or any "complete your
 * profile" CTA through the shared `useProfilePanel` store. View mode is
 * read-only; edit mode swaps in the ProfileForm with Save/Cancel. The view
 * footer also offers Log out (clears every saved store on this device).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileView, isProfileEmpty } from '@/components/profile/ProfileView'
import { useHydrated } from '@/hooks/useHydrated'
import { clearAllUserData } from '@/lib/storage/resetAll'
import { useProfilePanel } from '@/store/useProfilePanel'
import { useProfileStore } from '@/store/useProfileStore'
import type { UserProfile } from '@/types'

/** Confirmation dialog for "Log out" — clears every saved store on this device. */
function LogoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const closePanel = useProfilePanel((state) => state.close)

  const handleConfirm = (): void => {
    onOpenChange(false)
    closePanel()
    clearAllUserData()
    router.replace('/welcome')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-white/10 bg-surface sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">Log out and clear this device?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes your profile, workout plan, pain log, hydration and meal plan from this
            browser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-transparent text-muted-foreground hover:text-foreground">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-mode-pain text-white hover:bg-mode-pain/85"
          >
            <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ProfileSheet() {
  const hydrated = useHydrated()
  const open = useProfilePanel((state) => state.open)
  const mode = useProfilePanel((state) => state.mode)
  const openPanel = useProfilePanel((state) => state.openPanel)
  const close = useProfilePanel((state) => state.close)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)

  const handleSave = (draft: UserProfile): void => {
    setProfile(draft)
    toast.success('Profile updated')
    openPanel('view')
  }

  const name = profile.name?.trim()
  const initial = name !== undefined && name !== '' ? name.charAt(0).toUpperCase() : undefined

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent
        side="right"
        aria-label="Your profile"
        aria-describedby={undefined}
        className="w-full gap-0 border-white/10 bg-surface p-0 sm:max-w-[440px]"
      >
        {mode === 'edit' ? (
          <>
            <SheetHeader className="border-b border-white/8 pr-12">
              <SheetTitle className="font-heading text-base text-foreground">Edit profile</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1">
              {hydrated ? (
                <ProfileForm initialProfile={profile} onSave={handleSave} onCancel={() => openPanel('view')} />
              ) : (
                <div className="space-y-3 p-4" aria-busy="true">
                  <Skeleton className="h-9 w-full bg-white/8" />
                  <Skeleton className="h-9 w-full bg-white/8" />
                  <Skeleton className="h-20 w-full bg-white/8" />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="flex-row items-center gap-3 border-b border-white/8 pr-12">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-copper/10 font-heading text-base font-bold text-copper"
              >
                {hydrated && initial !== undefined ? initial : <UserRound className="h-4.5 w-4.5" />}
              </span>
              <div className="min-w-0">
                <SheetTitle className="truncate font-heading text-base text-foreground">
                  {hydrated && name ? name : 'Your profile'}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">Stored on this device only</p>
              </div>
            </SheetHeader>
            <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
              {hydrated ? (
                <ProfileView profile={profile} />
              ) : (
                <div className="space-y-3 p-4" aria-busy="true">
                  <Skeleton className="h-16 w-full bg-white/8" />
                  <Skeleton className="h-40 w-full bg-white/8" />
                  <Skeleton className="h-40 w-full bg-white/8" />
                </div>
              )}
            </div>
            <div className="shrink-0 space-y-1.5 border-t border-white/8 bg-surface/95 p-4">
              <Button
                onClick={() => openPanel('edit')}
                className="w-full bg-brand-blue text-white hover:bg-brand-blue/85"
              >
                {hydrated && !isProfileEmpty(profile) ? 'Edit profile' : 'Add your details'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLogoutOpen(true)}
                className="h-8 w-full text-xs font-normal text-muted-foreground/80 hover:text-mode-pain"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Log out
              </Button>
            </div>
          </>
        )}
      </SheetContent>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </Sheet>
  )
}
