'use client'

/** Urgency banner: calm, clear, color-coded by assessment urgency. */

import { AlertTriangle, HeartPulse, Eye, Activity } from 'lucide-react'
import { URGENCY_COLORS } from '@/config/theme'
import { cn } from '@/lib/utils'
import type { PainUrgency } from '@/types'

const URGENCY_CONTENT: Record<PainUrgency, { title: string; message: string; icon: typeof Activity }> = {
  'self-care': {
    title: 'Self-care looks appropriate',
    message: 'Based on your answers, gentle self-care is a reasonable first step. Re-assess over the next few days.',
    icon: Activity,
  },
  monitor: {
    title: 'Keep an eye on this',
    message: 'Your symptoms are worth monitoring for now — track them in the Pain Log and consider a physiotherapist if they persist.',
    icon: Eye,
  },
  'see-clinician': {
    title: 'Consider seeing a clinician',
    message: 'One or more of your answers suggests a professional assessment is the safest next step before training through it.',
    icon: HeartPulse,
  },
  urgent: {
    title: 'Seek urgent care now',
    message: 'One of your answers can be linked to a serious condition. Please contact emergency or urgent medical services immediately.',
    icon: AlertTriangle,
  },
}

export function RedFlagBanner({ urgency }: { urgency: PainUrgency }) {
  const content = URGENCY_CONTENT[urgency]
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
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{content.message}</p>
      </div>
    </div>
  )
}
