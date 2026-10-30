'use client'

/**
 * Animated SVG progress ring for today's water intake. The arc animates its
 * `strokeDashoffset` with a framer-motion spring (safe under the global
 * `MotionConfig reducedMotion="user"` wrapper). When the goal is met the
 * percent is replaced by a checkmark "Goal reached" state.
 */

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { hydrationPercent } from '@/lib/health/hydration'
import { formatMl } from '@/lib/health/units'

export interface HydrationRingProps {
  totalMl: number
  goalMl: number
  /** Outer diameter in px (default 200). */
  size?: number
}

const STROKE_WIDTH = 14
const TRACK_STROKE = 'rgba(255,255,255,0.08)'
const PROGRESS_STROKE = '#3B74F2'

export function HydrationRing({ totalMl, goalMl, size = 200 }: HydrationRingProps) {
  const radius = (size - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius
  const percent = hydrationPercent(totalMl, goalMl)
  const goalReached = goalMl > 0 && totalMl >= goalMl
  const dashOffset = circumference * (1 - percent / 100)
  const center = size / 2

  const ariaLabel = goalReached
    ? `${totalMl.toLocaleString()} of ${goalMl.toLocaleString()} ml — daily water goal reached`
    : `${totalMl.toLocaleString()} of ${goalMl.toLocaleString()} ml — ${Math.round(
        percent,
      )}% of today's water goal`

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={TRACK_STROKE}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Rotate -90deg so the arc fills from the top. */}
        <g transform={`rotate(-90 ${center} ${center})`}>
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={PROGRESS_STROKE}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring', stiffness: 110, damping: 22 }}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 text-center">
        {goalReached ? (
          <>
            <CheckCircle2 className="h-8 w-8 text-[#58B584]" aria-hidden="true" />
            <p className="text-xs font-medium text-muted-foreground">Goal reached</p>
          </>
        ) : (
          <p className="font-heading text-3xl font-bold leading-none text-foreground">
            {Math.round(percent)}
            <span className="text-lg">%</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatMl(totalMl)} <span aria-hidden="true">/</span> {formatMl(goalMl)}
        </p>
      </div>
    </div>
  )
}
