import { NextResponse } from 'next/server'
import { clearSession, getCurrentUser } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/logging/audit'

export async function POST() {
  const user = await getCurrentUser()
  await clearSession()
  if (user) await writeAuditLog('auth.logout', user.id)
  return NextResponse.json({ ok: true })
}
