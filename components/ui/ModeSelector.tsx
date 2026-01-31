'use client'

import { useVisualizerStore } from '@/store/visualizerStore'
import { useUIStore } from '@/store/uiStore'
import { visualizationModes } from '@/visualizations'
import type { VisualizationMode } from '@/types'
import {
  Circle,
  BarChart3,
  Sparkles,
  Dna,
  Hexagon,
  CircleDot,
  Waves,
  Radio,
  Target,
  Sun,
  Disc,
  Orbit,
  Grid3X3,
  Star,
  Flame,
} from 'lucide-react'

const modeIcons: Record<VisualizationMode, typeof Circle> = {
  sphere: Circle,
  bars: BarChart3,
  particles: Sparkles,
  helix: Dna,
  kaleidoscope: Hexagon,
  tunnel: CircleDot,
  vortex: Waves,
  trapnation: Radio,
  shockwave: Target,
  nova: Sun,
  bassring: Disc,
  galaxy: Orbit,
  neongrid: Grid3X3,
  starfield: Star,
  fire: Flame,
}

export function ModeSelector() {
  const { currentMode, setMode } = useVisualizerStore()
  const { showModeSelector } = useUIStore()

  if (!showModeSelector) return null

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 max-h-[70vh] bg-surface-1/80 border border-surface-4 rounded-lg backdrop-blur-sm flex flex-col pointer-events-auto">
      <div className="flex flex-col gap-0.5 overflow-y-auto p-2 scrollbar-thin">
        {visualizationModes.map(mode => {
          const Icon = modeIcons[mode.mode]
          const isActive = currentMode === mode.mode

          return (
            <button
              key={mode.mode}
              onClick={() => setMode(mode.mode)}
              title={mode.name}
              className={`w-9 h-9 flex items-center justify-center rounded transition-colors relative group ${
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-3'
              }`}
            >
              <Icon size={18} />
              <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-surface-2 border border-surface-4 px-2 py-1 text-xs text-text-secondary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity rounded">
                {mode.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
