'use client'

import { useCallback, useState } from 'react'
import { useAudioStore } from '@/store/audioStore'

interface AudioDevice {
  deviceId: string
  label: string
  isMonitor: boolean
}

export function useAudioAnalyzer() {
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { connectDevice, disconnect, isConnected } = useAudioStore()

  const enumerateDevices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices.filter(d => d.kind === 'audioinput')

      const formattedDevices: AudioDevice[] = audioInputs.map(device => {
        const label = device.label || `Audio Input ${device.deviceId.slice(0, 8)}`
        const isMonitor = label.toLowerCase().includes('monitor')

        return {
          deviceId: device.deviceId,
          label,
          isMonitor,
        }
      })

      // Sort devices - put monitor sources first
      formattedDevices.sort((a, b) => {
        if (a.isMonitor && !b.isMonitor) return -1
        if (!a.isMonitor && b.isMonitor) return 1
        return 0
      })

      setDevices(formattedDevices)
    } catch (err) {
      console.error('Device enumeration failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to enumerate devices')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectDevice = useCallback(async (deviceId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await connectDevice(deviceId)
    } catch (err) {
      console.error('Failed to connect device:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to device')
    } finally {
      setIsLoading(false)
    }
  }, [connectDevice])

  return {
    devices,
    isLoading,
    error,
    isConnected,
    enumerateDevices,
    selectDevice,
    disconnect,
  }
}
