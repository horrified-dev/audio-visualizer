'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useAudioStore } from '@/store/audioStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import { useUIStore } from '@/store/uiStore'
import { useFXStore } from '@/store/fxStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { drawVisualization } from '@/visualizations'
import { PostProcessor } from '@/lib/postprocessor'
import { getColor } from '@/lib/utils/colors'
import type { VisualizationContext } from '@/types'

export function VisualizerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const postCanvasRef = useRef<HTMLCanvasElement>(null)
  const postProcessorRef = useRef<PostProcessor | null>(null)

  const initAudio = useAudioStore(state => state.initAudio)

  // Initialize audio store
  useEffect(() => {
    initAudio()
  }, [initAudio])

  // Initialize post-processor
  useEffect(() => {
    if (canvasRef.current && postCanvasRef.current) {
      const pp = new PostProcessor()
      pp.init(canvasRef.current, postCanvasRef.current)
      postProcessorRef.current = pp

      return () => {
        pp.destroy()
      }
    }
  }, [])

  // Sync FX settings to post-processor
  useEffect(() => {
    const unsub = useFXStore.subscribe((state) => {
      if (postProcessorRef.current) {
        postProcessorRef.current.effects.enabled = state.enabled
        postProcessorRef.current.effects.bloom = state.bloom
        postProcessorRef.current.effects.chromatic = state.chromatic
        postProcessorRef.current.effects.vignette = state.vignette
        postProcessorRef.current.effects.grain = state.grain
        postProcessorRef.current.effects.colorGrade = state.colorGrade
        postProcessorRef.current.effects.audioReactive = state.audioReactive
      }
    })
    return unsub
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && postCanvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        postCanvasRef.current.width = window.innerWidth
        postCanvasRef.current.height = window.innerHeight
        postProcessorRef.current?.resize()
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Animation frame callback - get fresh state from stores each frame
  const onFrame = useCallback((time: number) => {
    const uiState = useUIStore.getState()
    if (!uiState.isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return

    // Get fresh state from stores
    const audioState = useAudioStore.getState()
    const vizState = useVisualizerStore.getState()

    // Update metrics
    audioState.updateMetrics()

    // Update rotation
    vizState.updateRotation(time)
    vizState.incrementColorOffset()

    // Get updated state after mutations
    const { dataArray, bufferLength, bass, mid, high, average, beatIntensity, isBeat } = useAudioStore.getState()
    const { currentMode, colorScheme, colorOffset, rotation } = useVisualizerStore.getState()

    // Clear with fade effect (matches surface-0: #050505)
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create visualization context
    const context: VisualizationContext = {
      ctx,
      width: canvas.width,
      height: canvas.height,
      dataArray,
      bufferLength,
      metrics: { bass, mid, high, average, beatIntensity, isBeat },
      colorScheme,
      colorOffset,
      rotation,
      time,
      getColor: (value: number, offset?: number) => getColor(value, colorOffset, offset),
    }

    // Draw current visualization
    drawVisualization(currentMode, context)

    // Post-processing
    if (postProcessorRef.current) {
      postProcessorRef.current.render(time, bass)
    }
  }, [])

  const { start, stop } = useAnimationLoop({ onFrame })

  // Start/stop animation based on playing state
  useEffect(() => {
    const unsub = useUIStore.subscribe((state) => {
      if (state.isPlaying) {
        start()
      } else {
        stop()
      }
    })
    // Check initial state
    if (useUIStore.getState().isPlaying) {
      start()
    }
    return unsub
  }, [start, stop])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        useUIStore.getState().togglePlaying()
      } else if (e.code === 'KeyC') {
        useVisualizerStore.getState().nextColorScheme()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="fixed inset-0 z-[1]">
      <canvas
        ref={canvasRef}
        id="visualizer"
        className="absolute inset-0 w-full h-full block"
      />
      <canvas
        ref={postCanvasRef}
        id="postprocess"
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
    </div>
  )
}
