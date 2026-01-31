'use client'

import { create } from 'zustand'

interface AudioState {
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  dataArray: Uint8Array<ArrayBuffer>
  bufferLength: number
  isConnected: boolean
  deviceId: string | null

  // Metrics (smoothed)
  bass: number
  mid: number
  high: number
  average: number

  // Beat detection
  beatIntensity: number
  isBeat: boolean

  // Internal state for smoothing
  _smoothedBass: number
  _smoothedMid: number
  _smoothedHigh: number
  _bassHistory: number[]
  _lastBeatTime: number
  _lastCalcFrame: number
  _frameCount: number
}

interface AudioActions {
  initAudio: () => void
  connectDevice: (deviceId: string) => Promise<void>
  updateMetrics: () => void
  disconnect: () => void
}

const SMOOTH_UP = 0.15
const SMOOTH_DOWN = 0.08
const BASS_HISTORY_SIZE = 30

export const useAudioStore = create<AudioState & AudioActions>((set, get) => ({
  audioContext: null,
  analyser: null,
  dataArray: new Uint8Array(256),
  bufferLength: 256,
  isConnected: false,
  deviceId: null,

  bass: 0,
  mid: 0,
  high: 0,
  average: 0,
  beatIntensity: 0,
  isBeat: false,

  _smoothedBass: 0,
  _smoothedMid: 0,
  _smoothedHigh: 0,
  _bassHistory: new Array(BASS_HISTORY_SIZE).fill(0),
  _lastBeatTime: 0,
  _lastCalcFrame: 0,
  _frameCount: 0,

  initAudio: () => {
    // Initialize with demo data for when no audio is connected
    const bufferLength = 256
    const dataArray = new Uint8Array(bufferLength)
    set({ dataArray, bufferLength })
  },

  connectDevice: async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.8

      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      set({
        audioContext,
        analyser,
        dataArray,
        bufferLength,
        isConnected: true,
        deviceId,
      })
    } catch (error) {
      console.error('Audio capture failed:', error)
      throw error
    }
  },

  updateMetrics: () => {
    const state = get()
    const { analyser, dataArray, bufferLength, _frameCount, _lastCalcFrame } = state

    // Update frame count
    const newFrameCount = _frameCount + 1
    set({ _frameCount: newFrameCount })

    if (analyser) {
      analyser.getByteFrequencyData(dataArray)
    } else {
      // Demo animation when no audio
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.sin(i * 0.1 + Date.now() * 0.002) * 50 +
                       Math.sin(i * 0.05 + Date.now() * 0.001) * 30 + 80
      }
    }

    // Only recalculate every 2 frames for performance
    if (newFrameCount - _lastCalcFrame <= 1) return

    // Calculate frequency bands
    const bassEnd = Math.floor(bufferLength * 0.1)
    const midEnd = Math.floor(bufferLength * 0.5)

    // Bass (0-10% of frequency bins)
    let bassSum = 0
    for (let i = 0; i < bassEnd; i++) {
      bassSum += dataArray[i]
    }
    const rawBass = bassSum / bassEnd / 255

    // Mid (10-50% of frequency bins)
    let midSum = 0
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += dataArray[i]
    }
    const rawMid = midSum / (midEnd - bassEnd) / 255

    // High (50-100% of frequency bins)
    let highSum = 0
    for (let i = midEnd; i < bufferLength; i++) {
      highSum += dataArray[i]
    }
    const rawHigh = highSum / (bufferLength - midEnd) / 255

    // Average
    let totalSum = 0
    for (let i = 0; i < bufferLength; i++) {
      totalSum += dataArray[i]
    }
    const average = totalSum / bufferLength / 255

    // Apply smoothing (fast attack, slow release)
    const bassSmooth = rawBass > state._smoothedBass ? SMOOTH_UP : SMOOTH_DOWN
    const midSmooth = rawMid > state._smoothedMid ? SMOOTH_UP : SMOOTH_DOWN
    const highSmooth = rawHigh > state._smoothedHigh ? SMOOTH_UP : SMOOTH_DOWN

    const smoothedBass = state._smoothedBass + (rawBass - state._smoothedBass) * bassSmooth
    const smoothedMid = state._smoothedMid + (rawMid - state._smoothedMid) * midSmooth
    const smoothedHigh = state._smoothedHigh + (rawHigh - state._smoothedHigh) * highSmooth

    // Update bass history for beat detection
    const newBassHistory = [...state._bassHistory.slice(1), rawBass]

    // Beat detection
    const avgBass = newBassHistory.reduce((a, b) => a + b, 0) / BASS_HISTORY_SIZE
    const threshold = Math.max(0.4, avgBass * 1.4)
    const currentTime = Date.now()
    const isBeat = smoothedBass > threshold &&
                   smoothedBass > avgBass * 1.2 &&
                   currentTime - state._lastBeatTime > 100

    // Beat intensity
    const beatIntensity = Math.min(1, Math.max(0, (smoothedBass - avgBass) / 0.5 + smoothedBass))

    set({
      bass: smoothedBass,
      mid: smoothedMid,
      high: smoothedHigh,
      average,
      beatIntensity,
      isBeat,
      _smoothedBass: smoothedBass,
      _smoothedMid: smoothedMid,
      _smoothedHigh: smoothedHigh,
      _bassHistory: newBassHistory,
      _lastBeatTime: isBeat ? currentTime : state._lastBeatTime,
      _lastCalcFrame: newFrameCount,
    })
  },

  disconnect: () => {
    const { audioContext } = get()
    if (audioContext) {
      audioContext.close()
    }
    set({
      audioContext: null,
      analyser: null,
      isConnected: false,
      deviceId: null,
    })
  },
}))
