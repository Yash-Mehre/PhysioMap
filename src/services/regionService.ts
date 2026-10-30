/** Typed fetch client for the region API. Client code never calls fetch directly. */

import type { Region, RegionContent } from '@/types'
import type { RegionId } from '@/config/regions'

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

async function requestJson<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(path)
  } catch {
    throw new ApiError('network-error', 'Could not reach the PhysioMap service. Check your connection and retry.', 0)
  }
  if (!response.ok) {
    let code = `http-${response.status}`
    let message = `Request failed with status ${response.status}.`
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } }
      if (body.error) {
        code = body.error.code ?? code
        message = body.error.message ?? message
      }
    } catch {
      /* non-JSON error body — keep defaults */
    }
    throw new ApiError(code, message, response.status)
  }
  return (await response.json()) as T
}

export const regionService = {
  /** List all regions (light metadata). */
  getRegions(): Promise<Region[]> {
    return requestJson<{ regions: Region[] }>('/api/regions').then((body) => body.regions)
  },
  /** Full content bundle for one region. */
  getRegionContent(id: RegionId): Promise<RegionContent> {
    return requestJson<RegionContent>(`/api/regions/${id}`)
  },
}
