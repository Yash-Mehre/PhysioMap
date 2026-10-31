import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

const COOKIE_NAME = 'physiomap_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex')
  await db.authSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null

  const session = await db.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt <= new Date()) {
    await db.authSession.delete({ where: { id: session.id } })
    return null
  }
  return session.user
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) {
    await db.authSession.deleteMany({ where: { tokenHash: hashToken(token) } })
  }
  cookieStore.delete(COOKIE_NAME)
}
