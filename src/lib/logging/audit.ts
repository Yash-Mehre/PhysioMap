import { db } from '@/lib/db'

export async function writeAuditLog(
  action: string,
  userId?: string,
  metadata?: Record<string, string | number | boolean | null>,
): Promise<void> {
  await db.auditLog.create({
    data: {
      action,
      userId,
      metadata,
    },
  })
}

export async function writeApplicationError(error: unknown, source?: string, endpoint?: string): Promise<void> {
  const value = error instanceof Error ? error : new Error(String(error))
  await db.applicationError.create({
    data: { message: value.message, stack: value.stack, source, endpoint },
  })
}
