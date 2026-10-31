/**
 * Optional GLTF avatar support: maps mesh names inside an external anatomy
 * model to PhysioMap region ids. Used only when NEXT_PUBLIC_AVATAR_MODEL_URL
 * is set; the procedural avatar is the default.
 */

import type { RegionId } from '@/config/regions'

/**
 * Keys are mesh names inside the GLTF file (case-insensitive match attempted
 * with `contains`). Meshes with no mapping are rendered as neutral underlay.
 */
export const GLTF_MESH_MAP: Record<string, RegionId> = {
  Head: 'head',
  Skull: 'head',
  Face: 'head',
  Sternocleidomastoideus: 'neck',
  neck: 'neck',
  Trapezius: 'traps',
  Deltoideus: 'shoulders',
  Deltoid: 'shoulders',
  PectoralisMajor: 'chest',
  Pectoralis: 'chest',
  BicepsBrachii: 'biceps',
  Biceps: 'biceps',
  TricepsBrachii: 'triceps',
  Triceps: 'triceps',
  Brachioradialis: 'forearms',
  ForearmFlexors: 'forearms',
  Forearm: 'forearms',
  Elbow: 'elbows',
  RectusAbdominis: 'abs',
  Abdominals: 'abs',
  ObliquusExternus: 'obliques',
  Obliques: 'obliques',
  LatissimusDorsi: 'upper-back',
  Latissimus: 'upper-back',
  Rhomboideus: 'upper-back',
  ErectorSpinae: 'lower-back',
  GluteusMaximus: 'glutes',
  Gluteus: 'glutes',
  TensorFasciaeLatae: 'hips',
  Iliopsoas: 'hips',
  HipFlexors: 'hips',
  Quadriceps: 'quads',
  RectusFemoris: 'quads',
  VastusLateralis: 'quads',
  Hamstrings: 'hamstrings',
  BicepsFemoris: 'hamstrings',
  Knee: 'knees',
  Patella: 'knees',
  Gastrocnemius: 'calves',
  Soleus: 'calves',
  TibialisAnterior: 'calves',
  Ankle: 'ankles-feet',
  Foot: 'ankles-feet',
}

/** Resolve a GLTF mesh name to a region id (case-insensitive substring match). */
export function resolveGltfRegion(meshName: string): RegionId | null {
  for (const [key, regionId] of Object.entries(GLTF_MESH_MAP)) {
    if (meshName.toLowerCase().includes(key.toLowerCase())) return regionId
  }
  return null
}
