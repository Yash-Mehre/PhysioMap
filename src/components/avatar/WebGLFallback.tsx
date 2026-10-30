'use client'

/** Friendly panel shown when WebGL is unavailable — the Region List stays fully usable. */

import { MonitorOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface WebGLFallbackProps {
  onOpenRegions: () => void
}

export function WebGLFallback({ onOpenRegions }: WebGLFallbackProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-surface-raised">
        <MonitorOff className="h-6 w-6 text-copper" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <p className="font-heading text-base font-semibold text-foreground">3D view unavailable</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your browser or device does not support WebGL, so the interactive body map cannot render here. Every
          feature still works through the region browser — pick a body part below.
        </p>
      </div>
      <Button onClick={onOpenRegions} className="bg-brand-blue text-white hover:bg-brand-blue/85">
        Browse regions
      </Button>
    </div>
  )
}
