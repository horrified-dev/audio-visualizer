import type { VisualizationContext, VisualizationMode } from '@/types'

import { drawSphere } from './Sphere'
import { drawBars } from './Bars'
import { drawParticles, initParticles } from './Particles'
import { drawHelix } from './Helix'
import { drawKaleidoscope } from './Kaleidoscope'
import { drawTunnel } from './Tunnel'
import { drawVortex } from './Vortex'
import { drawTrapNation } from './TrapNation'
import { drawShockwave } from './Shockwave'
import { drawNova } from './Nova'
import { drawBassRing } from './BassRing'
import { drawGalaxy, initGalaxy } from './Galaxy'
import { drawNeonGrid } from './NeonGrid'
import { drawStarfield, initStarfield } from './Starfield'
import { drawFire } from './Fire'

export interface ModeInfo {
  mode: VisualizationMode
  name: string
  category: 'base' | 'geometric' | 'reactive' | 'environment' | 'organic'
  draw: (context: VisualizationContext) => void
  init?: (bufferLength?: number) => void
}

export const visualizationModes: ModeInfo[] = [
  { mode: 'sphere', name: 'Sphere', category: 'base', draw: drawSphere },
  { mode: 'bars', name: 'Bars', category: 'base', draw: drawBars },
  { mode: 'particles', name: 'Particles', category: 'base', draw: drawParticles, init: initParticles },
  { mode: 'helix', name: 'Helix', category: 'geometric', draw: drawHelix },
  { mode: 'kaleidoscope', name: 'Kaleidoscope', category: 'geometric', draw: drawKaleidoscope },
  { mode: 'tunnel', name: 'Tunnel', category: 'geometric', draw: drawTunnel },
  { mode: 'vortex', name: 'Vortex', category: 'geometric', draw: drawVortex },
  { mode: 'trapnation', name: 'Trap Nation', category: 'reactive', draw: drawTrapNation },
  { mode: 'shockwave', name: 'Shockwave', category: 'reactive', draw: drawShockwave },
  { mode: 'nova', name: 'Nova', category: 'reactive', draw: drawNova },
  { mode: 'bassring', name: 'Bass Ring', category: 'reactive', draw: drawBassRing },
  { mode: 'galaxy', name: 'Galaxy', category: 'environment', draw: drawGalaxy, init: initGalaxy },
  { mode: 'neongrid', name: 'Neon Grid', category: 'environment', draw: drawNeonGrid },
  { mode: 'starfield', name: 'Starfield', category: 'environment', draw: drawStarfield, init: initStarfield },
  { mode: 'fire', name: 'Fire', category: 'organic', draw: drawFire },
]

export const modeMap = new Map(visualizationModes.map(m => [m.mode, m]))

export function getVisualization(mode: VisualizationMode): ModeInfo | undefined {
  return modeMap.get(mode)
}

export function drawVisualization(mode: VisualizationMode, context: VisualizationContext): void {
  const visualization = modeMap.get(mode)
  if (visualization) {
    visualization.draw(context)
  }
}
