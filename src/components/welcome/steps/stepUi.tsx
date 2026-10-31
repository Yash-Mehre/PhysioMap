'use client'

/** Shared building blocks for the onboarding wizard steps. */

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Inline validation message for a wizard field. */
export function StepError({ id, message }: { id: string; message: string | undefined }) {
  if (message === undefined) return null
  return (
    <p id={id} aria-live="polite" className="text-xs text-mode-pain">
      {message}
    </p>
  )
}

export interface OptionCardProps {
  selected: boolean
  onClick: () => void
  title: string
  description?: string
  icon?: LucideIcon
  compact?: boolean
}

/** Selectable card used for single-choice wizard fields. */
export function OptionCard({ selected, onClick, title, description, icon: Icon, compact }: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex touch-target w-full flex-col items-start gap-1 rounded-xl border px-3.5 text-left transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
        compact ? 'justify-center py-2.5' : 'py-3',
        selected
          ? 'border-brand-blue/70 bg-brand-blue/15 text-foreground'
          : 'border-white/10 bg-surface-raised/60 text-muted-foreground hover:border-white/25 hover:text-foreground',
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        {Icon ? (
          <Icon
            className={cn('h-4 w-4 shrink-0', selected ? 'text-brand-blue' : 'text-muted-foreground')}
            aria-hidden="true"
          />
        ) : null}
      </span>
      {description ? <span className="text-xs leading-snug text-muted-foreground">{description}</span> : null}
    </button>
  )
}

/** Toggleable chip used for multi-select wizard fields. */
export function ToggleChip({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 touch-target items-center rounded-full border px-3.5 text-xs font-medium transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
        selected
          ? 'border-copper/60 bg-copper/15 text-copper'
          : 'border-white/10 bg-surface-raised text-muted-foreground hover:border-white/25 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

/** Small section label inside a step. */
export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium leading-none">{label}</span>
      {children}
    </div>
  )
}
