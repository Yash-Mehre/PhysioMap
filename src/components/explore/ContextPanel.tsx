'use client'

/**
 * Right-hand context panel: renders the active mode panel for the selected
 * region, or the Tap → Explore → Act empty state. Handles loading, error and
 * retry states for the region content query.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { REGION_CAMERA_PRESETS } from '@/config/camera'
import { REGION_GROUP_LABELS } from '@/config/labels'
import { MODE_COLORS } from '@/config/theme'
import { useRegionContent } from '@/hooks/useRegionContent'
import { useExplorerStore } from '@/store/useExplorerStore'
import { BuildPanel } from '@/components/build/BuildPanel'
import { PainPanel } from '@/components/pain/PainPanel'
import { InfoPanel } from '@/components/info/InfoPanel'
import { PanelEmptyState } from '@/components/explore/PanelEmptyState'
import type { RegionId } from '@/types'

export interface ContextPanelProps {
  onSelect: (regionId: RegionId | null) => void
}

export function ContextPanel({ onSelect }: ContextPanelProps) {
  const mode = useExplorerStore((state) => state.mode)
  const selectedRegionId = useExplorerStore((state) => state.selectedRegionId)
  const { data: content, isLoading, isError, refetch } = useRegionContent(selectedRegionId)

  if (selectedRegionId === null) {
    return <PanelEmptyState onQuickSelect={(regionId) => onSelect(regionId)} />
  }

  const modeColor = MODE_COLORS[mode]
  const region = content?.region
  const preset = REGION_CAMERA_PRESETS[selectedRegionId]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${selectedRegionId}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex h-full min-h-0 flex-col"
        >
          <header
            className="border-b border-white/8 px-4 pb-3 pt-4 sm:px-5"
            style={{ background: `linear-gradient(180deg, ${modeColor}14, transparent)` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: modeColor }}>
                  {mode === 'build' ? 'Build mode' : mode === 'pain' ? 'Pain mode' : 'Info mode'}
                </p>
                <h1 className="truncate font-heading text-xl font-bold text-foreground">
                  {region?.label ?? selectedRegionId}
                </h1>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {isLoading ? 'Loading region…' : content?.anatomy.anatomicalName}
                </p>
                {region ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="rounded-full border border-white/10 px-2 py-0.5">
                      {REGION_GROUP_LABELS[region.group]}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5">
                      Best seen from the {preset.side}
                    </span>
                  </div>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear selection"
                className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => onSelect(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <PanelSkeleton modeColor={modeColor} />
            ) : isError || !content ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <AlertTriangle className="h-6 w-6 text-mode-pain" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Could not load this region’s content.</p>
                <Button
                  variant="outline"
                  onClick={() => void refetch()}
                  className="border-copper/40 text-copper hover:bg-copper/10"
                >
                  <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            ) : mode === 'build' ? (
              <BuildPanel content={content} />
            ) : mode === 'pain' ? (
              <PainPanel content={content} />
            ) : (
              <InfoPanel content={content} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PanelSkeleton({ modeColor }: { modeColor: string }) {
  return (
    <div className="space-y-4 p-4 sm:p-5" aria-busy="true" aria-label="Loading region content">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-7 w-20 animate-pulse rounded-full"
            style={{ backgroundColor: index === 0 ? `${modeColor}30` : 'rgba(255,255,255,0.07)' }}
          />
        ))}
      </div>
      {[0, 1, 2].map((index) => (
        <div key={index} className="space-y-2 rounded-xl border border-white/8 p-4">
          <Skeleton className="h-4 w-1/2 bg-white/8" />
          <Skeleton className="h-3 w-full bg-white/6" />
          <Skeleton className="h-3 w-4/5 bg-white/6" />
        </div>
      ))}
    </div>
  )
}
