'use client'

import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { useProfileStore } from '@/store/useProfileStore'
import { DEFAULT_PROFILE } from '@/types/profile'

export default function LoginPage() {
  const router = useRouter()
  const setProfile = useProfileStore((state) => state.setProfile)

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">PhysioMap profile</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">Set up your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This local profile is the app&apos;s sign-in step. Your health data stays on this device.
        </p>
      </div>
      <ProfileForm
        initialProfile={useProfileStore.getState().profile ?? DEFAULT_PROFILE}
        onSave={(profile) => {
          setProfile(profile)
          router.replace('/explore')
        }}
        onCancel={() => router.replace('/explore')}
      />
    </main>
  )
}
