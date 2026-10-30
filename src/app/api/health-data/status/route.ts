import { NextResponse } from 'next/server'
import { getProviderStatuses } from '@/lib/providers'

/** GET /api/health-data/status — which data providers are active. */
export async function GET() {
  return NextResponse.json({ providers: getProviderStatuses() })
}
