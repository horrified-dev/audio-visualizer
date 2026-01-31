'use client'

import { Play, Pause, Palette, Mic, Github } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useVisualizerStore } from '@/store/visualizerStore'
import { useAudioStore } from '@/store/audioStore'

export function ControlBar() {
  const { isPlaying, togglePlaying, setShowDeviceModal } = useUIStore()
  const { nextColorScheme } = useVisualizerStore()
  const { isConnected } = useAudioStore()

  return (
    <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center items-end px-4 pointer-events-none">
      {/* Main controls */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={() => setShowDeviceModal(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-md transition-colors ${
            isConnected
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-surface-2 border-surface-4 text-text-secondary hover:text-text-primary hover:border-text-tertiary'
          }`}
        >
          <Mic size={16} />
          {isConnected ? 'Connected' : 'Audio'}
        </button>

        <button
          onClick={togglePlaying}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-surface-2 border border-surface-4 text-text-secondary rounded-md hover:text-text-primary hover:border-text-tertiary transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={nextColorScheme}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-surface-2 border border-surface-4 text-text-secondary rounded-md hover:text-text-primary hover:border-text-tertiary transition-colors"
        >
          <Palette size={16} />
          Colors
        </button>
      </div>

      {/* GitHub link */}
      <a
        href="https://github.com/horrified-dev/audio-visualizer"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-4 bottom-0 flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors pointer-events-auto"
      >
        <Github size={14} />
        <span>GitHub</span>
      </a>
    </div>
  )
}
