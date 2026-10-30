'use client'

/** Client providers: TanStack Query + framer-motion reduced-motion + Toaster.
 * Also mounts the two app-wide overlays exactly once: the first-visit
 * disclaimer gate and the shared profile sheet. */

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { DisclaimerGate } from '@/components/layout/DisclaimerGate'
import { ProfileSheet } from '@/components/profile/ProfileSheet'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        {children}
        <DisclaimerGate />
        <ProfileSheet />
      </MotionConfig>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  )
}
