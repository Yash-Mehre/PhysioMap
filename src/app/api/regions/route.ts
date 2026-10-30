import { NextResponse } from 'next/server'
import { dataProvider } from '@/lib/providers'

/** GET /api/regions — list all regions. */
export async function GET() {
  try {
    return NextResponse.json({ regions: dataProvider.getRegions() })
  } catch {
    return NextResponse.json(
      { error: { code: 'internal-error', message: 'Failed to load regions.' } },
      { status: 500 },
    )
  }
}
