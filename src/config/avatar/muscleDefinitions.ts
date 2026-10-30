/**
 * Data-driven shape definitions for the procedural anatomical avatar.
 * Every mesh of the "muscle man" figure is described here once; mirrored pairs
 * come from a single definition with `mirror: true`. Landmarks (world units):
 * figure height 1.8, ankle 0.08, knee 0.50, crotch 0.85, hip 0.92, navel 1.08,
 * nipple line 1.32, shoulder 1.48, chin 1.55, head center 1.68 (r 0.11),
 * shoulder width ≈ 0.46, hip width ≈ 0.34. Arms are A-posed ~15° from torso.
 */

import type { BodySide, RegionId } from '@/config/regions'

export type MuscleMaterialKind = 'muscle' | 'tendon' | 'underlay-muscle' | 'underlay-grey'

export type MuscleShape =
  | { kind: 'capsule'; radius: number; length: number }
  | { kind: 'ellipsoid'; size: readonly [number, number, number] }
  | { kind: 'roundedBox'; size: readonly [number, number, number]; radius: number }
  | { kind: 'lathe'; profile: readonly (readonly [number, number])[] }

export interface MuscleShapeDefinition {
  id: string
  /** Region the mesh belongs to — `null` marks neutral underlay (non-interactive). */
  regionId: RegionId | null
  shape: MuscleShape
  position: readonly [number, number, number]
  /** Euler rotation in radians; mirrored copies negate y and z. */
  rotation?: readonly [number, number, number]
  scale?: readonly [number, number, number]
  /** Create a mirrored copy on -x (right side defined, left side generated). */
  mirror?: boolean
  /** Side of the body this muscle reads best from (informational, all sides render). */
  side?: BodySide
  material?: MuscleMaterialKind
}

const DEG = Math.PI / 180
const ARM_ANGLE = -15 * DEG
const THIGH_ANGLE = -7 * DEG

export const MUSCLE_DEFINITIONS: readonly MuscleShapeDefinition[] = [
  // ─── Neutral underlay (fills gaps, never interactive) ───────────────────
  {
    id: 'underlay-head',
    regionId: null,
    shape: { kind: 'ellipsoid', size: [0.105, 0.125, 0.115] },
    position: [0, 1.68, 0.005],
    material: 'underlay-grey',
  },
  {
    id: 'underlay-jaw',
    regionId: null,
    shape: { kind: 'ellipsoid', size: [0.075, 0.05, 0.07] },
    position: [0, 1.595, 0.03],
    material: 'underlay-grey',
  },
  {
    id: 'underlay-neck',
    regionId: null,
    shape: { kind: 'capsule', radius: 0.048, length: 0.08 },
    position: [0, 1.505, -0.005],
    material: 'underlay-muscle',
  },
  {
    id: 'underlay-torso',
    regionId: null,
    shape: {
      kind: 'lathe',
      profile: [
        [0.1, 0.82],
        [0.15, 0.92],
        [0.165, 1.06],
        [0.16, 1.18],
        [0.145, 1.3],
        [0.125, 1.4],
        [0.09, 1.47],
      ],
    },
    position: [0, 0, 0],
    scale: [1, 1, 0.62],
    material: 'underlay-muscle',
  },
  {
    id: 'underlay-pelvis',
    regionId: null,
    shape: { kind: 'ellipsoid', size: [0.155, 0.115, 0.1] },
    position: [0, 0.9, 0],
    material: 'underlay-muscle',
  },
  {
    id: 'underlay-upperarm-right',
    regionId: null,
    shape: { kind: 'capsule', radius: 0.041, length: 0.24 },
    position: [0.235, 1.285, 0],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    material: 'underlay-muscle',
  },
  {
    id: 'underlay-forearm-right',
    regionId: null,
    shape: { kind: 'capsule', radius: 0.031, length: 0.17 },
    position: [0.305, 1.0, 0],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    material: 'underlay-muscle',
  },
  {
    id: 'underlay-hand-right',
    regionId: null,
    shape: { kind: 'ellipsoid', size: [0.028, 0.068, 0.02] },
    position: [0.352, 0.815, 0.008],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    material: 'underlay-grey',
  },
  {
    id: 'underlay-thigh-right',
    regionId: null,
    shape: { kind: 'capsule', radius: 0.058, length: 0.26 },
    position: [0.12, 0.7, 0],
    rotation: [0, 0, THIGH_ANGLE],
    mirror: true,
    material: 'underlay-muscle',
  },
  {
    id: 'underlay-calf-right',
    regionId: null,
    shape: { kind: 'capsule', radius: 0.04, length: 0.18 },
    position: [0.14, 0.3, -0.005],
    mirror: true,
    material: 'underlay-muscle',
  },

  // ─── Neck (SCM pair front + splenius pair back) ─────────────────────────
  {
    id: 'neck-scm-right',
    regionId: 'neck',
    shape: { kind: 'capsule', radius: 0.017, length: 0.07 },
    position: [0.038, 1.515, 0.02],
    rotation: [-38 * DEG, 0, -12 * DEG],
    mirror: true,
    side: 'front',
  },
  {
    id: 'neck-splenius-right',
    regionId: 'neck',
    shape: { kind: 'capsule', radius: 0.016, length: 0.075 },
    position: [0.032, 1.5, -0.03],
    rotation: [22 * DEG, 0, -8 * DEG],
    mirror: true,
    side: 'back',
  },

  // ─── Traps (diamond plate + neck-shoulder slopes) ───────────────────────
  {
    id: 'traps-plate',
    regionId: 'traps',
    shape: { kind: 'ellipsoid', size: [0.185, 0.1, 0.05] },
    position: [0, 1.45, -0.058],
    side: 'back',
  },
  {
    id: 'traps-slope-right',
    regionId: 'traps',
    shape: { kind: 'capsule', radius: 0.032, length: 0.13 },
    position: [0.125, 1.485, -0.03],
    rotation: [0, 0, -38 * DEG],
    mirror: true,
    side: 'back',
  },

  // ─── Shoulders (deltoid caps) ───────────────────────────────────────────
  {
    id: 'shoulders-delt-right',
    regionId: 'shoulders',
    shape: { kind: 'ellipsoid', size: [0.058, 0.095, 0.095] },
    position: [0.19, 1.41, 0],
    mirror: true,
    side: 'front',
  },

  // ─── Chest (pec ellipsoids) ─────────────────────────────────────────────
  {
    id: 'chest-pec-right',
    regionId: 'chest',
    shape: { kind: 'ellipsoid', size: [0.115, 0.088, 0.055] },
    position: [0.1, 1.32, 0.075],
    mirror: true,
    side: 'front',
  },

  // ─── Biceps / Triceps (front & back upper arm) ──────────────────────────
  {
    id: 'biceps-belly-right',
    regionId: 'biceps',
    shape: { kind: 'capsule', radius: 0.046, length: 0.19 },
    position: [0.238, 1.3, 0.028],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    side: 'front',
  },
  {
    id: 'triceps-belly-right',
    regionId: 'triceps',
    shape: { kind: 'capsule', radius: 0.043, length: 0.21 },
    position: [0.238, 1.285, -0.026],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    side: 'back',
  },

  // ─── Forearms (tapered capsule + brachioradialis bridge) ────────────────
  {
    id: 'forearms-belly-right',
    regionId: 'forearms',
    shape: { kind: 'capsule', radius: 0.035, length: 0.16 },
    position: [0.305, 1.0, 0.008],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    side: 'front',
  },
  {
    id: 'forearms-brachioradialis-right',
    regionId: 'forearms',
    shape: { kind: 'ellipsoid', size: [0.03, 0.06, 0.035] },
    position: [0.275, 1.08, 0.02],
    rotation: [0, 0, ARM_ANGLE],
    mirror: true,
    side: 'front',
  },

  // ─── Elbows (tendon joint) ──────────────────────────────────────────────
  {
    id: 'elbows-joint-right',
    regionId: 'elbows',
    shape: { kind: 'ellipsoid', size: [0.05, 0.045, 0.05] },
    position: [0.272, 1.125, 0],
    mirror: true,
    material: 'tendon',
  },

  // ─── Abs (3×2 rounded blocks) ───────────────────────────────────────────
  {
    id: 'abs-block-row1-right',
    regionId: 'abs',
    shape: { kind: 'roundedBox', size: [0.074, 0.066, 0.045], radius: 0.02 },
    position: [0.056, 1.135, 0.086],
    mirror: true,
    side: 'front',
  },
  {
    id: 'abs-block-row2-right',
    regionId: 'abs',
    shape: { kind: 'roundedBox', size: [0.074, 0.066, 0.045], radius: 0.02 },
    position: [0.056, 1.045, 0.086],
    mirror: true,
    side: 'front',
  },
  {
    id: 'abs-block-row3-right',
    regionId: 'abs',
    shape: { kind: 'roundedBox', size: [0.074, 0.066, 0.045], radius: 0.02 },
    position: [0.056, 0.955, 0.086],
    mirror: true,
    side: 'front',
  },

  // ─── Obliques (slanted side ellipsoids) ─────────────────────────────────
  {
    id: 'obliques-right',
    regionId: 'obliques',
    shape: { kind: 'ellipsoid', size: [0.05, 0.13, 0.07] },
    position: [0.143, 1.02, 0.02],
    rotation: [0, 0, -14 * DEG],
    mirror: true,
    side: 'front',
  },

  // ─── Upper back (V-shaped lats + mid-back plate) ────────────────────────
  {
    id: 'upperback-lats-right',
    regionId: 'upper-back',
    shape: { kind: 'ellipsoid', size: [0.1, 0.17, 0.05] },
    position: [0.105, 1.2, -0.068],
    rotation: [0, 0, 17 * DEG],
    mirror: true,
    side: 'back',
  },
  {
    id: 'upperback-midplate',
    regionId: 'upper-back',
    shape: { kind: 'ellipsoid', size: [0.15, 0.17, 0.045] },
    position: [0, 1.34, -0.072],
    side: 'back',
  },

  // ─── Lower back (erector columns) ───────────────────────────────────────
  {
    id: 'lowerback-erector-right',
    regionId: 'lower-back',
    shape: { kind: 'capsule', radius: 0.028, length: 0.17 },
    position: [0.047, 1.04, -0.083],
    mirror: true,
    side: 'back',
  },

  // ─── Glutes ─────────────────────────────────────────────────────────────
  {
    id: 'glutes-max-right',
    regionId: 'glutes',
    shape: { kind: 'ellipsoid', size: [0.095, 0.105, 0.085] },
    position: [0.085, 0.885, -0.072],
    mirror: true,
    side: 'back',
  },

  // ─── Hips (TFL / hip-flexor forms) ──────────────────────────────────────
  {
    id: 'hips-tfl-right',
    regionId: 'hips',
    shape: { kind: 'ellipsoid', size: [0.048, 0.105, 0.055] },
    position: [0.148, 0.94, 0.018],
    mirror: true,
    side: 'front',
  },

  // ─── Quads (rectus + vastus lateralis + vastus medialis) ────────────────
  {
    id: 'quads-rectus-right',
    regionId: 'quads',
    shape: { kind: 'capsule', radius: 0.04, length: 0.19 },
    position: [0.125, 0.71, 0.052],
    rotation: [0, 0, THIGH_ANGLE],
    mirror: true,
    side: 'front',
  },
  {
    id: 'quads-vastus-lateralis-right',
    regionId: 'quads',
    shape: { kind: 'ellipsoid', size: [0.055, 0.15, 0.06] },
    position: [0.172, 0.72, 0.018],
    rotation: [0, 0, -4 * DEG],
    mirror: true,
    side: 'front',
  },
  {
    id: 'quads-vastus-medialis-right',
    regionId: 'quads',
    shape: { kind: 'ellipsoid', size: [0.045, 0.085, 0.055] },
    position: [0.082, 0.6, 0.042],
    mirror: true,
    side: 'front',
  },

  // ─── Hamstrings (two bulges per thigh) ──────────────────────────────────
  {
    id: 'hamstrings-biceps-femoris-right',
    regionId: 'hamstrings',
    shape: { kind: 'capsule', radius: 0.039, length: 0.16 },
    position: [0.158, 0.68, -0.052],
    rotation: [0, 0, -5 * DEG],
    mirror: true,
    side: 'back',
  },
  {
    id: 'hamstrings-semitendinosus-right',
    regionId: 'hamstrings',
    shape: { kind: 'capsule', radius: 0.033, length: 0.15 },
    position: [0.088, 0.67, -0.047],
    rotation: [0, 0, -3 * DEG],
    mirror: true,
    side: 'back',
  },

  // ─── Knees (joint + patella) ────────────────────────────────────────────
  {
    id: 'knees-joint-right',
    regionId: 'knees',
    shape: { kind: 'ellipsoid', size: [0.057, 0.052, 0.058] },
    position: [0.138, 0.5, 0.005],
    mirror: true,
    material: 'tendon',
    side: 'front',
  },
  {
    id: 'knees-patella-right',
    regionId: 'knees',
    shape: { kind: 'ellipsoid', size: [0.034, 0.04, 0.018] },
    position: [0.138, 0.515, 0.058],
    mirror: true,
    material: 'tendon',
    side: 'front',
  },

  // ─── Calves (twin gastro heads + shin form) ─────────────────────────────
  {
    id: 'calves-gastro-medial-right',
    regionId: 'calves',
    shape: { kind: 'ellipsoid', size: [0.036, 0.105, 0.05] },
    position: [0.115, 0.365, -0.048],
    mirror: true,
    side: 'back',
  },
  {
    id: 'calves-gastro-lateral-right',
    regionId: 'calves',
    shape: { kind: 'ellipsoid', size: [0.033, 0.095, 0.045] },
    position: [0.172, 0.375, -0.042],
    mirror: true,
    side: 'back',
  },
  {
    id: 'calves-shin-right',
    regionId: 'calves',
    shape: { kind: 'capsule', radius: 0.027, length: 0.13 },
    position: [0.14, 0.29, 0.028],
    mirror: true,
    side: 'front',
  },

  // ─── Ankles & feet (ankle joints + foot wedges) ─────────────────────────
  {
    id: 'ankles-joint-right',
    regionId: 'ankles-feet',
    shape: { kind: 'ellipsoid', size: [0.042, 0.042, 0.046] },
    position: [0.138, 0.085, -0.005],
    mirror: true,
    material: 'tendon',
  },
  {
    id: 'ankles-foot-right',
    regionId: 'ankles-feet',
    shape: { kind: 'roundedBox', size: [0.05, 0.052, 0.15], radius: 0.02 },
    position: [0.14, 0.032, 0.052],
    rotation: [0, -8 * DEG, 0],
    mirror: true,
  },
] as const

/**
 * Expanded definitions: every `mirror: true` entry also yields a mirrored
 * copy on the -x side (position x negated, rotation y/z negated).
 */
export interface ExpandedMuscleShape extends MuscleShapeDefinition {
  /** Extra suffix "-left" on mirrored copies; "-right" appended to source ids. */
  expandedId: string
  mirrored: boolean
}

export function expandMuscleDefinitions(
  definitions: readonly MuscleShapeDefinition[],
): ExpandedMuscleShape[] {
  const expanded: ExpandedMuscleShape[] = []
  for (const definition of definitions) {
    expanded.push({ ...definition, expandedId: `${definition.id}-right`, mirrored: false })
    if (definition.mirror) {
      expanded.push({
        ...definition,
        id: definition.id,
        expandedId: `${definition.id}-left`,
        position: [-definition.position[0], definition.position[1], definition.position[2]],
        rotation: definition.rotation
          ? [definition.rotation[0], -definition.rotation[1], -definition.rotation[2]]
          : undefined,
        mirrored: true,
      })
    }
  }
  return expanded
}

/** Average position of a region's meshes — used as the floating label anchor. */
export function computeRegionAnchors(
  definitions: readonly MuscleShapeDefinition[],
): Record<RegionId, [number, number, number]> {
  const sums = new Map<RegionId, { x: number; y: number; z: number; count: number }>()
  for (const item of expandMuscleDefinitions(definitions)) {
    if (!item.regionId) continue
    const current = sums.get(item.regionId) ?? { x: 0, y: 0, z: 0, count: 0 }
    current.x += item.position[0]
    current.y += item.position[1]
    current.z += item.position[2]
    current.count += 1
    sums.set(item.regionId, current)
  }
  const anchors = {} as Record<RegionId, [number, number, number]>
  for (const [regionId, sum] of sums) {
    anchors[regionId] = [sum.x / sum.count, sum.y / sum.count, sum.z / sum.count]
  }
  return anchors
}
