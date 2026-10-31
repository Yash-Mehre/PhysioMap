import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/logging/audit'

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(100).optional(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid registration details' }, { status: 400 })

  const email = parsed.data.email.toLowerCase()
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'An account already exists' }, { status: 409 })

  const user = await db.user.create({
    data: { email, name: parsed.data.name, passwordHash: await hashPassword(parsed.data.password) },
  })
  await createSession(user.id)
  await writeAuditLog('auth.register', user.id)

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 })
}
