'use client'

import { create } from 'zustand'

interface UIState {
  isPlaying: boolean
  showStartScreen: boolean
  showDeviceModal: boolean
  showModeSelector: boolean
  showFXPanel: boolean
}

interface UIActions {
  togglePlaying: () => void
  setPlaying: (isPlaying: boolean) => void
  hideStartScreen: () => void
  setShowDeviceModal: (show: boolean) => void
  toggleModeSelector: () => void
  toggleFXPanel: () => void
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isPlaying: true,
  showStartScreen: true,
  showDeviceModal: false,
  showModeSelector: true,
  showFXPanel: true,

  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPlaying: (isPlaying) => set({ isPlaying }),

  hideStartScreen: () => set({ showStartScreen: false }),

  setShowDeviceModal: (show) => set({ showDeviceModal: show }),

  toggleModeSelector: () => set((state) => ({ showModeSelector: !state.showModeSelector })),

  toggleFXPanel: () => set((state) => ({ showFXPanel: !state.showFXPanel })),
}))
