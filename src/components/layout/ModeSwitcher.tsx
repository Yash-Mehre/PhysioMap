'use client'

/** Segmented Build | Pain | Info switcher with mode colors and 1/2/3 hints. */

import { Dumbbell, BookOpen, Flame } from 'lucide-react'
import { MODES, MODE_COLORS } from '@/config/theme'
import { useExplorerStore } from '@/store/useExplorerStore'
import { cn } from '@/lib/utils'
import type { AppMode } from '@/types'

const MODE_ICONS: Record<AppMode, typeof Dumbbell> = {
  build: Dumbbell,
  pain: Flame,
  info: BookOpen,
}

export function ModeSwitcher({ className }: { className?: string }) {
  const mode = useExplorerStore((state) => state.mode)
  const setMode = useExplorerStore((state) => state.setMode)

  return (
    <div
      role="radiogroup"
      aria-label="Explorer mode"
      className={cn(
        'flex items-center gap-1 rounded-full border border-white/10 bg-surface/90 p-1 shadow-lg backdrop-blur-md',
        className,
      )}
    >
      {MODES.map((modeDefinition, index) => {
        const active = mode === modeDefinition.id
        const Icon = MODE_ICONS[modeDefinition.id]
        return (
          <button
            key={modeDefinition.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={`${modeDefinition.label} — ${modeDefinition.tagline} (key ${index + 1})`}
            onClick={() => setMode(modeDefinition.id)}
            className={cn(
              'flex touch-target items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper sm:px-4 sm:text-sm',
              active ? 'text-white shadow-md' : 'text-muted-foreground hover:text-foreground',
            )}
            style={active ? { backgroundColor: `${modeDefinition.color}`, boxShadow: `0 0 18px ${modeDefinition.color}55` } : undefined}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>{modeDefinition.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                'ml-0.5 hidden rounded border border-white/15 px-1 text-[10px] leading-4 font-normal sm:inline-block',
                active ? 'border-white/30 text-white/80' : 'text-muted-foreground/70',
              )}
            >
              {index + 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Convenience export for tinting UI accents by mode. */
export const MODE_COLOR_MAP = MODE_COLORS
