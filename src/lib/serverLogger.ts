import { db } from '@/lib/db'

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const
type LogLevel = (typeof LOG_LEVELS)[number]

export interface AppLogInput {
  level?: LogLevel
  source: string
  event: string
  message?: string
  metadata?: Record<string, string | number | boolean | null>
}

function isValidLevel(value: string | undefined): value is LogLevel {
  return value !== undefined && LOG_LEVELS.includes(value as LogLevel)
}

/** Persist a small, non-sensitive operational event without exposing credentials or health data. */
export async function writeAppLog(input: AppLogInput): Promise<void> {
  const level = isValidLevel(input.level) ? input.level : 'info'
  await db.appLog.create({
    data: {
      level,
      source: input.source.slice(0, 80),
      event: input.event.slice(0, 120),
      message: input.message?.slice(0, 500),
      metadata: input.metadata,
    },
  })
}
