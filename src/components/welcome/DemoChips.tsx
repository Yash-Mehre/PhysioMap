'use client'

/** Row of demo quick-fill chips shown on wizard step 1 (presentations). */

import { Sparkles } from 'lucide-react'
import { DEMO_PROFILES, type DemoProfile } from '@/config/demoProfiles'
import { cn } from '@/lib/utils'

export function DemoChips({ onPick }: { onPick: (demo: DemoProfile) => void }) {
  return (
    <div className="mb-1 space-y-2 rounded-xl border border-white/8 bg-surface-raised/50 px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
        Presenting? Quick-fill a demo profile
      </p>
      <div className="flex flex-wrap gap-1.5">
        {DEMO_PROFILES.map((demo) => (
          <button
            key={demo.id}
            type="button"
            onClick={() => onPick(demo)}
            className={cn(
              'inline-flex min-h-8 items-center rounded-full border border-white/10 bg-surface px-3 text-xs font-medium text-muted-foreground',
              'transition-colors duration-150 hover:border-copper/50 hover:text-copper',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
            )}
          >
            {demo.label}
          </button>
        ))}
      </div>
    </div>
  )
}
