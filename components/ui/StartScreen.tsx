'use client'

import { useUIStore } from '@/store/uiStore'

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const { showStartScreen } = useUIStore()

  if (!showStartScreen) return null

  return (
    <div className="fixed inset-0 bg-surface-0 z-[1000] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-text-primary mb-2">
          Audio Visualizer
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Real-time audio visualization
        </p>

        {/* Photosensitivity warning */}
        <div className="mb-8 px-4 py-3 bg-surface-2 border border-surface-4 rounded-md max-w-sm mx-auto">
          <p className="text-xs text-text-secondary">
            <span className="text-amber-400 font-medium">Warning:</span> This application contains flashing lights and rapid visual effects that may cause discomfort or seizures for people with photosensitive epilepsy.
          </p>
        </div>

        <button
          onClick={onStart}
          className="px-8 py-3 text-sm font-medium bg-surface-3 text-text-primary border border-surface-4 rounded-md hover:bg-surface-4 hover:border-text-tertiary transition-colors"
        >
          Start
        </button>
      </div>
      <p className="absolute bottom-8 text-xs text-text-tertiary text-center">
        Select your audio source to begin
      </p>
    </div>
  )
}
