/** Floating region name labels (Info-mode "Label all" layer). */

import { Html } from '@react-three/drei'
import { REGION_BY_ID } from '@/config/regions'
import type { RegionId } from '@/types'

export interface RegionLabelsProps {
  anchors: Record<RegionId, [number, number, number]>
  labelsVisible: boolean
}

export function RegionLabels({ anchors, labelsVisible }: RegionLabelsProps) {
  if (!labelsVisible) return null
  return (
    <>
      {(Object.keys(anchors) as RegionId[]).map((regionId) => (
        <Html
          key={regionId}
          position={anchors[regionId]}
          center
          zIndexRange={[30, 10]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="pm-region-label">{REGION_BY_ID[regionId].label}</span>
        </Html>
      ))}
    </>
  )
}
