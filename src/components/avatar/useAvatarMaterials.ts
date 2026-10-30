/**
 * Shared avatar material management: per-(region, kind) materials created
 * lazily during render, disposed on unmount, with imperative visual-state
 * application (avoids re-rendering ~70 meshes on every hover change).
 */

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { MuscleMaterialKind } from '@/config/avatar/muscleDefinitions'
import { AVATAR_COLORS } from '@/config/theme'
import { getFiberBumpTexture } from '@/components/avatar/geometry'
import type { RegionId, RegionVisualState } from '@/types'

export const KIND_BASE_COLORS: Record<MuscleMaterialKind | 'bone', string> = {
  muscle: AVATAR_COLORS.muscle,
  tendon: AVATAR_COLORS.tendon,
  'underlay-muscle': AVATAR_COLORS.underlayMuscle,
  'underlay-grey': AVATAR_COLORS.underlayGrey,
  bone: '#d8d0bb',
}

const TINT_MIX = 0.55
const tmpColor = new THREE.Color()
const tintColor = new THREE.Color()

function createBaseMaterial(kind: MuscleMaterialKind | 'bone'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: KIND_BASE_COLORS[kind],
    roughness: kind === 'bone' ? 0.88 : kind === 'muscle' ? 0.48 : kind === 'tendon' ? 0.6 : 0.78,
    metalness: kind === 'bone' ? 0.02 : 0.04,
  })
  if (kind === 'muscle') {
    material.bumpMap = getFiberBumpTexture()
    material.bumpScale = 0.02
  }
  if (kind === 'bone') {
    material.bumpMap = getFiberBumpTexture()
    material.bumpScale = 0.035
  }
  // Region materials fade for isolate/silhouette; underlay stays opaque.
  material.transparent = kind === 'muscle' || kind === 'tendon'
  return material
}

export interface AvatarMaterialFactory {
  /** Get (lazily creating) the shared material for a region + material kind. */
  get: (regionId: RegionId | null, kind: MuscleMaterialKind | 'bone') => THREE.MeshStandardMaterial
  /** All materials created so far (key: `${regionId}:${kind}` or `underlay:${kind}`). */
  entries: () => ReadonlyMap<string, THREE.MeshStandardMaterial>
}

/** Hook: create a material factory; dispose everything on unmount. */
export function useAvatarMaterialFactory(): AvatarMaterialFactory {
  const factory = useMemo<AvatarMaterialFactory>(() => {
    const materials = new Map<string, THREE.MeshStandardMaterial>()
    return {
      get: (regionId, kind) => {
        const key = regionId ? `${regionId}:${kind}` : `underlay:${kind}`
        let material = materials.get(key)
        if (!material) {
          material = createBaseMaterial(kind)
          materials.set(key, material)
        }
        return material
      },
      entries: () => materials,
    }
  }, [])

  useEffect(() => {
    return () => {
      for (const material of factory.entries().values()) material.dispose()
    }
  }, [factory])

  return factory
}

export interface VisualStateApplication {
  /** Materials that should pulse: material → base emissive intensity. */
  pulsing: Map<THREE.MeshStandardMaterial, number>
  /** Regions currently requesting an outline shell. */
  outlinedRegionIds: RegionId[]
}

/**
 * Push region visual states into the shared materials imperatively.
 * Also syncs the single outline material's color to the outlined region.
 */
export function applyRegionVisualStates(
  materials: ReadonlyMap<string, THREE.MeshStandardMaterial>,
  regionStyles: Record<RegionId, RegionVisualState>,
  outlineMaterial: THREE.MeshBasicMaterial,
  opacityMultiplier = 1,
): VisualStateApplication {
  const pulsing = new Map<THREE.MeshStandardMaterial, number>()
  const outlinedRegionIds: RegionId[] = []
  let outlineColor: string | null = null

  for (const [key, material] of materials) {
    if (key.startsWith('underlay:')) continue
    const separator = key.indexOf(':')
    const regionId = key.slice(0, separator) as RegionId
    const kind = key.slice(separator + 1) as MuscleMaterialKind | 'bone'
    const state = regionStyles[regionId]
    if (!state) continue

    tmpColor.set(KIND_BASE_COLORS[kind])
    if (state.tint) {
      tintColor.set(state.tint)
      tmpColor.lerp(tintColor, TINT_MIX)
    }
    material.color.copy(tmpColor)
    material.emissive.set(state.emissive)
    material.emissiveIntensity = state.emissiveIntensity
    material.opacity = state.opacity * opacityMultiplier

    if (state.pulse && state.emissiveIntensity > 0) {
      pulsing.set(material, state.emissiveIntensity)
    }
    if (state.outline) {
      outlinedRegionIds.push(regionId)
      outlineColor = state.emissive
    }
  }

  if (outlineColor) outlineMaterial.color.set(outlineColor)
  return { pulsing, outlinedRegionIds }
}

/**
 * Animate pulsing materials. Module-scope mutation kernel — three.js objects
 * are mutable by design; keeping mutations here keeps components React-pure.
 */
export function applyPulse(
  pulsing: ReadonlyMap<THREE.MeshStandardMaterial, number>,
  factor: number,
): void {
  for (const [material, base] of pulsing) {
    material.emissiveIntensity = base * factor
  }
}
