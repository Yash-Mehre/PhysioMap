import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isOpenFoodFactsEnabled, searchOpenFoodFacts } from '@/lib/providers/openFoodFactsProvider'

/**
 * GET /api/nutrition/food-search?q=… — optional Open Food Facts live search.
 * Returns `{ enabled: false, results: [] }` when the adapter flag is off, so
 * the client can message honestly without treating it as an error.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('barcode') ?? request.nextUrl.searchParams.get('q') ?? ''
  if (!isOpenFoodFactsEnabled()) {
    return NextResponse.json({ enabled: false, source: 'open-food-facts', results: [] })
  }
  const results = await searchOpenFoodFacts(query)
  return NextResponse.json({ enabled: true, source: 'open-food-facts', results })
}
