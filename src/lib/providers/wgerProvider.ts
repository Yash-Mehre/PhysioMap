/**
 * Optional wger exercise API adapter (https://wger.de/api/v2/).
 * Used only to attach a thumbnail/image URL to Build Mode exercises by name
 * match. OFF by default — enable with `ENABLE_WGER=true`. Any failure
 * (network, timeout, invalid payload) silently returns `null`; the UI simply
 * hides the image. In-memory cache avoids repeat lookups.
 */

import { z } from 'zod'
import type { ExerciseImageAdapter } from '@/lib/providers/types'

const REQUEST_TIMEOUT_MS = 4000
const CACHE_LIMIT = 200

const searchResponseSchema = z.object({
  results: z
    .array(
      z.object({
        image: z.url().nullish(),
        image_thumbnail: z.url().nullish(),
      }),
    )
    .min(1),
})

export function isWgerEnabled(): boolean {
  return process.env.ENABLE_WGER === 'true'
}

const imageCache = new Map<string, string | null>()

/** Look up a thumbnail URL for an exercise name (null when not found). */
export async function getWgerExerciseImage(exerciseName: string): Promise<string | null> {
  if (!isWgerEnabled()) return null
  const cacheKey = exerciseName.toLowerCase()
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey) ?? null

  let imageUrl: string | null = null
  try {
    const response = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(exerciseName)}`,
      { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { Accept: 'application/json' } },
    )
    if (response.ok) {
      const parsed = searchResponseSchema.safeParse(await response.json())
      if (parsed.success) {
        const first = parsed.data.results[0]
        imageUrl = first.image_thumbnail ?? first.image ?? null
      }
    }
  } catch {
    /* offline, timeout or invalid payload — fall back to no image */
  }

  if (imageCache.size >= CACHE_LIMIT) {
    const oldest = imageCache.keys().next().value
    if (oldest !== undefined) imageCache.delete(oldest)
  }
  imageCache.set(cacheKey, imageUrl)
  return imageUrl
}

export const wgerImageAdapter: ExerciseImageAdapter = {
  getExerciseImage: getWgerExerciseImage,
}
