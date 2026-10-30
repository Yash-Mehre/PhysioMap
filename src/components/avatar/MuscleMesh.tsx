/** One anatomical mesh rendered from a shape definition + shared material. */

import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { ExpandedMuscleShape } from '@/config/avatar/muscleDefinitions'
import { getSharedGeometry } from '@/components/avatar/geometry'
import type { RegionId } from '@/types'

export interface MuscleMeshProps {
  definition: ExpandedMuscleShape
  material: import('three').MeshStandardMaterial
  interactive: boolean
  onSelect: (regionId: RegionId) => void
  onHover: (regionId: RegionId | null) => void
  opacityMultiplier?: number
  spread?: number
}

function toTuple(value: readonly [number, number, number] | undefined): [number, number, number] | undefined {
  if (!value) return undefined
  return [value[0], value[1], value[2]]
}

export function MuscleMesh({
  definition,
  material,
  interactive,
  onSelect,
  onHover,
  opacityMultiplier = 1,
  spread = 0,
}: MuscleMeshProps) {
  const geometry = getSharedGeometry(definition.shape)
  const regionId = definition.regionId

  const handlers = useMemo(() => {
    if (!interactive || !regionId) return {}
    return {
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onHover(regionId)
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onHover(null)
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelect(regionId)
      },
    }
  }, [interactive, regionId, onSelect, onHover])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={toTuple(definition.position)?.map((value, index, values) => {
        const length = Math.hypot(values[0], values[1], values[2]) || 1
        return value + (values[index] / length) * spread * 0.45
      }) as [number, number, number] | undefined}
      rotation={toTuple(definition.rotation)}
      scale={toTuple(definition.scale)}
      {...handlers}
    />
  )
}
