import { NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAppLog } from '@/lib/serverLogger'

const logSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  source: z.string().trim().min(1).max(80),
  event: z.string().trim().min(1).max(120),
  message: z.string().trim().max(500).optional(),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
})

/** POST /api/logs — stores operational events only; never send credentials or health data here. */
export async function POST(request: Request) {
  try {
    const body = logSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid log payload.' }, { status: 400 })
    }

    await writeAppLog(body.data)
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Unable to save application log.' }, { status: 503 })
  }
}
