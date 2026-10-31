'use client'

/**
 * Camera choreography: damped fly-to on region select / view requests, back
 * to the default framing on deselect, interrupted gracefully by user
 * orbiting. Also owns auto-rotation: the toggle applies whenever no fly-to
 * animation is in progress, and dragging / touching the canvas pauses the
 * rotation until a short grace period after release (zooming never pauses
 * it — the listeners sit on raw pointer events, not wheel).
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useStore, useThree } from '@react-three/fiber'
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
  /** Auto-rotate toggle — a user's explicit click always works, regardless of
   * OS reduced-motion settings (the landing hero computes its own default). */
  autoRotate: boolean
  compactViewport: boolean
}

interface Desired {
  position: THREE.Vector3
  target: THREE.Vector3
}

export function CameraRig({
  selectedRegionId,
  viewRequestView,
  viewRequestId,
  autoRotate,
  compactViewport,
}: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const store = useStore()
  const controls = useThree((state) => state.controls) as unknown as OrbitControlsImpl | null
  const desiredRef = useRef<Desired | null>(null)
  /** Rotation paused while the user drags; resumed after the grace period. */
  const dragPausedRef = useRef(false)
  const resumeTimerRef = useRef<number | null>(null)

  // Set the initial orbit target once controls exist.
  useEffect(() => {
    if (controls) {
      camera.position.set(
        DEFAULT_CAMERA.position[0],
        DEFAULT_CAMERA.position[1],
        compactViewport ? 3.65 : DEFAULT_CAMERA.position[2],
      )
      controls.target.set(...DEFAULT_CAMERA.target)
      controls.update()
    }
  }, [camera, compactViewport, controls])

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

  // Drag / touch pauses auto-rotation and resumes it shortly after release.
  // Raw pointer events (not OrbitControls "start") so wheel-zoom never pauses.
  useEffect(() => {
    const domElement = controls?.domElement
    if (!domElement) return
    const clearResumeTimer = (): void => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }
    }
    const pause = (): void => {
      dragPausedRef.current = true
      clearResumeTimer()
    }
    const scheduleResume = (): void => {
      clearResumeTimer()
      resumeTimerRef.current = window.setTimeout(() => {
        dragPausedRef.current = false
        resumeTimerRef.current = null
      }, ORBIT_CONFIG.autoRotateResumeDelayMs)
    }
    domElement.addEventListener('pointerdown', pause)
    domElement.addEventListener('pointerup', scheduleResume)
    domElement.addEventListener('pointercancel', scheduleResume)
    return () => {
      clearResumeTimer()
      domElement.removeEventListener('pointerdown', pause)
      domElement.removeEventListener('pointerup', scheduleResume)
      domElement.removeEventListener('pointercancel', scheduleResume)
    }
  }, [controls])

  useFrame((_, delta) => {
    // Read controls through the raw store inside the frame loop so this
    // callback can own the imperative autoRotate flag — the declarative
    // OrbitControls JSX intentionally omits it.
    const controls = store.getState().controls as unknown as OrbitControlsImpl | null
    if (!controls) return
    // Rotation applies only when toggled on, no fly-to is running and no
    // drag is in progress.
    const flying = desiredRef.current !== null
    const shouldRotate = autoRotate && !flying && !dragPausedRef.current
    if (controls.autoRotate !== shouldRotate) {
      controls.autoRotate = shouldRotate
    }

    const desired = desiredRef.current
    if (!desired) return
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
