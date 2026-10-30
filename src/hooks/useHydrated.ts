/** True only after the first client-side render — gates persisted-store UI. */

import { useEffect, useState } from 'react'

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}
