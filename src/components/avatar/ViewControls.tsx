'use client'

/** Orbit view overlay buttons: Front / Back / Left / Right / Reset + rotate. */

import { RotateCcw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExplorerStore } from '@/store/useExplorerStore'
import { cn } from '@/lib/utils'

const VIEW_BUTTONS = [
  { view: 'front', label: 'Front' },
  { view: 'back', label: 'Back' },
  { view: 'left', label: 'Left' },
  { view: 'right', label: 'Right' },
] as const

export function ViewControls({ className }: { className?: string }) {
  const requestCameraView = useExplorerStore((state) => state.requestCameraView)
  const autoRotate = useExplorerStore((state) => state.autoRotate)
  const setAutoRotate = useExplorerStore((state) => state.setAutoRotate)

  return (
    <div
      role="group"
      aria-label="Camera view controls"
      className={cn(
        'flex items-center gap-1 rounded-full border border-white/10 bg-surface/85 p-1 shadow-lg backdrop-blur-md',
        className,
      )}
    >
      {VIEW_BUTTONS.map((button) => (
        <button
          key={button.view}
          type="button"
          onClick={() => requestCameraView(button.view)}
          className="rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
        >
          {button.label}
        </button>
      ))}
      <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-white/10" />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Reset view"
        title="Reset view"
        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => requestCameraView('reset')}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
      {/* An explicit click always rotates — OS reduced-motion only suppresses
          motion that starts on its own (the landing hero default). */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Auto-rotate (R)"
        aria-pressed={autoRotate}
        title="Auto-rotate (R)"
        className={cn(
          'h-7 w-7 rounded-full',
          autoRotate ? 'text-copper hover:text-copper' : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => setAutoRotate(!autoRotate)}
      >
        <RotateCw
          className={cn('h-3.5 w-3.5', autoRotate && 'animate-[spin_3s_linear_infinite] motion-reduce:animate-none')}
        />
      </Button>
    </div>
  )
}
