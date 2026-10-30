import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { HealthSuiteClient } from '@/components/health/HealthSuiteClient'

export const metadata: Metadata = {
  title: 'Health & Nutrition Suite',
  description:
    'BMI, TDEE and macro calculators, personalized India-friendly meal plans, hydration tracking and a downloadable PDF health summary — tuned to your PhysioMap profile.',
}

export default function HealthPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading health suite">
              <Loader2 className="h-6 w-6 animate-spin text-copper" aria-hidden="true" />
            </div>
          }
        >
          <HealthSuiteClient />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
