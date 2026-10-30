import { Loader2 } from 'lucide-react'

/** Branded route-level loading state (dark, centered, no layout shift). */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading PhysioMap">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-copper" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Loading PhysioMap
        </p>
      </div>
    </div>
  )
}
