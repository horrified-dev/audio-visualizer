'use client'

import { useFXStore } from '@/store/fxStore'
import { useUIStore } from '@/store/uiStore'

export function FXPanel() {
  const { showFXPanel } = useUIStore()
  const {
    enabled,
    bloom,
    chromatic,
    vignette,
    grain,
    colorGrade,
    audioReactive,
    setEnabled,
    toggleEffect,
  } = useFXStore()

  if (!showFXPanel) return null

  const effects = [
    { key: 'bloom' as const, label: 'Bloom', checked: bloom },
    { key: 'chromatic' as const, label: 'Chromatic', checked: chromatic },
    { key: 'vignette' as const, label: 'Vignette', checked: vignette },
    { key: 'grain' as const, label: 'Grain', checked: grain },
    { key: 'colorGrade' as const, label: 'Color', checked: colorGrade },
    { key: 'audioReactive' as const, label: 'Reactive', checked: audioReactive },
  ]

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-10 bg-surface-1/80 border border-surface-4 rounded-lg backdrop-blur-sm p-3 pointer-events-auto min-w-[130px]">
      <div className="text-xs text-text-secondary mb-2 pb-2 border-b border-surface-4">
        Effects
      </div>

      {/* Master toggle */}
      <label className="flex items-center gap-2 py-1.5 cursor-pointer mb-2 pb-2 border-b border-surface-4">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => setEnabled(e.target.checked)}
          className="appearance-none w-3.5 h-3.5 border border-surface-4 rounded cursor-pointer relative transition-all bg-surface-2 checked:bg-accent checked:border-accent"
        />
        <span className="text-xs font-medium text-text-primary">Enable</span>
      </label>

      {/* Individual effects */}
      {effects.map(effect => (
        <label
          key={effect.key}
          className={`flex items-center gap-2 py-1 cursor-pointer transition-colors ${
            !enabled ? 'opacity-40 pointer-events-none' : 'hover:text-text-primary'
          }`}
        >
          <input
            type="checkbox"
            checked={effect.checked}
            onChange={() => toggleEffect(effect.key)}
            disabled={!enabled}
            className="appearance-none w-3 h-3 border border-surface-4 rounded cursor-pointer relative transition-all bg-surface-2 checked:bg-accent checked:border-accent"
          />
          <span className="text-xs text-text-secondary">{effect.label}</span>
        </label>
      ))}
    </div>
  )
}
