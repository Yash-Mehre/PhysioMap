'use client'

/**
 * Explainability popover — the small "?" affordance every calculator card
 * carries. Shows the exact formula (mono) and its source so the numbers on
 * the page are never a black box.
 */

import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface HowCalculatedPopoverProps {
  /** Metric name used in the accessible trigger label, e.g. "BMI". */
  title: string
  /** The formula, rendered in monospace. */
  formula: string
  /** Attribution line, e.g. "Mifflin-St Jeor equation (1990)". */
  source: string
}

export function HowCalculatedPopover({ title, formula, source }: HowCalculatedPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={`How is ${title} calculated?`}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="w-72 border-white/10 bg-popover p-4 text-popover-foreground"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-copper">
          How is this calculated?
        </p>
        <p className="mt-2 font-mono text-xs leading-relaxed text-foreground">{formula}</p>
        <p className="mt-2 text-xs text-muted-foreground">Source: {source}</p>
      </PopoverContent>
    </Popover>
  )
}
