import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/logging/audit'

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid login details' }, { status: 400 })

  const email = parsed.data.email.toLowerCase()
  const user = await db.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await writeAuditLog('auth.login_failed', undefined, { email })
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await createSession(user.id)
  await writeAuditLog('auth.login', user.id)
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
}
