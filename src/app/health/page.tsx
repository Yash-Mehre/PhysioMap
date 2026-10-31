import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { HealthSuiteClient } from '@/components/health/HealthSuiteClient'

export const metadata: Metadata = {
  title: 'Health & Nutrition Suite',
  description:
    'BMI, TDEE and macro calculators, personalized India-friendly meal plans, hydration tracking and a downloadable PDF health summary — tuned to your PhysioMap profile.',
}

/** Health suite page — the sticky header/footer frame comes from SiteChrome. */
export default function HealthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading health suite">
          <Loader2 className="h-6 w-6 animate-spin text-copper" aria-hidden="true" />
        </div>
      }
    >
      <HealthSuiteClient />
    </Suspense>
  )
}
