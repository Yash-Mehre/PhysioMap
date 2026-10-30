import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Apple, FileDown, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: 'Health & Nutrition Suite',
  description: 'Coming up next in PhysioMap.',
}

const TEASERS = [
  {
    icon: Apple,
    title: 'Daily calorie & macro targets',
    detail: 'BMI, BMR and TDEE calculators tuned to your profile and goal pace.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Smart meal plans',
    detail: 'Vegetarian, eggetarian and non-veg plans with exclusions for dairy, gluten, nuts and more.',
  },
  {
    icon: FileDown,
    title: 'PDF export',
    detail: 'One-tap exportable workout plans and recovery guides to share with a coach or clinician.',
  },
] as const

/** Clean stub so header navigation never 404s — part 2 fills this in. */
export default function HealthPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:px-6">
        <div className="space-y-3">
          <p className="eyebrow">Coming up next</p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Health &amp; Nutrition Suite
          </h1>
          <div className="copper-rule mx-auto" aria-hidden="true" />
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            The 3D body map you just explored is only half the story. The next release connects your training and
            pain history to nutrition targets and exportable plans.
          </p>
        </div>

        <ul className="grid w-full gap-3 sm:grid-cols-3">
          {TEASERS.map((teaser) => (
            <li
              key={teaser.title}
              className="rounded-xl border border-white/8 bg-surface-raised/60 p-4 text-left"
            >
              <teaser.icon className="mb-2.5 h-5 w-5 text-copper" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">{teaser.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{teaser.detail}</p>
            </li>
          ))}
        </ul>

        <Button asChild variant="outline" className="border-copper/40 text-copper hover:bg-copper/10">
          <Link href="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to the 3D explorer
          </Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  )
}
