'use client'

/** Urgency banner: calm, clear, color-coded — carries the guidance headline. */

import { AlertTriangle, HeartPulse, Eye, Activity } from 'lucide-react'
import { URGENCY_COLORS } from '@/config/theme'
import { cn } from '@/lib/utils'
import type { PainUrgency } from '@/types'

const URGENCY_TITLES: Record<PainUrgency, { title: string; icon: typeof Activity }> = {
  'self-care': { title: 'Self-care looks appropriate', icon: Activity },
  monitor: { title: 'Keep an eye on this', icon: Eye },
  'see-clinician': { title: 'Consider seeing a clinician', icon: HeartPulse },
  urgent: { title: 'Seek urgent care now', icon: AlertTriangle },
}

export interface RedFlagBannerProps {
  urgency: PainUrgency
  /** Region-specific headline from the guidance composer. */
  headline: string
}

export function RedFlagBanner({ urgency, headline }: RedFlagBannerProps) {
  const content = URGENCY_TITLES[urgency]
  const color = URGENCY_COLORS[urgency]
  const Icon = content.icon
  const isUrgent = urgency === 'urgent' || urgency === 'see-clinician'

  return (
    <div
      role={isUrgent ? 'alert' : 'status'}
      aria-live="polite"
      className={cn('flex items-start gap-3 rounded-xl border p-4')}
      style={{ borderColor: `${color}55`, backgroundColor: `${color}12` }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-heading text-sm font-bold" style={{ color }}>
          {content.title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{headline}</p>
      </div>
    </div>
  )
}
