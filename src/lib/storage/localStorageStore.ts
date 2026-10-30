/**
 * A tiny external store over a versioned localStorage key, designed for
 * `useSyncExternalStore`. The parsed value is cached so the snapshot identity
 * stays stable between renders; writes notify every subscriber. SSR renders
 * the fallback via `getServerSnapshot`, so nothing here can cause hydration
 * mismatches.
 */

import { useCallback, useSyncExternalStore } from 'react'
import { readStoredValue, writeStoredValue } from '@/lib/storage/storage'

export interface LocalStorageStore<T> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => T
  getServerSnapshot: () => T
  set: (value: T) => void
}

/** Create a store for a single localStorage key (instantiate at module scope). */
export function createLocalStorageStore<T>(key: string, fallback: T): LocalStorageStore<T> {
  const listeners = new Set<() => void>()
  let cache: { value: T } | null = null

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot() {
      if (cache === null) {
        cache = { value: readStoredValue<T>(key, fallback) }
      }
      return cache.value
    },
    getServerSnapshot() {
      return fallback
    },
    set(value) {
      cache = { value }
      writeStoredValue(key, value)
      for (const listener of listeners) listener()
    },
  }
}

/** Read + write a localStorage store through useSyncExternalStore. */
export function useLocalStorageStoreValue<T>(store: LocalStorageStore<T>): [T, (value: T) => void] {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const setValue = useCallback((next: T) => store.set(next), [store])
  return [value, setValue]
}
