'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer'

export function DeviceModal() {
  const { showDeviceModal, setShowDeviceModal } = useUIStore()
  const { devices, isLoading, error, enumerateDevices, selectDevice } = useAudioAnalyzer()

  useEffect(() => {
    if (showDeviceModal) {
      enumerateDevices()
    }
  }, [showDeviceModal, enumerateDevices])

  const handleSelectDevice = async (deviceId: string) => {
    await selectDevice(deviceId)
    setShowDeviceModal(false)
  }

  if (!showDeviceModal) return null

  return (
    <div className="fixed inset-0 bg-surface-0/95 z-[2000] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-surface-1 border border-surface-4 rounded-lg p-6 max-w-md w-[90%] relative">
        <button
          onClick={() => setShowDeviceModal(false)}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-medium text-text-primary mb-1">
          Select Audio Source
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Choose an input device. Monitor sources capture system audio.
        </p>

        <div className="max-h-[300px] overflow-y-auto space-y-1 scrollbar-thin">
          {isLoading && (
            <div className="text-text-tertiary p-3 text-sm">Scanning devices...</div>
          )}
          {error && (
            <div className="text-red-400 p-3 text-sm">Error: {error}</div>
          )}
          {!isLoading && !error && devices.length === 0 && (
            <div className="text-text-tertiary p-3 text-sm">No devices found</div>
          )}
          {devices.map(device => (
            <div
              key={device.deviceId}
              onClick={() => handleSelectDevice(device.deviceId)}
              className={`p-3 rounded cursor-pointer transition-colors text-sm ${
                device.isMonitor
                  ? 'bg-accent/5 border border-accent/20 text-text-primary hover:bg-accent/10'
                  : 'bg-surface-2 border border-surface-4 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
              }`}
            >
              {device.isMonitor && <span className="text-accent mr-1.5">*</span>}
              {device.label}
            </div>
          ))}
        </div>

        {devices.some(d => d.isMonitor) && (
          <p className="text-xs text-text-tertiary mt-4">
            <span className="text-accent">*</span> Recommended for system audio
          </p>
        )}
      </div>
    </div>
  )
}
