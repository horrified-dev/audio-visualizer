import type { VisualizationContext, VisualizationMode } from '@/types'

export interface Visualization {
  name: string
  mode: VisualizationMode
  draw: (context: VisualizationContext) => void
  init?: () => void
  cleanup?: () => void
}

export type { VisualizationContext, VisualizationMode }
