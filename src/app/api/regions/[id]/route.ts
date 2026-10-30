import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { isRegionId } from '@/config/regions'
import { dataProvider } from '@/lib/providers'

const regionIdSchema = z.string().refine(isRegionId, { message: 'Unknown region id.' })

/** GET /api/regions/[id] — full content bundle for one region. */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const parsed = regionIdSchema.safeParse(id)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'region-not-found', message: `No region with id "${id}".` } },
        { status: 404 },
      )
    }
    const content = dataProvider.getRegionContent(parsed.data)
    if (!content) {
      return NextResponse.json(
        { error: { code: 'region-not-found', message: `No content for region "${id}".` } },
        { status: 404 },
      )
    }
    return NextResponse.json(content)
  } catch {
    return NextResponse.json(
      { error: { code: 'internal-error', message: 'Failed to load region content.' } },
      { status: 500 },
    )
  }
}
