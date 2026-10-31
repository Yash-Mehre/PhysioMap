import type { Metadata } from 'next'
import { WelcomeClient } from '@/components/welcome/WelcomeClient'

export const metadata: Metadata = {
  title: 'Welcome',
  description:
    'Create your PhysioMap profile — personalised training, nutrition and recovery, saved only on this device.',
  robots: { index: false, follow: false },
}

/** Welcome / onboarding page — immersive (no site header, no footer). */
export default function WelcomePage() {
  return <WelcomeClient />
}
