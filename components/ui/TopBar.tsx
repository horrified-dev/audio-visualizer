'use client'

import { useAudioStore } from '@/store/audioStore'

export function TopBar() {
  const { isConnected } = useAudioStore()

  return (
    <div className="fixed top-0 left-0 right-0 z-10 px-6 py-4 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-medium text-text-primary tracking-tight">
          Visualizer
        </h1>
        <span className={`text-xs px-2 py-0.5 rounded ${
          isConnected
            ? 'bg-accent/10 text-accent'
            : 'bg-surface-3 text-text-tertiary'
        }`}>
          {isConnected ? 'Connected' : 'No input'}
        </span>
      </div>
    </div>
  )
}
