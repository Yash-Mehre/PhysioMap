/**
 * Seeded pseudo-randomness for the meal planner. Deterministic: the same seed
 * always produces the same plan, which makes plans shareable and testable.
 * (mulberry32 — same PRNG family the quiz engine uses.)
 */

/** Create a deterministic 0–1 RNG from a 32-bit seed. */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pick one item (seeded). */
export function pickSeeded<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

/** Fisher–Yates shuffle (seeded, non-mutating). */
export function shuffleSeeded<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Mix plan seed, day index and slot index into one 32-bit RNG seed. */
export function mixSlotSeed(seed: number, dayIndex: number, slotIndex: number): number {
  let mixed = (seed ^ 0x9e3779b9) >>> 0
  mixed = (Math.imul(mixed, 2654435761) + dayIndex * 40503 + slotIndex * 92837111) >>> 0
  mixed = (mixed ^ (mixed >>> 13)) >>> 0
  return mixed === 0 ? 1 : mixed
}
