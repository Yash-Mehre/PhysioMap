/** WebGL capability detection — falls back to the searchable Region List. */

import { useEffect, useState } from 'react'

export function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)
  useEffect(() => {
    setSupported(detectWebGLSupport())
  }, [])
  return supported
}
