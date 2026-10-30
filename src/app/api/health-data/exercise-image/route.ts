import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getWgerExerciseImage, isWgerEnabled } from '@/lib/providers/wgerProvider'

/**
 * GET /api/health-data/exercise-image?name=… — optional wger thumbnail lookup.
 * Returns `{ imageUrl: null }` immediately when the adapter is off.
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name') ?? ''
  if (!name || !isWgerEnabled()) {
    return NextResponse.json({ imageUrl: null })
  }
  const imageUrl = await getWgerExerciseImage(name)
  return NextResponse.json({ imageUrl })
}
