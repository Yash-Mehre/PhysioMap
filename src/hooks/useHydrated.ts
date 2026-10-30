/**
 * True only after the first client-side render completes.
 * Built on `useSyncExternalStore` (hydration-safe by construction) so anything
 * reading localStorage, persisted Zustand state, `window`, `Date.now()` or
 * `Math.random()` can render a stable placeholder during SSR.
 */

import { useSyncExternalStore } from 'react'

const noopSubscribe = (): (() => void) => () => undefined
const getClientSnapshot = (): boolean => true
const getServerSnapshot = (): boolean => false

export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, getClientSnapshot, getServerSnapshot)
}
