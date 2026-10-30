import { describe, expect, it } from 'vitest'
import {
  hydrationDayTotal,
  hydrationPercent,
  hydrationStreak,
  hydrationWeekSeries,
  toDateKey,
} from '@/lib/health/hydration'
import type { HydrationEntry, HydrationLog } from '@/types/nutrition'

function entry(amountMl: number): HydrationEntry {
  return { id: `${amountMl}-${Math.random()}`, amountMl, timestamp: new Date().toISOString() }
}

describe('toDateKey', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2025, 0, 5))).toBe('2025-01-05')
    expect(toDateKey(new Date(2025, 11, 31))).toBe('2025-12-31')
  })
})

describe('hydrationDayTotal', () => {
  it('sums a day and tolerates missing days', () => {
    expect(hydrationDayTotal([entry(250), entry(500)])).toBe(750)
    expect(hydrationDayTotal(undefined)).toBe(0)
  })
})

describe('hydrationPercent', () => {
  it('returns progress clamped to 100', () => {
    expect(hydrationPercent(1250, 2500)).toBe(50)
    expect(hydrationPercent(3000, 2500)).toBe(100)
    expect(hydrationPercent(0, 2500)).toBe(0)
  })
})

describe('hydrationWeekSeries', () => {
  it('returns seven days ending today', () => {
    const today = new Date(2025, 5, 15) // Sunday, June 15 2025
    const log: HydrationLog = {
      '2025-06-15': [entry(1000)],
      '2025-06-13': [entry(2000)],
    }
    const series = hydrationWeekSeries(log, 2500, today)
    expect(series).toHaveLength(7)
    expect(series[6].dateKey).toBe('2025-06-15')
    expect(series[6].amountMl).toBe(1000)
    expect(series[4].dateKey).toBe('2025-06-13')
    expect(series[4].amountMl).toBe(2000)
    expect(series.every((point) => point.goalMl === 2500)).toBe(true)
  })
})

describe('hydrationStreak', () => {
  const today = new Date(2025, 5, 15)
  const key = (offset: number): string => {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    return toDateKey(date)
  }

  it('counts today only when the goal is already met', () => {
    const log: HydrationLog = { [key(0)]: [entry(2600)] }
    expect(hydrationStreak(log, 2500, today)).toBe(1)
  })

  it('continues back through consecutive goal days', () => {
    const log: HydrationLog = {
      [key(0)]: [entry(2600)],
      [key(1)]: [entry(2500)],
      [key(2)]: [entry(3000)],
      [key(3)]: [entry(1000)], // streak breaks here
      [key(4)]: [entry(2600)],
    }
    expect(hydrationStreak(log, 2500, today)).toBe(3)
  })

  it('does not break a streak when today is still in progress', () => {
    const log: HydrationLog = {
      [key(1)]: [entry(2500)],
      [key(2)]: [entry(2600)],
    }
    expect(hydrationStreak(log, 2500, today)).toBe(2)
  })

  it('returns zero with an empty log', () => {
    expect(hydrationStreak({}, 2500, today)).toBe(0)
  })
})
