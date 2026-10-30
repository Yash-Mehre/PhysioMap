'use client'

/** Info-mode overlay: Isolate / Label all / Silhouette layer toggles. */

import { Eye, Tags, PersonStanding, Sparkles } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
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
  const muscleOpacity = useExplorerStore((state) => state.muscleOpacity)
  const skeletonOpacity = useExplorerStore((state) => state.skeletonOpacity)
  const spreadStructures = useExplorerStore((state) => state.spreadStructures)
  const setLayerOpacity = useExplorerStore((state) => state.setLayerOpacity)
  const setSpreadStructures = useExplorerStore((state) => state.setSpreadStructures)

  const toggles = { isolate, labels: labelsVisible, silhouette }
  const actions = { isolate: toggleIsolate, labels: toggleLabels, silhouette: toggleSilhouette }

  return (
    <div
      role="group"
      aria-label="Anatomy layer controls"
      className={cn(
        'glass-panel glass-glow flex w-52 flex-col gap-1 rounded-2xl p-1.5',
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
      <div className="mt-1 space-y-2 border-t border-white/10 px-2.5 pb-2 pt-2">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-mode-info">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> Atlas layers
        </p>
        {([
          ['Muscles', muscleOpacity, 'muscle'],
          ['Bones', skeletonOpacity, 'skeleton'],
        ] as const).map(([label, value, layer]) => (
          <label key={layer} className="block text-[10px] text-muted-foreground">
            <span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span>
            <Slider value={[value]} min={0} max={100} step={1} onValueChange={([next]) => setLayerOpacity(layer, next ?? value)} />
          </label>
        ))}
        <label className="block text-[10px] text-muted-foreground">
          <span className="mb-1 flex justify-between"><span>Spread structures apart</span><span>{spreadStructures}%</span></span>
          <Slider value={[spreadStructures]} min={0} max={100} step={1} onValueChange={([next]) => setSpreadStructures(next ?? spreadStructures)} />
        </label>
      </div>
      <span className="sr-only" aria-live="polite">
        {`Isolate ${isolate ? 'on' : 'off'}, labels ${labelsVisible ? 'on' : 'off'}, silhouette ${silhouette ? 'on' : 'off'}`}
      </span>
    </div>
  )
}
