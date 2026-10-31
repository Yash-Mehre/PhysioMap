'use client'

/**
 * Optional GLTF anatomy avatar (used when NEXT_PUBLIC_AVATAR_MODEL_URL is set).
 * Maps model mesh names to regions via `@/config/avatar/meshMap` and satisfies
 * the same presentational contract as the procedural avatar.
 */

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { resolveGltfRegion } from '@/config/avatar/meshMap'
import { REGION_IDS } from '@/config/regions'
import { RegionLabels } from '@/components/avatar/RegionLabels'
import { applyPulse, applyRegionVisualStates, useAvatarMaterialFactory } from '@/components/avatar/useAvatarMaterials'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { RegionId, RegionVisualState } from '@/types'

const OUTLINE_SCALE = 1.04

/**
 * Silhouette toggle — module-scope mutation kernel so the component stays
 * React-pure (three.js objects are mutable by design).
 */
function applySilhouette(
  meshesByRegion: ReadonlyMap<RegionId, THREE.Mesh[]>,
  silhouette: boolean,
  regionStyles: Record<RegionId, RegionVisualState>,
): void {
  for (const [regionId, meshes] of meshesByRegion) {
    const keepVisible = !silhouette || regionStyles[regionId]?.outline === true
    for (const mesh of meshes) mesh.visible = keepVisible
  }
}

export interface GltfAvatarProps {
  selectedRegionId: RegionId | null
  hoveredRegionId: RegionId | null
  regionStyles: Record<RegionId, RegionVisualState>
  labelsVisible: boolean
  silhouette: boolean
  interactive: boolean
  onSelect: (regionId: RegionId) => void
  onHover: (regionId: RegionId | null) => void
  muscleOpacity: number
  skeletonOpacity: number
  spreadStructures: number
}

export function GltfAvatar({
  hoveredRegionId,
  regionStyles,
  labelsVisible,
  silhouette,
  interactive,
  onSelect,
  onHover,
  muscleOpacity,
  skeletonOpacity,
  spreadStructures,
}: GltfAvatarProps) {
  const url = process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || '/model/anatomy.glb'
  const { scene } = useGLTF(url)
  const factory = useAvatarMaterialFactory()
  const reducedMotion = usePrefersReducedMotion()
  void muscleOpacity
  void skeletonOpacity
  void spreadStructures

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

  const prepared = useMemo(() => {
    const clone = scene.clone(true)
    const meshesByRegion = new Map<RegionId, THREE.Mesh[]>()
    const anchors: Partial<Record<RegionId, [number, number, number]>> = {}

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      const regionId = resolveGltfRegion(object.name)
      if (!regionId) {
        const isBone = /bone|skeleton|skull|rib|vertebra|spine|femur|tibia|humerus/i.test(object.name)
        object.material = factory.get(null, isBone ? 'bone' : 'underlay-muscle')
        object.userData.regionId = null
        return
      }
      object.material = factory.get(regionId, 'muscle')
      object.userData.regionId = regionId
      const list = meshesByRegion.get(regionId) ?? []
      list.push(object)
      meshesByRegion.set(regionId, list)
    })

    clone.updateMatrixWorld(true)
    for (const [regionId, meshes] of meshesByRegion) {
      const box = new THREE.Box3()
      for (const mesh of meshes) box.expandByObject(mesh)
      const center = box.getCenter(new THREE.Vector3())
      anchors[regionId] = [center.x, center.y, center.z]
    }

    return { scene: clone, meshesByRegion, anchors: anchors as Record<RegionId, [number, number, number]> }
  }, [scene, factory])

  // Apply visual states + silhouette imperatively (mutation kernel in module scope).
  useEffect(() => {
    applyRegionVisualStates(factory.entries(), regionStyles, outlineMaterial, muscleOpacity / 100)
    applySilhouette(prepared.meshesByRegion, silhouette, regionStyles)
    prepared.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      const material = object.material as THREE.Material
      const name = object.name.toLowerCase()
      const layerOpacity = name.includes('skeleton') || name.includes('bone') || name.includes('skull') ||
        name.includes('rib') || name.includes('vertebra') || name.includes('spine') ||
        name.includes('femur') || name.includes('tibia') || name.includes('humerus')
        ? skeletonOpacity / 100
        : muscleOpacity / 100
      material.transparent = layerOpacity < 1
      material.opacity = layerOpacity
      const basePosition =
        (object.userData.basePosition as THREE.Vector3 | undefined) ??
        object.position.clone()
      object.userData.basePosition = basePosition
      const direction = basePosition.clone().normalize()
      object.position.copy(basePosition).addScaledVector(direction, (spreadStructures / 100) * 0.45)
    })
  }, [
    factory,
    regionStyles,
    outlineMaterial,
    prepared,
    silhouette,
    muscleOpacity,
    skeletonOpacity,
    spreadStructures,
  ])

  const pulsingRef = useRef<Map<THREE.MeshStandardMaterial, number>>(new Map())
  useEffect(() => {
    const { pulsing } = applyRegionVisualStates(
      factory.entries(),
      regionStyles,
      outlineMaterial,
      muscleOpacity / 100,
    )
    pulsingRef.current = pulsing
  }, [factory, regionStyles, outlineMaterial, muscleOpacity])

  useFrame(({ clock }) => {
    const pulsing = pulsingRef.current
    if (pulsing.size === 0) return
    const factor = reducedMotion ? 1 : 0.72 + 0.28 * Math.sin(clock.elapsedTime * 3)
    applyPulse(pulsing, factor)
  })

  const handlePointerOver = (event: ThreeEvent<PointerEvent>): void => {
    if (!interactive) return
    event.stopPropagation()
    const regionId = event.intersections[0]?.object.userData.regionId as RegionId | null
    if (regionId) onHover(regionId)
  }
  const handlePointerOut = (): void => {
    if (interactive) onHover(null)
  }
  const handleClick = (event: ThreeEvent<MouseEvent>): void => {
    if (!interactive) return
    event.stopPropagation()
    const regionId = event.intersections[0]?.object.userData.regionId as RegionId | null
    if (regionId) onSelect(regionId)
  }

  // Selected-region outline shells.
  const outlinedRegions = REGION_IDS.filter((regionId) => regionStyles[regionId]?.outline)
  void hoveredRegionId

  return (
    <group>
      <primitive
        object={prepared.scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      {outlinedRegions.map((regionId) => (
        <group key={`${regionId}-shells`} scale={OUTLINE_SCALE}>
          {(prepared.meshesByRegion.get(regionId) ?? []).map((mesh, index) => (
            <mesh
              key={`${regionId}-shell-${index}`}
              geometry={mesh.geometry}
              material={outlineMaterial}
              position={mesh.getWorldPosition(new THREE.Vector3())}
              quaternion={mesh.getWorldQuaternion(new THREE.Quaternion())}
              scale={mesh.getWorldScale(new THREE.Vector3())}
            />
          ))}
        </group>
      ))}
      <RegionLabels anchors={prepared.anchors} labelsVisible={labelsVisible} />
    </group>
  )
}
