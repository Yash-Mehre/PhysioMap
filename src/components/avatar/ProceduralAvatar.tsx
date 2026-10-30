'use client'

/**
 * The procedural anatomical avatar. Data-driven from
 * `@/config/avatar/muscleDefinitions`: every mesh definition becomes a shared
 * geometry + per-region material. Visual states are pushed imperatively so
 * hovering never re-renders the mesh tree; pulsing regions animate in useFrame.
 */

import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  MUSCLE_DEFINITIONS,
  computeRegionAnchors,
  expandMuscleDefinitions,
  type ExpandedMuscleShape,
} from '@/config/avatar/muscleDefinitions'
import { REGION_IDS } from '@/config/regions'
import { MuscleMesh } from '@/components/avatar/MuscleMesh'
import { RegionLabels } from '@/components/avatar/RegionLabels'
import {
  applyPulse,
  applyRegionVisualStates,
  useAvatarMaterialFactory,
} from '@/components/avatar/useAvatarMaterials'
import { disposeFiberTexture, disposeGeometryCache, getSharedGeometry } from '@/components/avatar/geometry'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { RegionId, RegionVisualState } from '@/types'

/** Module-level expansion: runs once, not per mount. */
const EXPANDED_DEFS = expandMuscleDefinitions(MUSCLE_DEFINITIONS)

const DEFS_BY_REGION = new Map<RegionId, ExpandedMuscleShape[]>()
for (const definition of EXPANDED_DEFS) {
  if (!definition.regionId) continue
  const list = DEFS_BY_REGION.get(definition.regionId) ?? []
  list.push(definition)
  DEFS_BY_REGION.set(definition.regionId, list)
}

export const REGION_ANCHORS = computeRegionAnchors(MUSCLE_DEFINITIONS)

const OUTLINE_SCALE = 1.05
const UNIFORM_OUTLINE: [number, number, number] = [OUTLINE_SCALE, OUTLINE_SCALE, OUTLINE_SCALE]

export interface ProceduralAvatarProps {
  selectedRegionId: RegionId | null
  hoveredRegionId: RegionId | null
  regionStyles: Record<RegionId, RegionVisualState>
  labelsVisible: boolean
  silhouette: boolean
  interactive: boolean
  onSelect: (regionId: RegionId) => void
  onHover: (regionId: RegionId | null) => void
  muscleOpacity: number
  organOpacity: number
  skeletonOpacity: number
  spreadStructures: number
}

function toTuple(value: readonly [number, number, number] | undefined): [number, number, number] | undefined {
  if (!value) return undefined
  return [value[0], value[1], value[2]]
}

function toScaledTuple(
  value: readonly [number, number, number] | undefined,
  factor: number,
): [number, number, number] {
  if (!value) return [factor, factor, factor]
  return [value[0] * factor, value[1] * factor, value[2] * factor]
}

export const ProceduralAvatar = memo(function ProceduralAvatar({
  hoveredRegionId,
  regionStyles,
  labelsVisible,
  silhouette,
  interactive,
  onSelect,
  onHover,
  muscleOpacity,
  organOpacity,
  skeletonOpacity,
  spreadStructures,
}: ProceduralAvatarProps) {
  const factory = useAvatarMaterialFactory()
  const reducedMotion = usePrefersReducedMotion()

  const outlineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#3B74F2',
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    [],
  )
  useEffect(() => () => outlineMaterial.dispose(), [outlineMaterial])

  // Shared geometries + fiber texture live for the avatar's lifetime.
  useEffect(() => {
    return () => {
      disposeGeometryCache()
      disposeFiberTexture()
    }
  }, [])

  /** Mesh tree is memoized: hover/visual changes never re-render it. */
  const meshTree = useMemo(() => {
    const underlay = EXPANDED_DEFS.filter((definition) => !definition.regionId).map((definition) => (
      <MuscleMesh
        key={definition.expandedId}
        definition={definition}
        material={factory.get(null, definition.material ?? 'underlay-muscle')}
        interactive={false}
        onSelect={onSelect}
        onHover={onHover}
        opacityMultiplier={muscleOpacity / 100}
        spread={spreadStructures / 100}
      />
    ))

    const regions = REGION_IDS.map((regionId) => {
      const definitions = DEFS_BY_REGION.get(regionId)
      if (!definitions || definitions.length === 0) return null
      return (
        <group
          key={regionId}
          visible={!silhouette}
          position={[0, 0, 0]}
        >
          {definitions.map((definition) => (
            <MuscleMesh
              key={definition.expandedId}
              definition={definition}
              material={factory.get(regionId, definition.material ?? 'muscle')}
              interactive={interactive}
              onSelect={onSelect}
              onHover={onHover}
              opacityMultiplier={muscleOpacity / 100}
              spread={spreadStructures / 100}
            />
          ))}
        </group>
      )
    })

    return (
      <>
        {underlay}
        {regions}
      </>
    )
  }, [factory, interactive, onSelect, onHover, silhouette, muscleOpacity, organOpacity, skeletonOpacity, spreadStructures])

  const pulsingRef = useRef<Map<THREE.MeshStandardMaterial, number>>(new Map())

  // Push visual states into materials imperatively.
  useEffect(() => {
    const { pulsing } = applyRegionVisualStates(
      factory.entries(),
      regionStyles,
      outlineMaterial,
      muscleOpacity / 100,
    )
    pulsingRef.current = pulsing
  }, [factory, regionStyles, outlineMaterial, muscleOpacity])

  // Outline shells for outlined regions (usually just the selected one).
  const outlineShells = useMemo(() => {
    const outlined = REGION_IDS.filter((regionId) => regionStyles[regionId]?.outline)
    return outlined.flatMap((regionId) =>
      (DEFS_BY_REGION.get(regionId) ?? []).map((definition, index) => (
        <mesh
          key={`${regionId}-shell-${index}`}
          geometry={getSharedGeometry(definition.shape)}
          material={outlineMaterial}
          position={toTuple(definition.position)}
          rotation={toTuple(definition.rotation)}
          scale={toScaledTuple(definition.scale, OUTLINE_SCALE) ?? UNIFORM_OUTLINE}
        />
      )),
    )
  }, [regionStyles, outlineMaterial])

  useFrame(({ clock }) => {
    const pulsing = pulsingRef.current
    if (pulsing.size === 0) return
    const factor = reducedMotion ? 1 : 0.72 + 0.28 * Math.sin(clock.elapsedTime * 3)
    applyPulse(pulsing, factor)
  })

  // Hovered/selected ids are applied via regionStyles (materials above);
  // they are read here only to honour the props contract.
  void hoveredRegionId

  return (
    <group>
      {meshTree}
      {outlineShells}
      <RegionLabels anchors={REGION_ANCHORS} labelsVisible={labelsVisible} />
    </group>
  )
})
