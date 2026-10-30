'use client'

/**
 * Renders the current year, but only after hydration — the server renders the
 * provided fallback (its own timezone/year) so SSR and the first client
 * render always agree.
 */

import { useHydrated } from '@/hooks/useHydrated'

export function FooterYear({ fallbackYear }: { fallbackYear: number }) {
  const hydrated = useHydrated()
  return <>{hydrated ? new Date().getFullYear() : fallbackYear}</>
}
