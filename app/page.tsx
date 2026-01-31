'use client'

import { useCallback } from 'react'
import { VisualizerCanvas } from '@/components/visualizer/VisualizerCanvas'
import { StartScreen } from '@/components/ui/StartScreen'
import { DeviceModal } from '@/components/ui/DeviceModal'
import { ModeSelector } from '@/components/ui/ModeSelector'
import { FXPanel } from '@/components/ui/FXPanel'
import { TopBar } from '@/components/ui/TopBar'
import { ControlBar } from '@/components/ui/ControlBar'
import { useUIStore } from '@/store/uiStore'

export default function Home() {
  const { hideStartScreen, setShowDeviceModal } = useUIStore()

  const handleStart = useCallback(() => {
    hideStartScreen()
    setShowDeviceModal(true)
  }, [hideStartScreen, setShowDeviceModal])

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-0">
      {/* Visualizer Canvas */}
      <VisualizerCanvas />

      {/* UI Overlays */}
      <TopBar />
      <ControlBar />
      <ModeSelector />
      <FXPanel />

      {/* Modals */}
      <StartScreen onStart={handleStart} />
      <DeviceModal />
    </main>
  )
}
