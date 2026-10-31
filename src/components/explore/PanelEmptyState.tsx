'use client'

/** Empty state for the context panel: Tap → Explore → Act + quick-select. */

import { motion } from 'framer-motion'
import { Hand, Compass, Zap, ArrowRight } from 'lucide-react'
import { MODES } from '@/config/theme'
import { SITE } from '@/config/site'
import type { RegionId } from '@/types'

const STEP_ICONS = [Hand, Compass, Zap] as const

export interface PanelEmptyStateProps {
  onQuickSelect: (regionId: RegionId) => void
}

export function PanelEmptyState({ onQuickSelect }: PanelEmptyStateProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-6 p-6">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-copper">Get started</p>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Three steps to a better body
        </h2>
        <div aria-hidden="true" className="h-px w-14 bg-gradient-to-r from-copper to-transparent" />
      </div>

      <ol className="space-y-3">
        {SITE.steps.map((step, index) => {
          const Icon = STEP_ICONS[index]
          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.25 }}
              className="flex items-start gap-3 rounded-xl border border-white/8 bg-surface-raised/60 p-3.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-copper/25 bg-surface">
                <Icon className="h-4 w-4 text-copper" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  <span className="mr-1.5 text-copper">{index + 1}.</span>
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>

      <div className="space-y-2.5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          One body part · three modes
        </h3>
        <div className="grid gap-2">
          {MODES.map((mode) => (
            <div key={mode.id} className="flex items-center gap-2.5 rounded-lg border border-white/8 px-3 py-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: mode.color }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{mode.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{mode.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onQuickSelect('lower-back')}
        className="group flex touch-target items-center justify-between rounded-xl border border-copper/30 bg-copper/8 px-4 py-3 text-sm font-medium text-copper transition-all duration-200 hover:bg-copper/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        Try it: Lower Back
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </div>
  )
}
