/**
 * Tabs of the Health & Nutrition Suite. The active tab is URL-synced via
 * `?tab=` so deep links (e.g. from the landing page) open the right panel.
 * The profile lives in the header profile sheet, not a tab — unknown values
 * (including the old `profile` tab) fall back to Calculators.
 */

export const HEALTH_TAB_IDS = ['calculators', 'planner', 'hydration', 'summary'] as const

export type HealthTabId = (typeof HEALTH_TAB_IDS)[number]

export const HEALTH_TABS: readonly { id: HealthTabId; label: string; hint: string }[] = [
  { id: 'calculators', label: 'Calculators', hint: 'BMI, calories, macros, water' },
  { id: 'planner', label: 'Meal Planner', hint: 'Personalized daily plans' },
  { id: 'hydration', label: 'Hydration', hint: 'Daily water tracking' },
  { id: 'summary', label: 'Summary', hint: 'Take it with you' },
]

export function isHealthTabId(value: string | null | undefined): value is HealthTabId {
  return typeof value === 'string' && (HEALTH_TAB_IDS as readonly string[]).includes(value)
}

export const DEFAULT_HEALTH_TAB: HealthTabId = 'calculators'
