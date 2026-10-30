/** Typed fetch client for the pain assessment API. */

import type { PainAssessmentInput, PainAssessmentResult } from '@/types'
import { ApiError } from '@/services/regionService'

export const painService = {
  /** Submit a symptom assessment; runs the server-side rule engine. */
  assess(input: PainAssessmentInput): Promise<PainAssessmentResult> {
    return fetch('/api/pain/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then(async (response) => {
      if (response.ok) return (await response.json()) as PainAssessmentResult
      let code = `http-${response.status}`
      let message = `Assessment failed with status ${response.status}.`
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
    })
  },
}
