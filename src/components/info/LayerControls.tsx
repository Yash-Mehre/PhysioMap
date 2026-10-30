'use client'

/** Info-mode overlay: Isolate / Label all / Silhouette layer toggles. */

import { Eye, Tags, PersonStanding } from 'lucide-react'
import { useExplorerStore } from '@/store/useExplorerStore'
import { cn } from '@/lib/utils'

const TOGGLES = [
  { key: 'isolate', label: 'Isolate', icon: Eye },
  { key: 'labels', label: 'Label all', icon: Tags },
  { key: 'silhouette', label: 'Silhouette', icon: PersonStanding },
] as const

export function LayerControls({ className }: { className?: string }) {
  const isolate = useExplorerStore((state) => state.isolate)
  const labelsVisible = useExplorerStore((state) => state.labelsVisible)
  const silhouette = useExplorerStore((state) => state.silhouette)
  const toggleIsolate = useExplorerStore((state) => state.toggleIsolate)
  const toggleLabels = useExplorerStore((state) => state.toggleLabels)
  const toggleSilhouette = useExplorerStore((state) => state.toggleSilhouette)

  const toggles = { isolate, labels: labelsVisible, silhouette }
  const actions = { isolate: toggleIsolate, labels: toggleLabels, silhouette: toggleSilhouette }

  return (
    <div
      role="group"
      aria-label="Anatomy layer controls"
      className={cn(
        'flex flex-col gap-1 rounded-2xl border border-white/10 bg-surface/85 p-1 shadow-lg backdrop-blur-md',
        className,
      )}
    >
      {TOGGLES.map((toggle) => {
        const Icon = toggle.icon
        const active = toggles[toggle.key]
        return (
          <button
            key={toggle.key}
            type="button"
            aria-pressed={active}
            title={toggle.label}
            aria-label={toggle.label}
            onClick={actions[toggle.key]}
            className={cn(
              'flex touch-target items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper',
              active ? 'bg-mode-info/15 text-mode-info' : 'text-muted-foreground hover:bg-white/8 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{toggle.label}</span>
          </button>
        )
      })}
      <span className="sr-only" aria-live="polite">
        {`Isolate ${isolate ? 'on' : 'off'}, labels ${labelsVisible ? 'on' : 'off'}, silhouette ${silhouette ? 'on' : 'off'}`}
      </span>
    </div>
  )
}
