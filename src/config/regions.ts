/**
 * Single source of truth for the 19 body regions.
 * The `REGION_IDS` as-const array derives the `RegionId` union type used across
 * the entire app (types, data files, stores, avatar meshes, API validation).
 */

export const REGION_IDS = [
  'head',
  'neck',
  'traps',
  'shoulders',
  'chest',
  'biceps',
  'triceps',
  'forearms',
  'elbows',
  'abs',
  'obliques',
  'upper-back',
  'lower-back',
  'glutes',
  'hips',
  'quads',
  'hamstrings',
  'knees',
  'calves',
  'ankles-feet',
] as const

export type RegionId = (typeof REGION_IDS)[number]

export const REGION_GROUPS = ['head-neck', 'upper-body', 'core', 'lower-body'] as const

export type RegionGroup = (typeof REGION_GROUPS)[number]

export const BODY_SIDES = ['front', 'back'] as const

export type BodySide = (typeof BODY_SIDES)[number]

export interface Region {
  id: RegionId
  label: string
  group: RegionGroup
  sides: BodySide[]
}

export const REGIONS: readonly Region[] = [
  { id: 'head', label: 'Head', group: 'head-neck', sides: ['front', 'back'] },
  { id: 'neck', label: 'Neck', group: 'head-neck', sides: ['front', 'back'] },
  { id: 'traps', label: 'Traps', group: 'head-neck', sides: ['back'] },
  { id: 'shoulders', label: 'Shoulders', group: 'upper-body', sides: ['front', 'back'] },
  { id: 'chest', label: 'Chest', group: 'upper-body', sides: ['front'] },
  { id: 'biceps', label: 'Biceps', group: 'upper-body', sides: ['front'] },
  { id: 'triceps', label: 'Triceps', group: 'upper-body', sides: ['back'] },
  { id: 'forearms', label: 'Forearms', group: 'upper-body', sides: ['front', 'back'] },
  { id: 'elbows', label: 'Elbows', group: 'upper-body', sides: ['front', 'back'] },
  { id: 'upper-back', label: 'Upper Back', group: 'upper-body', sides: ['back'] },
  { id: 'abs', label: 'Abs', group: 'core', sides: ['front'] },
  { id: 'obliques', label: 'Obliques', group: 'core', sides: ['front'] },
  { id: 'lower-back', label: 'Lower Back', group: 'core', sides: ['back'] },
  { id: 'glutes', label: 'Glutes', group: 'core', sides: ['back'] },
  { id: 'hips', label: 'Hips', group: 'core', sides: ['front'] },
  { id: 'quads', label: 'Quads', group: 'lower-body', sides: ['front'] },
  { id: 'hamstrings', label: 'Hamstrings', group: 'lower-body', sides: ['back'] },
  { id: 'knees', label: 'Knees', group: 'lower-body', sides: ['front'] },
  { id: 'calves', label: 'Calves', group: 'lower-body', sides: ['back'] },
  { id: 'ankles-feet', label: 'Ankles & Feet', group: 'lower-body', sides: ['front', 'back'] },
]

/** Fast id -> region lookup for data files and providers. */
export const REGION_BY_ID: Record<RegionId, Region> = Object.fromEntries(
  REGIONS.map((region) => [region.id, region]),
) as Record<RegionId, Region>

/** Runtime type guard used by URL sync and API validation. */
export function isRegionId(value: unknown): value is RegionId {
  return typeof value === 'string' && (REGION_IDS as readonly string[]).includes(value)
}
