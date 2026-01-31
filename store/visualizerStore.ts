'use client'

import { create } from 'zustand'
import type { VisualizationMode, ColorScheme } from '@/types'
import { COLOR_SCHEMES } from '@/lib/utils/colors'

interface VisualizerState {
  currentMode: VisualizationMode
  colorSchemeIndex: number
  colorScheme: ColorScheme
  colorOffset: number
  rotation: { x: number; y: number; z: number }
}

interface VisualizerActions {
  setMode: (mode: VisualizationMode) => void
  nextColorScheme: () => void
  updateRotation: (deltaTime: number) => void
  incrementColorOffset: () => void
}

export const useVisualizerStore = create<VisualizerState & VisualizerActions>((set, get) => ({
  currentMode: 'trapnation',
  colorSchemeIndex: 0,
  colorScheme: COLOR_SCHEMES[0],
  colorOffset: 0,
  rotation: { x: 0, y: 0, z: 0 },

  setMode: (mode) => set({ currentMode: mode }),

  nextColorScheme: () => {
    const { colorSchemeIndex } = get()
    const newIndex = (colorSchemeIndex + 1) % COLOR_SCHEMES.length
    set({
      colorSchemeIndex: newIndex,
      colorScheme: COLOR_SCHEMES[newIndex],
    })
  },

  updateRotation: (currentTime) => {
    set({
      rotation: {
        x: Math.sin(currentTime * 0.0003) * 0.3,
        y: get().rotation.y + 0.003,
        z: 0,
      },
    })
  },

  incrementColorOffset: () => {
    set(state => ({ colorOffset: state.colorOffset + 0.2 }))
  },
}))
