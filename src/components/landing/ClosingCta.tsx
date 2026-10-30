/**
 * Landing section 10 — closing thank-you block with the final launch CTA.
 * The site footer (with the safety disclaimer) renders right after it.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/landing/Reveal'
import { CLOSING_CONTENT } from '@/config/landingContent'

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-heading" className="py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/8 bg-surface/50 px-6 py-14 text-center sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-56 w-72 -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[100px]"
            />
            <div className="relative space-y-5">
              <h2
                id="closing-heading"
                className="bg-gradient-to-r from-copper via-warm-peach to-copper bg-clip-text font-heading text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl"
              >
                {CLOSING_CONTENT.heading}
              </h2>
              <div className="copper-rule mx-auto" aria-hidden="true" />
              <p className="text-sm text-muted-foreground sm:text-base">{CLOSING_CONTENT.subtitle}</p>
              <Button
                asChild
                size="lg"
                className="mt-2 h-12 bg-brand-blue px-8 text-base font-semibold text-white hover:bg-brand-blue/85"
              >
                <Link href={CLOSING_CONTENT.ctaHref}>
                  {CLOSING_CONTENT.cta}
                  <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
