'use client'

import { create } from 'zustand'
import type { FXEffects, PostProcessorConfig } from '@/types'

interface FXState extends FXEffects {
  config: PostProcessorConfig
}

interface FXActions {
  setEnabled: (enabled: boolean) => void
  toggleEffect: (effect: keyof Omit<FXEffects, 'enabled'>) => void
  updateConfig: (config: Partial<PostProcessorConfig>) => void
}

export const useFXStore = create<FXState & FXActions>((set) => ({
  enabled: true,
  bloom: true,
  chromatic: true,
  vignette: true,
  grain: true,
  colorGrade: true,
  audioReactive: true,

  config: {
    bloomThreshold: 0.6,
    bloomIntensity: 0.8,
    bloomRadius: 4,
    chromaticStrength: 0.003,
    vignetteStrength: 0.4,
    grainStrength: 0.08,
    saturation: 1.15,
    contrast: 1.1,
  },

  setEnabled: (enabled) => set({ enabled }),

  toggleEffect: (effect) => set((state) => ({ [effect]: !state[effect] })),

  updateConfig: (config) => set((state) => ({
    config: { ...state.config, ...config },
  })),
}))
