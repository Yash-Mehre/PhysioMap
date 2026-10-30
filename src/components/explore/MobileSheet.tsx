'use client'

/**
 * Mobile bottom sheet with peek / half / full snap points. Custom-built on
 * framer-motion drag (handle-driven) so the avatar above stays interactive.
 */

import { useCallback, useState } from 'react'
import { animate, motion, useDragControls, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

const SNAP_HEIGHTS = ['13dvh', '46dvh', '92dvh'] as const
const DRAG_THRESHOLD = 42

export interface MobileSheetProps {
  /** Sheet header summary (region name / mode chip) rendered in the peek area. */
  header: React.ReactNode
  children: React.ReactNode
}

export function MobileSheet({ header, children }: MobileSheetProps) {
  const [snapIndex, setSnapIndex] = useState(1)
  const dragControls = useDragControls()
  const y = useMotionValue(0)

  const snapTo = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(SNAP_HEIGHTS.length - 1, nextIndex))
      setSnapIndex(clamped)
      animate(y, 0, { type: 'spring', stiffness: 380, damping: 34 })
    },
    [y],
  )

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number } }) => {
      if (info.offset.y < -DRAG_THRESHOLD) snapTo(snapIndex + 1)
      else if (info.offset.y > DRAG_THRESHOLD) snapTo(snapIndex - 1)
      else snapTo(snapIndex)
    },
    [snapIndex, snapTo],
  )

  return (
    <motion.div
      role="dialog"
      aria-label="Region details panel"
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-white/12 bg-surface/95 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
      style={{ y, height: SNAP_HEIGHTS[snapIndex], paddingBottom: 'env(safe-area-inset-bottom)' }}
      animate={{ height: SNAP_HEIGHTS[snapIndex] }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.12, bottom: 0.12 }}
      onDragEnd={handleDragEnd}
    >
      <div
        className="shrink-0 cursor-grab touch-none px-4 pb-2 pt-2.5 active:cursor-grabbing"
        onPointerDown={(event) => dragControls.start(event)}
        onClick={() => snapTo(snapIndex >= 1 ? snapIndex + 1 : 1)}
        role="button"
        tabIndex={0}
        aria-label="Drag or tap to resize the panel"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') snapTo(snapIndex + 1)
        }}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" aria-hidden="true" />
        <div className="mt-2 min-h-0">{header}</div>
      </div>
      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </motion.div>
  )
}

/** Small helper for sheet header text. */
export function MobileSheetHeader({
  title,
  subtitle,
  accent,
}: {
  title: string
  subtitle: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="h-8 w-1 rounded-full" style={{ backgroundColor: accent }} />
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-bold text-foreground">{title}</p>
        <p className={cn('truncate text-[11px] text-muted-foreground')}>{subtitle}</p>
      </div>
    </div>
  )
}
