/**
 * Hydration log helpers (pure). The store persists entries keyed by local
 * date (`YYYY-MM-DD`); these helpers compute totals, the 7-day chart series
 * and the goal streak without touching storage.
 */

import type { HydrationDayPoint, HydrationEntry, HydrationLog } from '@/types/nutrition'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Format a Date as a local `YYYY-MM-DD` key (never UTC — avoids off-by-one). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Total ml logged for one day's entries. */
export function hydrationDayTotal(entries: readonly HydrationEntry[] | undefined): number {
  if (!entries) return 0
  return entries.reduce((total, entry) => total + entry.amountMl, 0)
}

/** Progress toward the goal as a 0–100 percentage (clamped). */
export function hydrationPercent(totalMl: number, goalMl: number): number {
  if (goalMl <= 0) return 0
  return Math.min((totalMl / goalMl) * 100, 100)
}

/** Last 7 days (oldest → newest, today last) with totals and the goal line. */
export function hydrationWeekSeries(
  log: HydrationLog,
  goalMl: number,
  today: Date = new Date(),
): HydrationDayPoint[] {
  const series: HydrationDayPoint[] = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const dateKey = toDateKey(date)
    series.push({
      dateKey,
      label: WEEKDAY_LABELS[date.getDay()],
      amountMl: hydrationDayTotal(log[dateKey]),
      goalMl,
    })
  }
  return series
}

/**
 * Consecutive days meeting the goal, counting back from today. Today only
 * counts once its goal is met; a missed today does not break a streak that
 * was alive yesterday.
 */
export function hydrationStreak(log: HydrationLog, goalMl: number, today: Date = new Date()): number {
  let streak = 0
  const cursor = new Date(today)

  // Today counts only if the goal is already met.
  if (hydrationDayTotal(log[toDateKey(cursor)]) >= goalMl) {
    streak += 1
  }

  cursor.setDate(cursor.getDate() - 1)
  while (hydrationDayTotal(log[toDateKey(cursor)]) >= goalMl) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
    // Hard stop after 365 days to bound the loop on corrupted data.
    if (streak >= 365) break
  }
  return streak
}
