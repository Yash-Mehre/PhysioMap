/**
 * Central reset registry for "Log out & start over". Every persisted store
 * registers a reset function at module scope (`registerStoreReset`), so
 * `clearAllUserData` can wipe both localStorage (every `physiomap:v1:` key
 * except the disclaimer acknowledgement) and the in-memory state of every
 * store that is currently loaded. Stores whose module was never loaded have
 * no in-memory state to clear and re-initialise from the wiped storage.
 */

import { STORAGE_KEYS } from '@/config/storageKeys'

type StoreReset = () => void

const resets = new Set<StoreReset>()

/** Register a persisted store's reset. Call once at module scope. */
export function registerStoreReset(reset: StoreReset): void {
  resets.add(reset)
}

/**
 * Remove every PhysioMap data key from localStorage (the disclaimer
 * acknowledgement survives, so the first-visit popup never reappears) and
 * reset every registered in-memory store. Never throws.
 */
export function clearAllUserData(): void {
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = []
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index)
        if (
          key !== null &&
          key.startsWith(`${STORAGE_KEYS.prefix}:`) &&
          key !== STORAGE_KEYS.disclaimerAck
        ) {
          keysToRemove.push(key)
        }
      }
      for (const key of keysToRemove) {
        window.localStorage.removeItem(key)
      }
    } catch {
      /* storage unavailable — continue with the in-memory resets */
    }
  }
  for (const reset of resets) {
    try {
      reset()
    } catch {
      /* one failing reset must not block the others */
    }
  }
}
