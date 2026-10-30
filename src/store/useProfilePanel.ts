/**
 * Shared profile-panel state: any component can open the ONE profile sheet
 * (mounted in the root providers) in view or edit mode — e.g. the header user
 * icon opens "view", empty-state CTAs open "edit".
 */

import { create } from 'zustand'

export type ProfilePanelMode = 'view' | 'edit'

interface ProfilePanelState {
  open: boolean
  mode: ProfilePanelMode
  openPanel: (mode: ProfilePanelMode) => void
  close: () => void
}

export const useProfilePanel = create<ProfilePanelState>()((set) => ({
  open: false,
  mode: 'view',
  openPanel: (mode) => set({ open: true, mode }),
  close: () => set({ open: false }),
}))
