export interface ColorScheme {
  primary: string
  secondary: string
  tertiary: string
}

export interface AudioMetrics {
  bass: number
  mid: number
  high: number
  average: number
  beatIntensity: number
  isBeat: boolean
}

export interface VisualizationContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dataArray: Uint8Array
  bufferLength: number
  metrics: AudioMetrics
  colorScheme: ColorScheme
  colorOffset: number
  rotation: { x: number; y: number; z: number }
  time: number
  getColor: (value: number, offset?: number) => string
}

export type VisualizationMode =
  | 'sphere'
  | 'bars'
  | 'particles'
  | 'helix'
  | 'kaleidoscope'
  | 'tunnel'
  | 'vortex'
  | 'trapnation'
  | 'shockwave'
  | 'nova'
  | 'bassring'
  | 'galaxy'
  | 'neongrid'
  | 'starfield'
  | 'fire'

export interface Visualization {
  name: string
  mode: VisualizationMode
  draw: (context: VisualizationContext) => void
  init?: () => void
  cleanup?: () => void
}

export interface FXEffects {
  enabled: boolean
  bloom: boolean
  chromatic: boolean
  vignette: boolean
  grain: boolean
  colorGrade: boolean
  audioReactive: boolean
}

export interface PostProcessorConfig {
  bloomThreshold: number
  bloomIntensity: number
  bloomRadius: number
  chromaticStrength: number
  vignetteStrength: number
  grainStrength: number
  saturation: number
  contrast: number
}
