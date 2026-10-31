import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { AGGRAVATORS, DURATIONS, ONSETS, RED_FLAGS, SENSATIONS } from '@/config/painSchemas'
import { isRegionId } from '@/config/regions'
import { dataProvider } from '@/lib/providers'
import { assessPain } from '@/lib/pain/assess'
import type { PainAssessmentInput } from '@/types'
import { writeApplicationError } from '@/lib/logging/audit'

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

/** Zod schema for the assessment response (urgency, red flags, associations, guidance). */
const guidanceSchema = z.object({
  headline: z.string().min(1),
  doNow: z.string().min(1).array().min(1).max(3),
  avoid: z.string().min(1).array().min(1).max(3),
  watchFor: z.string().min(1).array().min(1).max(3),
  followUp: z.string().min(1).array().min(1).max(3),
  basedOn: z.string().min(1).array().min(1),
})

const assessResponseSchema = z.object({
  urgency: z.enum(['self-care', 'monitor', 'see-clinician', 'urgent']),
  redFlags: z.enum(RED_FLAGS).array(),
  associations: z
    .object({
      title: z.string(),
      explanation: z.string(),
      score: z.number(),
      matchedSensations: z.enum(SENSATIONS).array(),
      matchedAggravators: z.enum(AGGRAVATORS).array(),
    })
    .array(),
  guidance: guidanceSchema,
})

/** POST /api/pain/assess — run the pure rule engine for a symptom report. */
export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      await writeApplicationError(error, 'pain-assess', '/api/pain/assess')
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

    const result = assessPain(input, content.pain.associations)
    const validated = assessResponseSchema.safeParse(result)
    if (!validated.success) {
      return NextResponse.json(
        { error: { code: 'invalid-output', message: 'Assessment guidance failed validation.' } },
        { status: 500 },
      )
    }
    return NextResponse.json(validated.data)
  } catch {
    return NextResponse.json(
      { error: { code: 'internal-error', message: 'Assessment failed unexpectedly.' } },
      { status: 500 },
    )
  }
}
