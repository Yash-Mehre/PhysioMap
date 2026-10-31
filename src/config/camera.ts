/**
 * Camera presets for the 3D avatar: default framing, orthographic-style view
 * buttons and one close-up preset per region (position, target, best side).
 */

import type { BodySide, RegionId } from '@/config/regions'

export interface CameraPreset {
  position: readonly [number, number, number]
  target: readonly [number, number, number]
  side: BodySide
}

export type CameraView = 'front' | 'back' | 'left' | 'right'

/** Default framing: whole figure, front view. Figure is 1.8 units tall, feet at y=0. */
export const DEFAULT_CAMERA: CameraPreset = {
  position: [0, 1.05, 3.15],
  target: [0, 0.95, 0],
  side: 'front',
}

export const CAMERA_VIEWS: Record<CameraView, CameraPreset> = {
  front: { position: [0, 1.05, 3.15], target: [0, 0.95, 0], side: 'front' },
  back: { position: [0, 1.05, -3.15], target: [0, 0.95, 0], side: 'back' },
  left: { position: [-3.15, 1.05, 0], target: [0, 0.95, 0], side: 'back' },
  right: { position: [3.15, 1.05, 0], target: [0, 0.95, 0], side: 'front' },
}

/** One close-up preset per region — keeps the demo snappy and guided. */
export const REGION_CAMERA_PRESETS: Record<RegionId, CameraPreset> = {
  neck: { position: [0, 1.6, 1.15], target: [0, 1.52, 0], side: 'front' },
  traps: { position: [0, 1.55, -1.35], target: [0, 1.45, 0], side: 'back' },
  shoulders: { position: [0, 1.44, 1.55], target: [0, 1.4, 0], side: 'front' },
  chest: { position: [0, 1.35, 1.55], target: [0, 1.3, 0], side: 'front' },
  biceps: { position: [0.55, 1.32, 1.3], target: [0.2, 1.28, 0], side: 'front' },
  triceps: { position: [0.5, 1.32, -1.3], target: [0.2, 1.26, 0], side: 'back' },
  forearms: { position: [0.5, 1.05, 1.4], target: [0.25, 0.98, 0], side: 'front' },
  elbows: { position: [0.55, 1.16, 1.3], target: [0.25, 1.12, 0], side: 'front' },
  'upper-back': { position: [0, 1.32, -1.55], target: [0, 1.24, 0], side: 'back' },
  abs: { position: [0, 1.12, 1.55], target: [0, 1.08, 0], side: 'front' },
  obliques: { position: [0, 1.05, 1.55], target: [0, 1.02, 0], side: 'front' },
  'lower-back': { position: [0, 1.1, -1.55], target: [0, 1.02, 0], side: 'back' },
  glutes: { position: [0, 0.98, -1.5], target: [0, 0.9, 0], side: 'back' },
  hips: { position: [0, 1.02, 1.5], target: [0, 0.95, 0], side: 'front' },
  quads: { position: [0, 0.78, 1.6], target: [0, 0.7, 0], side: 'front' },
  hamstrings: { position: [0, 0.75, -1.55], target: [0, 0.68, 0], side: 'back' },
  knees: { position: [0, 0.56, 1.5], target: [0, 0.5, 0], side: 'front' },
  calves: { position: [0, 0.42, -1.5], target: [0, 0.32, 0], side: 'back' },
  'ankles-feet': { position: [0, 0.22, 1.5], target: [0, 0.1, 0], side: 'front' },
}

/** OrbitControls constraints shared by every avatar canvas. */
export const ORBIT_CONFIG = {
  fov: 38,
  near: 0.05,
  far: 50,
  minDistance: 0.65,
  maxDistance: 5,
  maxPolarAngle: Math.PI * 0.88,
  minPolarAngle: Math.PI * 0.12,
  /** Auto-rotation speed — 3 = one full 360° turn in ≈ 20 s. */
  autoRotateSpeed: 3,
  /** Grace period (ms) after a drag ends before auto-rotation resumes. */
  autoRotateResumeDelayMs: 1200,
  /** Exponential damping factor for camera fly-to transitions. */
  flyDamping: 4.5,
} as const
