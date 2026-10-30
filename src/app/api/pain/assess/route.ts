import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { AGGRAVATORS, DURATIONS, ONSETS, RED_FLAGS, SENSATIONS } from '@/config/painSchemas'
import { isRegionId } from '@/config/regions'
import { dataProvider } from '@/lib/providers'
import { assessPain } from '@/lib/pain/assess'
import type { PainAssessmentInput } from '@/types'

/** Zod schema mirroring `PainAssessmentInput` (enums from `@/config/painSchemas`). */
const assessSchema = z.object({
  regionId: z.string().refine(isRegionId, { message: 'Unknown region id.' }),
  sensations: z.enum(SENSATIONS).array().min(1, 'Select at least one sensation.'),
  severity: z.number().int().min(1).max(10),
  onset: z.enum(ONSETS),
  duration: z.enum(DURATIONS),
  aggravators: z.enum(AGGRAVATORS).array(),
  redFlags: z.enum(RED_FLAGS).array(),
})

/** POST /api/pain/assess — run the pure rule engine for a symptom report. */
export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { code: 'invalid-json', message: 'Request body must be valid JSON.' } },
        { status: 400 },
      )
    }

    const parsed = assessSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid-input',
            message: parsed.error.issues.map((issue) => issue.message).join(' '),
          },
        },
        { status: 400 },
      )
    }

    const input = parsed.data as PainAssessmentInput
    const content = dataProvider.getRegionContent(input.regionId)
    if (!content) {
      return NextResponse.json(
        { error: { code: 'region-not-found', message: `No content for region "${input.regionId}".` } },
        { status: 404 },
      )
    }

    const result = assessPain(input, content.pain.associations, content.region.label)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: { code: 'internal-error', message: 'Assessment failed unexpectedly.' } },
      { status: 500 },
    )
  }
}
