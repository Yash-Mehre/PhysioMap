/**
 * Explorer UI state (NOT persisted): mode, selection, camera requests and the
 * Info-mode layer toggles. Selectors only — components never hold store logic.
 */

import { create } from 'zustand'
import type { AppMode, RegionId } from '@/types'
import type { CameraView } from '@/config/camera'

export interface ExerciseHighlight {
  exerciseId: string | null
  /** Strongly highlighted region (e.g. the primary muscle of a hovered exercise). */
  primaryRegionId: RegionId | null
  /** Softly highlighted regions (secondary muscles, synergists, workout preview). */
  secondaryRegionIds: RegionId[]
  /** Amber-highlighted regions (antagonists in Muscle Science). */
  antagonistRegionIds: RegionId[]
}

interface ExplorerState {
  mode: AppMode
  selectedRegionId: RegionId | null
  hoveredRegionId: RegionId | null
  cameraView: CameraView | 'free'
  /** Incremented on every view request so repeated clicks still fire effects. */
  cameraRequestId: number
  labelsVisible: boolean
  isolate: boolean
  silhouette: boolean
  autoRotate: boolean
  regionsDrawerOpen: boolean
  exerciseHighlight: ExerciseHighlight
  workoutPreview: boolean
  muscleOpacity: number
  skeletonOpacity: number
  spreadStructures: number

  setMode: (mode: AppMode) => void
  selectRegion: (regionId: RegionId | null) => void
  setHoveredRegion: (regionId: RegionId | null) => void
  requestCameraView: (view: CameraView | 'reset') => void
  toggleLabels: () => void
  toggleIsolate: () => void
  toggleSilhouette: () => void
  setAutoRotate: (value: boolean) => void
  setRegionsDrawerOpen: (value: boolean) => void
  setExerciseHighlight: (highlight: ExerciseHighlight) => void
  clearExerciseHighlight: () => void
  setWorkoutPreview: (value: boolean) => void
  setLayerOpacity: (layer: 'muscle' | 'skeleton', value: number) => void
  setSpreadStructures: (value: number) => void
}

const EMPTY_HIGHLIGHT: ExerciseHighlight = {
  exerciseId: null,
  primaryRegionId: null,
  secondaryRegionIds: [],
  antagonistRegionIds: [],
}

export const useExplorerStore = create<ExplorerState>()((set) => ({
  mode: 'build',
  selectedRegionId: null,
  hoveredRegionId: null,
  cameraView: 'front',
  cameraRequestId: 0,
  labelsVisible: false,
  isolate: false,
  silhouette: false,
  autoRotate: false,
  regionsDrawerOpen: false,
  exerciseHighlight: EMPTY_HIGHLIGHT,
  workoutPreview: false,
  muscleOpacity: 100,
  skeletonOpacity: 100,
  spreadStructures: 0,

  setMode: (mode) => set({ mode }),
  // Switching mode KEEPS the selected region — "same body part, three modes".
  selectRegion: (regionId) => set({ selectedRegionId: regionId }),
  setHoveredRegion: (regionId) => set({ hoveredRegionId: regionId }),
  requestCameraView: (view) =>
    set((state) => ({
      cameraView: view === 'reset' ? 'front' : view,
      cameraRequestId: state.cameraRequestId + 1,
    })),
  toggleLabels: () => set((state) => ({ labelsVisible: !state.labelsVisible })),
  toggleIsolate: () => set((state) => ({ isolate: !state.isolate })),
  toggleSilhouette: () => set((state) => ({ silhouette: !state.silhouette })),
  setAutoRotate: (value) => set({ autoRotate: value }),
  setRegionsDrawerOpen: (value) => set({ regionsDrawerOpen: value }),
  setExerciseHighlight: (highlight) => set({ exerciseHighlight: highlight }),
  clearExerciseHighlight: () => set({ exerciseHighlight: EMPTY_HIGHLIGHT }),
  setWorkoutPreview: (value) => set({ workoutPreview: value }),
  setLayerOpacity: (layer, value) =>
    set({
      [layer === 'muscle' ? 'muscleOpacity' : 'skeletonOpacity']:
        Math.max(0, Math.min(100, value)),
    }),
  setSpreadStructures: (value) => set({ spreadStructures: Math.max(0, Math.min(100, value)) }),
}))

/** Selector helpers (stable references). */
export const selectMode = (state: ExplorerState): AppMode => state.mode
export const selectSelectedRegionId = (state: ExplorerState): RegionId | null => state.selectedRegionId
