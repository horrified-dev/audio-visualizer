'use client'

import { useRef, useCallback, useEffect } from 'react'

interface AnimationLoopOptions {
  onFrame: (time: number, deltaTime: number) => void
  targetFPS?: number
}

export function useAnimationLoop({ onFrame, targetFPS = 60 }: AnimationLoopOptions) {
  const frameIdRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const isRunningRef = useRef(false)
  const frameInterval = 1000 / targetFPS

  const loop = useCallback((currentTime: number) => {
    if (!isRunningRef.current) return

    const deltaTime = currentTime - lastTimeRef.current

    // Frame rate limiting with some tolerance
    if (deltaTime >= frameInterval * 0.8) {
      onFrame(currentTime, deltaTime)
      lastTimeRef.current = currentTime
    }

    frameIdRef.current = requestAnimationFrame(loop)
  }, [onFrame, frameInterval])

  const start = useCallback(() => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    lastTimeRef.current = performance.now()
    frameIdRef.current = requestAnimationFrame(loop)
  }, [loop])

  const stop = useCallback(() => {
    isRunningRef.current = false
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current)
      frameIdRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { start, stop, isRunning: isRunningRef.current }
}
