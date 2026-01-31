import type { ColorScheme } from '@/types'

// Minimal, desaturated color schemes
export const COLOR_SCHEMES: ColorScheme[] = [
  { primary: '#4a9eff', secondary: '#6366f1', tertiary: '#8b5cf6' }, // Blue-violet
  { primary: '#22d3ee', secondary: '#06b6d4', tertiary: '#0ea5e9' }, // Cyan
  { primary: '#a78bfa', secondary: '#c084fc', tertiary: '#e879f9' }, // Purple
  { primary: '#f472b6', secondary: '#ec4899', tertiary: '#db2777' }, // Pink
  { primary: '#ffffff', secondary: '#a1a1aa', tertiary: '#71717a' }, // Grayscale
]

export function getColor(value: number, colorOffset: number, offset: number = 0): string {
  const hue = (value / 255 * 360 + offset + colorOffset) % 360
  // Slightly desaturated, softer colors
  return `hsl(${hue}, 70%, ${45 + value / 8}%)`
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
