/**
 * THE single storage helper for PhysioMap. All persisted client data uses
 * versioned keys (`physiomap:v1:<name>` from `@/config/storageKeys`) through
 * these functions, which safely handle SSR (no `window`) and storage errors
 * (quota, private mode, disabled cookies).
 */

import { createJSONStorage } from 'zustand/middleware'

/** Read a JSON value from localStorage; returns `fallback` when unavailable. */
export function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Write a JSON value to localStorage; returns success (never throws). */
export function writeStoredValue<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** Remove a key from localStorage (never throws). */
export function removeStoredValue(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** SSR-safe, error-safe StateStorage shim for zustand's `persist` middleware. */
const safeStateStorage = {
  getItem: (name: string): string | null => {
    try {
      return window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      /* storage unavailable — persist silently skipped */
    }
  },
  removeItem: (name: string): void => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      /* nothing to clean up */
    }
  },
}

/** JSON storage adapter for zustand persist: `storage: zustandJSONStorage`. */
export const zustandJSONStorage = createJSONStorage(() => safeStateStorage)
