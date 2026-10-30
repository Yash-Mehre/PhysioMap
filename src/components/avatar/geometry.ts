/**
 * Geometry factories for the procedural avatar. Geometries are cached by
 * shape parameters and shared across meshes; `disposeGeometryCache()` is
 * called when the avatar unmounts. Also hosts the procedural muscle-fiber
 * bump texture (canvas-generated — no external assets).
 */

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import type { MuscleShape } from '@/config/avatar/muscleDefinitions'

const geometryCache = new Map<string, THREE.BufferGeometry>()

function cacheKey(shape: MuscleShape): string {
  switch (shape.kind) {
    case 'capsule':
      return `capsule:${shape.radius}:${shape.length}`
    case 'ellipsoid':
      return `ellipsoid:${shape.size.join(',')}`
    case 'roundedBox':
      return `roundedBox:${shape.size.join(',')}:${shape.radius}`
    case 'lathe':
      return `lathe:${shape.profile.map((point) => point.join(',')).join(';')}`
  }
}

function createGeometry(shape: MuscleShape): THREE.BufferGeometry {
  switch (shape.kind) {
    case 'capsule':
      return new THREE.CapsuleGeometry(shape.radius, shape.length, 6, 20)
    case 'ellipsoid': {
      const geometry = new THREE.SphereGeometry(1, 24, 18)
      geometry.scale(shape.size[0], shape.size[1], shape.size[2])
      return geometry
    }
    case 'roundedBox':
      return new RoundedBoxGeometry(shape.size[0], shape.size[1], shape.size[2], 3, shape.radius)
    case 'lathe': {
      const points = shape.profile.map(([radius, y]) => new THREE.Vector2(radius, y))
      return new THREE.LatheGeometry(points, 28)
    }
  }
}

/** Shared, cached geometry for a shape definition. */
export function getSharedGeometry(shape: MuscleShape): THREE.BufferGeometry {
  const key = cacheKey(shape)
  let geometry = geometryCache.get(key)
  if (!geometry) {
    geometry = createGeometry(shape)
    geometryCache.set(key, geometry)
  }
  return geometry
}

/** Dispose every cached geometry (called on avatar unmount). */
export function disposeGeometryCache(): void {
  for (const geometry of geometryCache.values()) geometry.dispose()
  geometryCache.clear()
}

let fiberTexture: THREE.CanvasTexture | null = null

/**
 * Procedural muscle-fiber bump texture: subtle horizontal streaks drawn on a
 * canvas, used as a bumpMap on the muscle material for organic detail.
 */
export function getFiberBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (fiberTexture) return fiberTexture

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  context.fillStyle = '#808080'
  context.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1100; i += 1) {
    const isLight = Math.random() > 0.5
    context.fillStyle = isLight
      ? `rgba(255,255,255,${(Math.random() * 0.14).toFixed(3)})`
      : `rgba(0,0,0,${(Math.random() * 0.14).toFixed(3)})`
    const y = Math.random() * 256
    const width = 20 + Math.random() * 70
    context.fillRect(Math.random() * 256 - 10, y, width, 0.8 + Math.random() * 1.6)
  }

  fiberTexture = new THREE.CanvasTexture(canvas)
  fiberTexture.wrapS = THREE.RepeatWrapping
  fiberTexture.wrapT = THREE.RepeatWrapping
  fiberTexture.repeat.set(2, 2)
  return fiberTexture
}

/** Dispose the singleton fiber texture (avatar unmount). */
export function disposeFiberTexture(): void {
  fiberTexture?.dispose()
  fiberTexture = null
}
