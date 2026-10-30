'use client'

/**
 * Dumb 3D canvas wrapper. Renders the procedural avatar (or the optional
 * GLTF avatar when NEXT_PUBLIC_AVATAR_MODEL_URL is set) behind a stable props
 * contract. Handles WebGL detection, the hover tooltip and canvas errors.
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { AVATAR_COLORS } from '@/config/theme'
import { DEFAULT_CAMERA, ORBIT_CONFIG, type CameraView } from '@/config/camera'
import { CameraRig } from '@/components/avatar/CameraRig'
import { ProceduralAvatar } from '@/components/avatar/ProceduralAvatar'
import { GltfAvatar } from '@/components/avatar/GltfAvatar'
import { RegionTooltip } from '@/components/avatar/RegionTooltip'
import { WebGLFallback } from '@/components/avatar/WebGLFallback'
import { CanvasErrorBoundary } from '@/components/avatar/CanvasErrorBoundary'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { AvatarCanvasProps } from '@/types'

const MODEL_URL = process.env.NEXT_PUBLIC_AVATAR_MODEL_URL ?? ''

/** WebGL capability detection — falls back to the searchable Region List. */
function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export interface AvatarCanvasPropsWithView extends AvatarCanvasProps {
  /** View request routed from the explorer overlay buttons. */
  viewRequestView: CameraView | 'reset'
  viewRequestId: number
  /** Fallback hook for the WebGL-less path. */
  onOpenRegions: () => void
  showTooltip?: boolean
  muscleOpacity?: number
  skeletonOpacity?: number
  spreadStructures?: number
}

export default function AvatarCanvas({
  selectedRegionId,
  hoveredRegionId,
  regionStyles,
  labelsVisible,
  silhouette,
  interactive = true,
  autoRotate = false,
  onSelect,
  onHover,
  viewRequestView,
  viewRequestId,
  onOpenRegions,
  showTooltip = true,
  muscleOpacity = 100,
  skeletonOpacity = 0,
  spreadStructures = 0,
}: AvatarCanvasPropsWithView) {
  const webglSupported = useMemo(() => detectWebGLSupport(), [])
  const reducedMotion = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    },
    [],
  )

  const handlePointerLeave = useCallback(() => {
    setPointer(null)
    onHover(null)
  }, [onHover])

  if (!webglSupported) {
    return <WebGLFallback onOpenRegions={onOpenRegions} />
  }

  const shouldShowTooltip = showTooltip && interactive && hoveredRegionId !== null && pointer !== null

  return (
    <div
      ref={containerRef}
      className={`atlas-canvas relative h-full w-full ${hoveredRegionId !== null && interactive ? 'cursor-pointer' : 'cursor-grab'}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Interactive 3D muscular body map. Use the region list to select body parts."
    >
      <CanvasErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [...DEFAULT_CAMERA.position], fov: ORBIT_CONFIG.fov, near: ORBIT_CONFIG.near, far: ORBIT_CONFIG.far }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onPointerMissed={() => onHover(null)}
        >
          <hemisphereLight args={[AVATAR_COLORS.hemiSky, AVATAR_COLORS.hemiGround, 1.0]} />
          <directionalLight position={[2.4, 3.2, 2.6]} intensity={1.15} color={AVATAR_COLORS.keyLight} />
          <directionalLight position={[-2.8, 2.2, -2.6]} intensity={0.75} color={AVATAR_COLORS.rimLight} />
          <directionalLight position={[0, 1.4, 4.2]} intensity={0.3} color={AVATAR_COLORS.fillLight} />

          {/* Soft ground disc + contact shadow */}
          <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.15, 48]} />
            <meshStandardMaterial color={AVATAR_COLORS.ground} roughness={0.95} metalness={0} />
          </mesh>
          <ContactShadows
            position={[0, 0.002, 0]}
            opacity={0.55}
            scale={2.4}
            blur={2.6}
            far={1.4}
            resolution={256}
            color="#05070C"
          />

          {MODEL_URL ? (
            <GltfAvatar
              selectedRegionId={selectedRegionId}
              hoveredRegionId={hoveredRegionId}
              regionStyles={regionStyles}
              labelsVisible={labelsVisible}
              silhouette={silhouette}
              interactive={interactive}
              onSelect={onSelect}
              onHover={onHover}
              muscleOpacity={muscleOpacity}
              skeletonOpacity={skeletonOpacity}
              spreadStructures={spreadStructures}
            />
          ) : (
            <ProceduralAvatar
              selectedRegionId={selectedRegionId}
              hoveredRegionId={hoveredRegionId}
              regionStyles={regionStyles}
              labelsVisible={labelsVisible}
              silhouette={silhouette}
              interactive={interactive}
              onSelect={onSelect}
              onHover={onHover}
              muscleOpacity={muscleOpacity}
              skeletonOpacity={skeletonOpacity}
              spreadStructures={spreadStructures}
            />
          )}

          <CameraRig
            selectedRegionId={selectedRegionId}
            viewRequestView={viewRequestView}
            viewRequestId={viewRequestId}
          />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={ORBIT_CONFIG.minDistance}
            maxDistance={ORBIT_CONFIG.maxDistance}
            minPolarAngle={ORBIT_CONFIG.minPolarAngle}
            maxPolarAngle={ORBIT_CONFIG.maxPolarAngle}
            autoRotate={autoRotate && !reducedMotion}
            autoRotateSpeed={ORBIT_CONFIG.autoRotateSpeed}
          />
        </Canvas>
      </CanvasErrorBoundary>
      {shouldShowTooltip && hoveredRegionId !== null && pointer !== null ? (
        <RegionTooltip regionId={hoveredRegionId} x={pointer.x} y={pointer.y} />
      ) : null}
    </div>
  )
}
