'use client'

/** Branded global error boundary (the app itself never shows a raw crash). */

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error is reported to the boundary; nothing else to do in the demo build.
    void error
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-mode-pain/30 bg-surface-raised">
        <AlertTriangle className="h-6 w-6 text-mode-pain" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="font-heading text-3xl font-extrabold text-foreground">A muscle cramped</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          An unexpected error interrupted this page. Your saved profile, workout and logs are safe
          on this device — try again or head back to the map.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="bg-brand-blue text-white hover:bg-brand-blue/85">
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="outline" className="border-white/15 bg-transparent">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to safety
          </Link>
        </Button>
      </div>
    </div>
  )
}
