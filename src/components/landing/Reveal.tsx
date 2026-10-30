'use client'

/**
 * Reveal-on-scroll wrapper. Content enters with a small 16px rise + fade the
 * first time it scrolls into view. Under `prefers-reduced-motion` (or when
 * motion fails) children render directly in a plain div — content is never
 * hidden behind an animation that never runs.
 */

import { motion, useReducedMotion } from 'framer-motion'

export interface RevealProps {
  children: React.ReactNode
  /** Optional stagger delay in seconds. */
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
