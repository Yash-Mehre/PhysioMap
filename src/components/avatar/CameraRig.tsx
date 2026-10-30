'use client'

/**
 * Camera choreography: damped fly-to on region select / view requests, back
 * to the default framing on deselect, interrupted gracefully by user orbiting.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  CAMERA_VIEWS,
  DEFAULT_CAMERA,
  ORBIT_CONFIG,
  REGION_CAMERA_PRESETS,
  type CameraView,
} from '@/config/camera'
import type { RegionId } from '@/types'

export interface CameraRigProps {
  selectedRegionId: RegionId | null
  /** View button request: primitive id triggers repeated clicks of same view. */
  viewRequestView: CameraView | 'reset'
  viewRequestId: number
}

interface Desired {
  position: THREE.Vector3
  target: THREE.Vector3
}

export function CameraRig({ selectedRegionId, viewRequestView, viewRequestId }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as unknown as OrbitControlsImpl | null
  const desiredRef = useRef<Desired | null>(null)

  // Set the initial orbit target once controls exist.
  useEffect(() => {
    if (controls) {
      controls.target.set(...DEFAULT_CAMERA.target)
      controls.update()
    }
  }, [controls])

  // Region selection → fly to the region preset (or back to default framing).
  useEffect(() => {
    const preset = selectedRegionId ? REGION_CAMERA_PRESETS[selectedRegionId] : DEFAULT_CAMERA
    desiredRef.current = {
      position: new THREE.Vector3(...preset.position),
      target: new THREE.Vector3(...preset.target),
    }
  }, [selectedRegionId])

  // View button requests (front/back/left/right/reset).
  useEffect(() => {
    if (viewRequestId === 0) return
    const preset = viewRequestView === 'reset' ? DEFAULT_CAMERA : CAMERA_VIEWS[viewRequestView]
    desiredRef.current = {
      position: new THREE.Vector3(...preset.position),
      target: new THREE.Vector3(...preset.target),
    }
  }, [viewRequestView, viewRequestId])

  // User interaction cancels any in-flight camera animation.
  useEffect(() => {
    if (!controls) return
    const cancel = (): void => {
      desiredRef.current = null
    }
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((_, delta) => {
    const desired = desiredRef.current
    if (!desired || !controls) return
    const t = 1 - Math.exp(-ORBIT_CONFIG.flyDamping * delta)
    camera.position.lerp(desired.position, t)
    controls.target.lerp(desired.target, t)
    controls.update()
    if (
      camera.position.distanceToSquared(desired.position) < 2e-5 &&
      controls.target.distanceToSquared(desired.target) < 2e-5
    ) {
      desiredRef.current = null
    }
  })

  return null
}
